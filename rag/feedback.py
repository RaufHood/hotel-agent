import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "feedback.db"


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                conversation_id TEXT PRIMARY KEY,
                rating          INTEGER,
                comment         TEXT,
                created_at      TEXT,
                updated_at      TEXT
            )
        """)


def upsert_feedback(conversation_id: str, rating: int | None, comment: str | None):
    now = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT INTO feedback (conversation_id, rating, comment, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(conversation_id) DO UPDATE SET
                rating     = excluded.rating,
                comment    = excluded.comment,
                updated_at = excluded.updated_at
        """, (conversation_id, rating, comment, now, now))


def get_feedback(conversation_id: str) -> dict | None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM feedback WHERE conversation_id = ?",
            (conversation_id,)
        ).fetchone()
        return dict(row) if row else None


def get_all_feedback() -> dict[str, dict]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM feedback").fetchall()
        return {row["conversation_id"]: dict(row) for row in rows}
