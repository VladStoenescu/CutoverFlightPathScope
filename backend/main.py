"""Cutover Flightpath – Python FastAPI backend.

Stores the entire AppState as a single JSON document in a local SQLite
database (``data.db``).  The API is intentionally minimal so the frontend
can swap localStorage for these three endpoints with no schema changes.

Endpoints
---------
GET  /api/state          – return the stored state (or 404 if none)
PUT  /api/state          – save / overwrite the state; body is the AppState JSON
DELETE /api/state        – clear the stored state
GET  /api/health         – liveness check
"""

from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

DB_PATH = Path(__file__).parent / "data.db"
_STATE_KEY = "appstate"


@contextmanager
def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS kv "
            "(key TEXT PRIMARY KEY, value TEXT NOT NULL)"
        )
        conn.commit()
        yield conn
    finally:
        conn.close()


def _db_get(key: str) -> str | None:
    with _get_conn() as conn:
        row = conn.execute("SELECT value FROM kv WHERE key=?", (key,)).fetchone()
        return row[0] if row else None


def _db_set(key: str, value: str) -> None:
    with _get_conn() as conn:
        conn.execute(
            "INSERT INTO kv(key, value) VALUES(?,?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            (key, value),
        )
        conn.commit()


def _db_delete(key: str) -> None:
    with _get_conn() as conn:
        conn.execute("DELETE FROM kv WHERE key=?", (key,))
        conn.commit()


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="Cutover Flightpath API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/state")
def get_state() -> Any:
    raw = _db_get(_STATE_KEY)
    if raw is None:
        raise HTTPException(status_code=404, detail="No state stored")
    return json.loads(raw)


@app.put("/api/state", status_code=204)
async def put_state(request: Request) -> Response:
    body = await request.body()
    try:
        json.loads(body)  # validate JSON before storing
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {exc}") from exc
    _db_set(_STATE_KEY, body.decode())
    return Response(status_code=204)


@app.delete("/api/state", status_code=204)
def delete_state() -> Response:
    _db_delete(_STATE_KEY)
    return Response(status_code=204)


# ---------------------------------------------------------------------------
# Dev entry-point: python main.py
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
