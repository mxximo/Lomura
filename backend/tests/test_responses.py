import csv
import io
import sqlite3
import os
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.content_store import questions
from app.storage import database


@pytest.fixture(params=["sqlite", "postgres"])
def client(tmp_path, monkeypatch, request):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("RENDER", raising=False)
    if request.param == "postgres":
        test_url = os.getenv("TEST_POSTGRES_URL")
        if not test_url:
            pytest.skip("TEST_POSTGRES_URL needed for PostgreSQL integration tests")
        monkeypatch.setenv("DATABASE_URL", test_url)
        with database() as db:
            db.execute("TRUNCATE responses, sessions, login_limits")
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    monkeypatch.setenv("ADMIN_PASSWORD", "test-only-long-password")
    with TestClient(app) as c:
        yield c


def survey(**changes):
    return dict(submission_id=str(uuid4()), language="es", screen_hours=6, breaks="sometimes",
                sleep="rarely", usefulness=5, goal="focus", comment="", consent=True, **changes)


def login(client):
    response = client.post("/api/admin/login", json={"password": "test-only-long-password"})
    assert response.status_code == 200
    assert "httponly" in response.headers["set-cookie"].lower()
    assert "samesite=strict" in response.headers["set-cookie"].lower()


def test_persistence_idempotency_and_private_export(client):
    payload = survey()
    first = client.post("/api/surveys", json=payload)
    assert first.status_code == 201
    assert client.post("/api/surveys", json=payload).json() == first.json()
    assert client.post("/api/surveys", json={**payload, "screen_hours": 10}).status_code == 409
    assert client.get("/api/admin/responses").status_code == 401
    assert client.get("/api/admin/export").status_code == 401
    login(client)
    data = client.get("/api/admin/responses").json()
    assert data["total"] == 1
    assert data["items"][0]["payload"]["screen_hours"] == 6
    assert "no-store" in client.get("/api/admin/responses").headers["cache-control"]
    client.post("/api/admin/logout")
    assert client.get("/api/admin/export").status_code == 401
    with database() as db:
        assert db.execute("SELECT COUNT(*) AS count FROM responses").fetchone()["count"] == 1


@pytest.mark.parametrize("change", [{"consent":False}, {"screen_hours":25}, {"usefulness":0}, {"goal":"other"}, {"comment":"x"*1001}, {"name":"private"}])
def test_survey_validation(client, change):
    assert client.post("/api/surveys", json={**survey(), **change}).status_code == 422


def test_quiz_only_saves_complete_attempts(client):
    answers = [{"question_id":q.id, "option_id":q.correct_option} for q in questions]
    client.post("/api/quiz/submit", json={"answers":answers})
    payload = {"answers":answers, "submission_id":str(uuid4()), "language":"en"}
    assert client.post("/api/quiz/complete", json={**payload, "answers":answers[:1]}).status_code == 422
    result = client.post("/api/quiz/complete", json=payload).json()
    assert result["score"] == result["total"] == 10
    assert client.post("/api/quiz/complete", json=payload).json()["receipt"] == result["receipt"]
    login(client)
    data = client.get("/api/admin/responses?kind=quiz").json()
    assert data["total"] == 1 and data["stats"][0]["average"] == 100
    assert len(data["items"][0]["payload"]["answers"]) == 10


def test_export_filters_utf8_and_csv_injection(client):
    client.post("/api/surveys", json={**survey(), "comment":" =HYPERLINK(\"malicious\")"})
    client.post("/api/surveys", json={**survey(), "comment":"Más pausas; más atención\nGracias"})
    login(client)
    response = client.get("/api/admin/export?kind=survey")
    assert response.status_code == 200 and response.text.startswith("\ufeff")
    rows = list(csv.DictReader(io.StringIO(response.text.lstrip("\ufeff")), delimiter=";"))
    assert len(rows) == 2
    assert any(r["comment"].startswith("' =HYPERLINK") for r in rows)
    assert any("atención\nGracias" in r["comment"] for r in rows)
    assert client.get("/api/admin/responses?start=2000-01-01&end=2000-01-02").json()["total"] == 0
    assert client.get("/api/admin/responses?start=2026-10-01&end=2026-01-01").status_code == 422
    assert client.get("/api/admin/responses?kind=invalid").status_code == 422


def test_filtered_analysis_readable_export_and_dictionary(client):
    client.post("/api/surveys", json={**survey(), "goal": "eyes", "usefulness": 2})
    client.post("/api/surveys", json={**survey(), "goal": "focus", "usefulness": 5})
    answers = [{"question_id": q.id, "option_id": q.correct_option} for q in questions]
    answers[0]["option_id"] = next(o.id for o in questions[0].options if o.id != questions[0].correct_option)
    client.post("/api/quiz/complete", json={"answers": answers, "submission_id": str(uuid4()), "language": "es"})
    assert client.get("/api/admin/dictionary").status_code == 401
    login(client)
    report = client.get("/api/admin/responses").json()
    assert report["analysis"]["goals"] == {"eyes": 1, "focus": 1}
    assert report["analysis"]["usefulness"] == {"2": 1, "5": 1}
    assert report["analysis"]["questions"][0]["correct"] == 0
    assert report["analysis"]["questions"][0]["answered"] == 1
    assert client.get("/api/admin/responses?kind=quiz").json()["analysis"]["goals"] == {}
    assert client.get("/api/admin/responses?kind=survey").json()["analysis"]["questions"] == []
    assert client.get("/api/admin/responses?end=2000-01-01").json()["analysis"]["goals"] == {}
    export = client.get("/api/admin/export?format=readable&language=en&kind=quiz").text
    assert questions[0].prompt.en in export and "Screen hours" in export
    assert questions[1].options[next(i for i,o in enumerate(questions[1].options) if o.id == questions[1].correct_option)].text.en in export
    dictionary = client.get("/api/admin/dictionary?language=en").text
    assert "Daily screen hours" in dictionary and "Visual rest" in dictionary
    with database() as db:
        db.execute("UPDATE responses SET questionnaire_version=NULL WHERE kind='quiz'")
    assert client.get("/api/admin/responses").json()["analysis"]["excluded_quizzes"] == 1
    assert client.get("/api/admin/responses").json()["analysis"]["questions"] == []


def test_legacy_database_migration_keeps_existing_responses(client):
    if os.getenv("DATABASE_URL"):
        pytest.skip("Legacy migration applies only to SQLite files")
    path = os.path.join(os.environ["DATA_DIR"], "responses.sqlite3")
    with sqlite3.connect(path) as db:
        db.execute("CREATE TABLE responses (id TEXT PRIMARY KEY, kind TEXT NOT NULL, created_at TEXT NOT NULL, language TEXT NOT NULL, payload TEXT NOT NULL, score INTEGER, total INTEGER)")
        db.execute("INSERT INTO responses VALUES ('old', 'quiz', '2026-01-01T00:00:00+00:00', 'es', '{\"answers\":[]}', 8, 10)")
    login(client)
    data = client.get("/api/admin/responses").json()
    assert data["total"] == 1 and data["items"][0]["id"] == "old"
    assert data["items"][0]["questionnaire_version"] is None
    assert data["analysis"]["excluded_quizzes"] == 1


def test_login_limits_csrf_rotation_and_fail_closed(client, monkeypatch):
    assert client.post("/api/admin/login", json={"password":"test-only-long-password"}, headers={"origin":"https://attacker.example"}).status_code == 403
    for _ in range(5):
        assert client.post("/api/admin/login", json={"password":"wrong"}).status_code == 401
    assert client.post("/api/admin/login", json={"password":"test-only-long-password"}).status_code == 429
    with database() as db:
        db.execute("DELETE FROM login_limits")
    login(client)
    monkeypatch.setenv("ADMIN_PASSWORD", "another-long-password")
    assert client.get("/api/admin/responses").status_code == 401
    monkeypatch.delenv("ADMIN_PASSWORD")
    assert client.post("/api/admin/login", json={"password":"wrong"}).status_code == 503


def test_secure_cookie_and_pagination(client):
    for _ in range(21):
        client.post("/api/surveys", json=survey())
    login(client)
    assert len(client.get("/api/admin/responses").json()["items"]) == 20
    assert len(client.get("/api/admin/responses?page=2").json()["items"]) == 1
    with TestClient(app, base_url="https://testserver") as secure:
        response = secure.post("/api/admin/login", json={"password":"test-only-long-password"})
        assert "Secure" in response.headers["set-cookie"]
