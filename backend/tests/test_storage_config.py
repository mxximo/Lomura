import psycopg
import pytest
from fastapi import HTTPException
from app import storage


def test_render_requires_remote_database(monkeypatch, tmp_path):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("RENDER", "true")
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    with pytest.raises(HTTPException) as error:
        with storage.database():
            pytest.fail("Render must not use an ephemeral database")
    assert error.value.status_code == 503
    assert not (tmp_path / "responses.sqlite3").exists()


def test_postgres_outage_never_falls_back_or_exposes_credentials(monkeypatch, tmp_path):
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:private-password@db.example/postgres")
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    def unavailable(*args, **kwargs):
        raise psycopg.OperationalError("private connection details")
    monkeypatch.setattr(storage.psycopg, "connect", unavailable)
    with pytest.raises(HTTPException) as error:
        with storage.database():
            pytest.fail("An unavailable database must not acknowledge a submission")
    assert error.value.status_code == 503
    assert "private" not in error.value.detail
    assert not (tmp_path / "responses.sqlite3").exists()


def test_remote_connection_requires_tls(monkeypatch):
    observed = {}
    def refused(url, **options):
        observed.update(options)
        raise psycopg.OperationalError("unavailable")
    monkeypatch.setattr(storage.psycopg, "connect", refused)
    with pytest.raises(psycopg.OperationalError):
        storage.postgres_connection("postgresql://user:password@db.example/postgres?sslmode=disable")
    assert observed["sslmode"] == "require"
    assert observed["prepare_threshold"] is None


def test_invalid_database_url_is_rejected(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "https://example.supabase.co")
    with pytest.raises(HTTPException) as error:
        with storage.database():
            pytest.fail("A Supabase project URL is not a database connection URI")
    assert error.value.status_code == 503
