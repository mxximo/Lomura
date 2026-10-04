"""Persistent anonymous responses. Keep DATA_DIR on a persistent volume."""
import hashlib
import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from fastapi import HTTPException


@contextmanager
def database():
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
        db.execute("INSERT OR IGNORE INTO responses (id,kind,created_at,language,payload,score,total,questionnaire_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                   (str(identifier), kind, datetime.now(timezone.utc).isoformat(), language, encoded, score, total, questionnaire_version))
        row = db.execute("SELECT * FROM responses WHERE id=?", (str(identifier),)).fetchone()
        if row["kind"] != kind or row["payload"] != encoded or row["language"] != language:
            raise HTTPException(409, "Submission identifier already used")
    return {"id": row["id"], "created_at": row["created_at"]}


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()
