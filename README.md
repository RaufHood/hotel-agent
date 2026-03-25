# Viktoria — DORMERO Voice AI Support Agent

Viktoria is an ElevenLabs voice agent that handles Tier-1 customer inquiries for DORMERO hotels. It answers questions about parking, rooms, pets, check-in, facilities, and general chain policies — grounded in a structured hotel knowledge base via RAG.

---

## Project Structure

```
Viktoria/
├── data/                   # Hotel knowledge chunks (JSON)
├── rag/                    # RAG + API backend (FastAPI + Qdrant + OpenAI)
└── control_center/         # Internal review UI (React + Vite)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [rag/README.md](rag/README.md) | Backend setup, API reference, ngrok, ingest |
| [control_center/frontend/README.md](control_center/frontend/README.md) | Frontend setup and development |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architectural decisions and rationale |
