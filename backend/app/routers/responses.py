import csv
import io
import json
import os
import secrets
import time
import hashlib
from collections import Counter
from datetime import date
from typing import Literal
from uuid import UUID
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import StreamingResponse
from pydantic import Field
from ..schemas.models import StrictModel, Submission
from ..content_store import questions
from ..storage import database, digest, save_response
from .quiz import submit_quiz

router = APIRouter()
COOKIE = "dw_admin"
QUIZ_VERSION = hashlib.sha256(json.dumps([q.model_dump(mode="json") for q in questions], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:12]
SURVEY_VERSION = "survey-v1"
GOAL_LABELS = {"es": ["Descanso visual", "Postura y movimiento", "Seguridad digital", "Concentración", "Descanso y sueño"], "en": ["Visual rest", "Posture and movement", "Digital security", "Focus", "Rest and sleep"]}
FREQUENCY_LABELS = {"es": {"often": "Casi siempre", "sometimes": "A veces", "rarely": "Casi nunca"}, "en": {"often": "Almost always", "sometimes": "Sometimes", "rarely": "Almost never"}}
GOALS = ["eyes", "posture", "security", "focus", "sleep"]


class CompletedQuiz(Submission):
    submission_id: UUID
    language: Literal["es", "en"] = "es"


class Survey(StrictModel):
    submission_id: UUID
    language: Literal["es", "en"] = "es"
    screen_hours: int = Field(ge=0, le=24)
    breaks: Literal["often", "sometimes", "rarely"]
    sleep: Literal["often", "sometimes", "rarely"]
    usefulness: int = Field(ge=1, le=5)
    goal: Literal["eyes", "posture", "security", "focus", "sleep"]
    comment: str = Field(default="", max_length=1000)
    consent: Literal[True]


class Login(StrictModel):
    password: str = Field(min_length=1, max_length=256)


def same_origin(request: Request):
    origin = request.headers.get("origin")
    if origin and urlparse(origin).netloc != request.headers.get("host"):
        raise HTTPException(403, "Cross-origin request rejected")


def credential():
    password = os.getenv("ADMIN_PASSWORD", "")
    if len(password) < 12:
        raise HTTPException(503, "Configure ADMIN_PASSWORD with at least 12 characters")
    return password


def require_admin(request: Request):
    password = credential()
    token = request.cookies.get(COOKIE, "")
    with database() as db:
        db.execute("DELETE FROM sessions WHERE expires < ?", (time.time(),))
        row = db.execute("SELECT * FROM sessions WHERE digest=?", (digest(token),)).fetchone()
    if not row or not secrets.compare_digest(row["credential"], digest(password)):
        raise HTTPException(401, "Sign in required")


@router.post("/quiz/complete")
def complete_quiz(payload: CompletedQuiz):
    if {a.question_id for a in payload.answers} != {q.id for q in questions}:
        raise HTTPException(422, "A complete quiz is required")
    result = submit_quiz(Submission(answers=payload.answers))
    receipt = save_response(payload.submission_id, "quiz", payload.language,
                            {"answers": [a.model_dump() for a in payload.answers]}, result.score, result.total, QUIZ_VERSION)
    return {**result.model_dump(), "receipt": receipt}


@router.post("/surveys", status_code=201)
def create_survey(payload: Survey):
    return save_response(payload.submission_id, "survey", payload.language,
                         payload.model_dump(exclude={"submission_id", "language"}), questionnaire_version=SURVEY_VERSION)


@router.post("/admin/login", dependencies=[Depends(same_origin)])
def login(payload: Login, request: Request, response: Response):
    password = credential()
    address = digest(request.client.host if request.client else "unknown")
    now = time.time()
    with database() as db:
        db.execute("DELETE FROM login_limits WHERE reset < ?", (now,))
        db.execute("INSERT OR IGNORE INTO login_limits VALUES (?, 0, ?)", (address, now + 300))
        # Serialize concurrent guesses across all API workers.
        db.execute("UPDATE login_limits SET attempts=attempts+1 WHERE address=?", (address,))
        attempts = db.execute("SELECT attempts FROM login_limits WHERE address=?", (address,)).fetchone()[0]
    if attempts > 5:
        raise HTTPException(429, "Too many attempts. Try again in five minutes", headers={"Retry-After": "300"})
    if not secrets.compare_digest(digest(payload.password), digest(password)):
        raise HTTPException(401, "Invalid password")
    token = secrets.token_urlsafe(48)
    with database() as db:
        db.execute("DELETE FROM login_limits WHERE address=?", (address,))
        db.execute("DELETE FROM sessions WHERE expires < ?", (now,))
        db.execute("INSERT INTO sessions VALUES (?, ?, ?)", (digest(token), now + 28800, digest(password)))
    response.set_cookie(COOKIE, token, max_age=28800, httponly=True, samesite="strict",
                        secure=request.url.scheme == "https", path="/api/admin")
    return {"authenticated": True}


@router.post("/admin/logout", dependencies=[Depends(same_origin)])
def logout(request: Request, response: Response):
    with database() as db:
        db.execute("DELETE FROM sessions WHERE digest=?", (digest(request.cookies.get(COOKIE, "")),))
    response.delete_cookie(COOKIE, path="/api/admin")
    return {"authenticated": False}


def filters(kind: Literal["all", "survey", "quiz"] = "all", start: date | None = None, end: date | None = None):
    if start and end and start > end:
        raise HTTPException(422, "Invalid date range")
    clauses, values = [], []
    if kind != "all":
        clauses.append("kind=?")
        values.append(kind)
    if start:
        clauses.append("substr(created_at,1,10)>=?")
        values.append(start.isoformat())
    if end:
        clauses.append("substr(created_at,1,10)<=?")
        values.append(end.isoformat())
    return (" WHERE " + " AND ".join(clauses) if clauses else ""), values


@router.get("/admin/responses", dependencies=[Depends(require_admin)])
def list_responses(query=Depends(filters), page: int = Query(default=1, ge=1)):
    where, values = query
    with database() as db:
        total = db.execute("SELECT COUNT(*) FROM responses" + where, values).fetchone()[0]
        rows = db.execute("SELECT * FROM responses" + where + " ORDER BY created_at DESC LIMIT 20 OFFSET ?", [*values, (page-1)*20]).fetchall()
        stats = db.execute("SELECT kind, COUNT(*) count, AVG(score*100.0/total) average FROM responses" + where + " GROUP BY kind", values).fetchall()
        goals, usefulness = Counter(), Counter()
        outcomes = {q.id: {"question_id": q.id, "prompt": q.prompt.model_dump(), "answered": 0, "correct": 0} for q in questions}
        excluded = 0
        for row in db.execute("SELECT kind,payload,questionnaire_version FROM responses" + where, values):
            payload = json.loads(row["payload"])
            if row["kind"] == "survey":
                goals[payload["goal"]] += 1
                usefulness[payload["usefulness"]] += 1
            elif row["questionnaire_version"] == QUIZ_VERSION:
                for a in payload.get("answers", []):
                    q = next((q for q in questions if q.id == a["question_id"]), None)
                    if q:
                        outcomes[q.id]["answered"] += 1
                        outcomes[q.id]["correct"] += int(a["option_id"] == q.correct_option)
            else:
                excluded += 1
        analysis = {"goals": dict(goals), "usefulness": dict(usefulness), "questions": sorted([o for o in outcomes.values() if o["answered"]], key=lambda o: o["correct"] / o["answered"]), "excluded_quizzes": excluded, "quiz_version": QUIZ_VERSION}
    return {"total": total, "page": page, "stats": [dict(r) for r in stats],
            "analysis": analysis,
            "items": [{**dict(r), "payload": json.loads(r["payload"])} for r in rows]}


def csv_safe(value):
    text = str(value) if value is not None else ""
    return "'" + text if text.lstrip().startswith(("=", "+", "-", "@")) else text


@router.get("/admin/export", dependencies=[Depends(require_admin)])
def export_responses(query=Depends(filters), format: Literal["raw", "readable"] = "raw", language: Literal["es", "en"] = "es"):
    where, values = query
    def chunks():
        output = io.StringIO()
        writer = csv.writer(output, delimiter=";")
        fields = ["id", "kind", "created_at_utc", "language", "score", "total", "screen_hours", "breaks", "sleep", "usefulness", "goal", "comment", "consent"] + [q.id for q in questions] + ["questionnaire_version"]
        headers = fields if format == "raw" else (["ID", "Tipo" if language == "es" else "Type", "Fecha UTC" if language == "es" else "UTC date", "Idioma" if language == "es" else "Language", "Aciertos" if language == "es" else "Correct", "Total", "Horas de pantalla" if language == "es" else "Screen hours", "Pausas" if language == "es" else "Breaks", "Desconexión antes de dormir" if language == "es" else "Disconnecting before sleep", "Utilidad (1–5)" if language == "es" else "Usefulness (1–5)", "Hábito" if language == "es" else "Habit", "Comentario" if language == "es" else "Comment", "Consentimiento" if language == "es" else "Consent"] + [getattr(q.prompt, language) for q in questions] + ["Versión" if language == "es" else "Version"])
        writer.writerow(headers)
        yield "\ufeff" + output.getvalue()
        with database() as db:
            cursor = db.execute("SELECT * FROM responses" + where + " ORDER BY created_at DESC", values)
            for row in cursor:
                data = json.loads(row["payload"])
                answers = {a["question_id"]: a["option_id"] for a in data.get("answers", [])}
                values_out = [row["id"], row["kind"], row["created_at"], row["language"], row["score"], row["total"]]
                values_out += [data.get(key, "") for key in fields[6:13]]
                values_out += [answers.get(q.id, "") for q in questions]
                if format == "readable":
                    values_out[1] = ("Encuesta" if language == "es" else "Survey") if row["kind"] == "survey" else "Quiz"
                    for index in (7, 8):
                        values_out[index] = FREQUENCY_LABELS[language].get(values_out[index], values_out[index])
                    if values_out[10] in GOALS:
                        values_out[10] = GOAL_LABELS[language][GOALS.index(values_out[10])]
                    values_out[12] = ("Sí" if language == "es" else "Yes") if data.get("consent") else ""
                    if row["questionnaire_version"] == QUIZ_VERSION:
                        for index, q in enumerate(questions, 13):
                            option = next((o for o in q.options if o.id == values_out[index]), None)
                            if option:
                                values_out[index] = getattr(option.text, language)
                values_out += [row["questionnaire_version"] or "legacy"]
                output.seek(0)
                output.truncate(0)
                writer.writerow([csv_safe(v) for v in values_out])
                yield output.getvalue()
    return StreamingResponse(chunks(), media_type="text/csv; charset=utf-8",
                             headers={"Content-Disposition": 'attachment; filename="bienestar-respuestas.csv"'})


@router.get("/admin/dictionary", dependencies=[Depends(require_admin)])
def export_dictionary(language: Literal["es", "en"] = "es"):
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow(["category", "code", "meaning", "version"])
    for code, label in zip(GOALS, GOAL_LABELS[language]):
        writer.writerow(["goal", code, label, SURVEY_VERSION])
    for code, label in FREQUENCY_LABELS[language].items():
        writer.writerow(["breaks / sleep", code, label, SURVEY_VERSION])
    writer.writerow(["usefulness", "1–5", "1 = poco útil; 5 = muy útil" if language == "es" else "1 = not useful; 5 = very useful", SURVEY_VERSION])
    writer.writerow(["screen_hours", "0–24", "Horas diarias de pantalla" if language == "es" else "Daily screen hours", SURVEY_VERSION])
    for q in questions:
        writer.writerow(["question", q.id, getattr(q.prompt, language), QUIZ_VERSION])
        for option in q.options:
            writer.writerow([q.id, option.id, getattr(option.text, language), QUIZ_VERSION])
    return Response("\ufeff" + output.getvalue(), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": 'attachment; filename="bienestar-diccionario.csv"'})
