from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from elevenlabs_client import get_conversation, list_conversations
from feedback import get_all_feedback, get_feedback, init_db, upsert_feedback
from rag import query as rag_query


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Dormero Hotel RAG API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# RAG
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    question: str
    city: str | None = None  # e.g. "Coburg", "Stuttgart" — filters results to that city + general FAQs


class ContextChunk(BaseModel):
    text: str
    score: float
    hotel_id: str
    hotel_name: str
    topic: str


class QueryResponse(BaseModel):
    question: str
    results: list[ContextChunk]


@app.post("/query", response_model=QueryResponse)
def query_knowledge_base(req: QueryRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    results = rag_query(req.question, city=req.city)
    return QueryResponse(question=req.question, results=results)


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Calls (proxy to ElevenLabs)
# ---------------------------------------------------------------------------

@app.get("/calls")
def get_calls():
    try:
        data = list_conversations()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ElevenLabs error: {e}")

    conversations = data.get("conversations", [])

    # Merge stored feedback into each conversation summary
    all_fb = get_all_feedback()
    for conv in conversations:
        cid = conv.get("conversation_id")
        conv["feedback"] = all_fb.get(cid)

    return {"conversations": conversations}


@app.get("/calls/{conversation_id}")
def get_call(conversation_id: str):
    try:
        data = get_conversation(conversation_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ElevenLabs error: {e}")
    data["feedback"] = get_feedback(conversation_id)
    return data


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

class FeedbackRequest(BaseModel):
    rating: int | None = None
    comment: str | None = None


@app.post("/calls/{conversation_id}/feedback")
def submit_feedback(conversation_id: str, req: FeedbackRequest):
    if req.rating is not None and not (1 <= req.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    upsert_feedback(conversation_id, req.rating, req.comment)
    return get_feedback(conversation_id)


@app.get("/calls/{conversation_id}/feedback")
def read_feedback(conversation_id: str):
    fb = get_feedback(conversation_id)
    if not fb:
        return {}
    return fb
