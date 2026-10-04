import csv
import io
import os
import time
from datetime import datetime, timezone
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from pydantic import Field, field_validator

from ..schemas.models import StrictModel
from ..storage import database, digest
from .responses import require_admin, same_origin, csv_safe

router = APIRouter()


class Comment(StrictModel):
    submission_id: UUID
    alias: str = Field(default="", max_length=40)
    body: str = Field(min_length=10, max_length=600)
    language: Literal["es", "en"] = "es"
    consent: Literal[True]

    @field_validator("alias", "body", mode="before")
    @classmethod
    def clean_text(cls, value):
        return value.strip() if isinstance(value, str) else value


class Moderation(StrictModel):
    status: Literal["approved", "rejected"]


@router.get("/comments")
def public_comments(page: int = Query(default=1, ge=1)):
    with database() as db:
        total = db.execute("SELECT COUNT(*) AS count FROM comments WHERE status='approved'").fetchone()["count"]
        rows = db.execute("SELECT id,created_at,alias,body,language FROM comments WHERE status='approved' ORDER BY created_at DESC, id DESC LIMIT 6 OFFSET ?", ((page - 1) * 6,)).fetchall()
    return {"items": [dict(r) for r in rows], "total": total, "page": page}


@router.post("/comments", status_code=201, dependencies=[Depends(same_origin)])
def submit_comment(payload: Comment, request: Request):
    identifier = str(payload.submission_id)
    alias = payload.alias or ("Visitante" if payload.language == "es" else "Visitor")
    address = digest((request.client.host if request.client else "unknown") + os.getenv("ADMIN_PASSWORD", ""))
    now = time.time()
    with database() as db:
        db.execute("DELETE FROM comment_limits WHERE reset < ?", (now,))
        db.execute("INSERT INTO comment_limits VALUES (?, 0, ?) ON CONFLICT (address) DO NOTHING", (address, now + 3600))
        # Lock before checking UUIDs so concurrent retries count only once.
        db.execute("UPDATE comment_limits SET attempts=attempts WHERE address=?", (address,))
        existing = db.execute("SELECT alias,body,language FROM comments WHERE id=?", (identifier,)).fetchone()
        if existing:
            if dict(existing) != {"alias": alias, "body": payload.body, "language": payload.language}:
                raise HTTPException(409, "Submission identifier already used")
            return {"id": identifier, "received": True}
        attempts = db.execute("SELECT attempts FROM comment_limits WHERE address=?", (address,)).fetchone()["attempts"]
        if attempts >= 5:
            raise HTTPException(429, "Too many comments. Try again later", headers={"Retry-After": "3600"})
        inserted = db.execute("INSERT INTO comments (id,created_at,alias,body,language,status) VALUES (?, ?, ?, ?, ?, 'pending') ON CONFLICT (id) DO NOTHING", (identifier, datetime.now(timezone.utc).isoformat(), alias, payload.body, payload.language)).rowcount
        if inserted:
            db.execute("UPDATE comment_limits SET attempts=attempts+1 WHERE address=?", (address,))
        else:
            existing = db.execute("SELECT alias,body,language FROM comments WHERE id=?", (identifier,)).fetchone()
            if dict(existing) != {"alias": alias, "body": payload.body, "language": payload.language}:
                raise HTTPException(409, "Submission identifier already used")
    return {"id": identifier, "received": True}


@router.get("/admin/comments", dependencies=[Depends(require_admin)])
def admin_comments(status: Literal["all", "pending", "approved", "rejected"] = "pending", page: int = Query(default=1, ge=1)):
    where, values = ("", []) if status == "all" else (" WHERE status=?", [status])
    with database() as db:
        total = db.execute("SELECT COUNT(*) AS count FROM comments" + where, values).fetchone()["count"]
        rows = db.execute("SELECT * FROM comments" + where + " ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET ?", [*values, (page - 1) * 20]).fetchall()
    return {"items": [dict(r) for r in rows], "total": total, "page": page}


@router.post("/admin/comments/{identifier}", dependencies=[Depends(require_admin), Depends(same_origin)])
def moderate_comment(identifier: UUID, payload: Moderation):
    with database() as db:
        if not db.execute("SELECT id FROM comments WHERE id=?", (str(identifier),)).fetchone():
            raise HTTPException(404, "Comment not found")
        db.execute("UPDATE comments SET status=? WHERE id=?", (payload.status, str(identifier)))
    return {"status": payload.status}


@router.get("/admin/comments-export", dependencies=[Depends(require_admin)])
def export_comments():
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow(["id", "created_at_utc", "alias", "comment", "language", "status"])
    with database() as db:
        for row in db.execute("SELECT * FROM comments ORDER BY created_at DESC, id DESC"):
            writer.writerow([csv_safe(row[k]) for k in ("id", "created_at", "alias", "body", "language", "status")])
    return Response("\ufeff" + output.getvalue(), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": 'attachment; filename="lumora-comentarios.csv"'})
