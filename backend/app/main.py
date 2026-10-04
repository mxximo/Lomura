import os
import re
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from .routers import content, quiz, credits, responses, comments
from .storage import database

app = FastAPI(title="Digital Wellbeing API", version="1.0.0", docs_url="/api/docs", openapi_url="/api/openapi.json", redoc_url=None)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(CORSMiddleware,
    allow_origins=[s.strip() for s in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if s.strip()],
    allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Content-Type"])
for router in (content.router, quiz.router, credits.router, responses.router, comments.router):
    app.include_router(router, prefix="/api")


@app.get("/api/health")
def health():
    if os.getenv("DATABASE_URL") or os.getenv("RENDER") == "true":
        with database() as db:
            db.execute("SELECT 1")
    return {"status": "ok"}


DIST = Path(os.getenv("FRONTEND_DIST", str(Path(__file__).resolve().parents[2] / "frontend" / "dist"))).resolve()


@app.middleware("http")
async def response_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    if request.url.path.startswith(("/api/quiz", "/api/admin", "/api/surveys", "/api/comments")):
        response.headers["Cache-Control"] = "no-store"
    elif response.status_code == 200 and re.fullmatch(r"/assets/[^/]+-[A-Za-z0-9_-]{8,}\.(?:js|css)", request.url.path):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return response


@app.get("/{path:path}", include_in_schema=False)
def frontend(path: str):
    if path == "api" or path.startswith("api/"):
        raise HTTPException(404, "API route not found")
    target = (DIST / path).resolve()
    if not target.is_relative_to(DIST):
        raise HTTPException(404, "Not found")
    if target.is_file():
        return FileResponse(target)
    if path.startswith(("assets/", "media/")) or Path(path).suffix:
        raise HTTPException(404, "Asset not found")
    if (DIST / "index.html").is_file():
        return FileResponse(DIST / "index.html", headers={"Cache-Control": "no-cache"})
    raise HTTPException(503, "Frontend not built. Run npm run build in frontend/.")
