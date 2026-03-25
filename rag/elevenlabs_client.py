import os

import httpx
from dotenv import load_dotenv

load_dotenv()

AGENT_ID = os.environ.get("ELEVENLABS_AGENT_ID", "agent_2101kmb7xdxrf2p9qf4yrnb0dtzx")
BASE_URL = "https://api.elevenlabs.io/v1"


def _headers() -> dict:
    key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not key:
        raise RuntimeError("ELEVENLABS_API_KEY is not set in .env")
    return {"xi-api-key": key}


def list_conversations(page_size: int = 30, cursor: str | None = None) -> dict:
    params = {"agent_id": AGENT_ID, "page_size": page_size}
    if cursor:
        params["cursor"] = cursor
    with httpx.Client() as client:
        r = client.get(f"{BASE_URL}/convai/conversations", headers=_headers(), params=params)
        r.raise_for_status()
        return r.json()


def get_conversation(conversation_id: str) -> dict:
    with httpx.Client() as client:
        r = client.get(
            f"{BASE_URL}/convai/conversations/{conversation_id}",
            headers=_headers(),
        )
        r.raise_for_status()
        return r.json()
