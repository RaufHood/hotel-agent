# Viktoria — DORMERO Voice AI Support Agent

Viktoria is an ElevenLabs voice agent that handles Tier-1 customer inquiries for DORMERO hotels. It answers questions about parking, rooms, pets, check-in, facilities, and general chain policies — grounded in a structured hotel knowledge base via RAG.

---

## How it works

```
ElevenLabs (voice agent)
    │
    │  tool call: POST /query
    ▼
RAG backend (FastAPI)  ◄──────  Control Center (React)
    │                               reads call logs + feedback
    ▼
Qdrant vector store
```

- **Voice interaction happens on the ElevenLabs platform** — callers talk to Viktoria directly via the ElevenLabs widget or phone number. You do not build or host the voice interface.
- **The backend** (`rag/`) serves two things: the `/query` RAG endpoint that ElevenLabs calls as a tool, and a proxy to the ElevenLabs Conversations API so the frontend never holds the API key.
- **The Control Center** (`control_center/frontend/`) is an internal dashboard for reviewing call transcripts and leaving feedback. It does not interact with the voice agent itself.

---

## Project Structure

```
Viktoria/
├── data/                   # Hotel knowledge chunks (JSON)
├── rag/                    # RAG + API backend (FastAPI + Qdrant + OpenAI)
└── control_center/         # Internal review UI (React + Vite)
```

---

## Running locally

You need **three things** running at the same time:

### 1. Backend (FastAPI)

```bash
cd rag
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env         # fill in your API keys
python ingest.py             # one-time: embed hotel data into Qdrant
uvicorn main:app --reload --port 8000
```

Backend is now at `http://localhost:8000`.

### 2. ngrok tunnel (so ElevenLabs can reach your local backend)

Instead of running uvicorn directly, use the ngrok Python SDK to start both together:

```bash
python -m ngrok --authtoken $NGORK_TOKEN uvicorn main:app
```

Copy the printed public URL and set it as the ElevenLabs tool webhook URL: `https://<ngrok-url>/query`.

### 3. Control Center (React)

In a separate terminal:

```bash
cd control_center/frontend
npm install
npm run dev
```

Dashboard is now at `http://localhost:5173`.

---

## Environment variables

All secrets live in `rag/.env` (copy from `rag/.env.example`):

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Embeddings for RAG |
| `ELEVENLABS_API_KEY` | Yes | Conversations API proxy |
| `ELEVENLABS_AGENT_ID` | Yes | Which agent's calls to fetch |
| `NGORK_TOKEN` | Yes | ngrok authtoken |
| `QDRANT_URL` | No | Leave blank for local Qdrant (`./qdrant_data`) |
| `QDRANT_API_KEY` | No | Required only when `QDRANT_URL` is set |

---

## Documentation

| Document | Description |
|----------|-------------|
| [rag/README.md](rag/README.md) | Backend setup, API reference, ngrok, ingest |
| [control_center/frontend/README.md](control_center/frontend/README.md) | Frontend setup and development |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architectural decisions and rationale |
