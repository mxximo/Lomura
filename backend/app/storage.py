"""PostgreSQL in hosting; SQLite remains available for local development."""
import hashlib
import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from urllib.parse import urlparse
from fastapi import HTTPException
import psycopg
from psycopg.rows import dict_row

_initialized_postgres = set()
_schema_lock = Lock()


class PostgresDatabase:
    """Translate the application's parameterized SQLite-style queries."""
    def __init__(self, connection):
        self.connection = connection

    def execute(self, query, parameters=()):
        return self.connection.execute(query.replace("?", "%s"), parameters)


def postgres_connection(url):
    parsed = urlparse(url)
    if parsed.scheme not in {"postgres", "postgresql"} or not parsed.hostname:
        raise HTTPException(503, "Configure a valid PostgreSQL DATABASE_URL")
    # Local integration tests don't need TLS; remote connections always do.
    sslmode = "disable" if parsed.hostname in {"localhost", "127.0.0.1", "::1"} else "require"
    connection = psycopg.connect(url, connect_timeout=10, sslmode=sslmode,
                                row_factory=dict_row, prepare_threshold=None)
    try:
        connection.execute("SET statement_timeout = '15s'")
        connection.execute("SET lock_timeout = '5s'")
        with _schema_lock:
            if url not in _initialized_postgres:
                # Serialize schema setup across separate API processes.
                connection.execute("SELECT pg_advisory_xact_lock(727104233)")
                connection.execute("CREATE SCHEMA IF NOT EXISTS lumora")
                connection.execute("SET search_path TO lumora, pg_catalog")
                for statement in (
                    "CREATE TABLE IF NOT EXISTS responses (id TEXT PRIMARY KEY, kind TEXT NOT NULL, created_at TEXT NOT NULL, language TEXT NOT NULL, payload TEXT NOT NULL, score INTEGER, total INTEGER, questionnaire_version TEXT)",
                    "ALTER TABLE responses ADD COLUMN IF NOT EXISTS questionnaire_version TEXT",
                    "CREATE INDEX IF NOT EXISTS responses_date ON responses(created_at)",
                    "CREATE TABLE IF NOT EXISTS sessions (digest TEXT PRIMARY KEY, expires DOUBLE PRECISION NOT NULL, credential TEXT NOT NULL)",
                    "CREATE TABLE IF NOT EXISTS login_limits (address TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset DOUBLE PRECISION NOT NULL)",
                ):
                    connection.execute(statement)
                connection.commit()
                _initialized_postgres.add(url)
        # Tables live outside Supabase's default public Data API schema.
        connection.execute("SET search_path TO lumora, pg_catalog")
        return connection
    except Exception:
        connection.close()
        raise


@contextmanager
def database():
    url = os.getenv("DATABASE_URL", "").strip()
    if url:
        connection = None
        try:
            connection = postgres_connection(url)
            yield PostgresDatabase(connection)
            connection.commit()
        except psycopg.Error:
            if connection:
                connection.rollback()
            # Never fall back to ephemeral SQLite or expose connection details.
            raise HTTPException(503, "Database unavailable. Please try again later") from None
        except Exception:
            if connection:
                connection.rollback()
            raise
        finally:
            if connection:
                connection.close()
        return
    if os.getenv("RENDER") == "true":
        raise HTTPException(503, "Configure DATABASE_URL for persistent storage on Render")
    directory = Path(os.getenv("DATA_DIR", str(Path(__file__).resolve().parents[1] / "storage")))
    directory.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(directory / "responses.sqlite3", timeout=20)
    connection.row_factory = sqlite3.Row
    try:
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS responses (
                id TEXT PRIMARY KEY, kind TEXT NOT NULL, created_at TEXT NOT NULL,
                language TEXT NOT NULL, payload TEXT NOT NULL, score INTEGER, total INTEGER);
            CREATE INDEX IF NOT EXISTS responses_date ON responses(created_at);
            CREATE TABLE IF NOT EXISTS sessions (
                digest TEXT PRIMARY KEY, expires REAL NOT NULL, credential TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS login_limits (
                address TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset REAL NOT NULL);
        """)
        if "questionnaire_version" not in {r[1] for r in connection.execute("PRAGMA table_info(responses)")}:
            connection.execute("ALTER TABLE responses ADD COLUMN questionnaire_version TEXT")
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def save_response(identifier, kind, language, payload, score=None, total=None, questionnaire_version=None):
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    with database() as db:
        db.execute("INSERT INTO responses (id,kind,created_at,language,payload,score,total,questionnaire_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING",
                   (str(identifier), kind, datetime.now(timezone.utc).isoformat(), language, encoded, score, total, questionnaire_version))
        row = db.execute("SELECT * FROM responses WHERE id=?", (str(identifier),)).fetchone()
        if row["kind"] != kind or row["payload"] != encoded or row["language"] != language:
            raise HTTPException(409, "Submission identifier already used")
    return {"id": row["id"], "created_at": row["created_at"]}


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()
