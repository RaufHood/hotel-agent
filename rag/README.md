# Backend — RAG API

FastAPI server that serves as the RAG retrieval endpoint for Viktoria (ElevenLabs tool calling), a proxy to the ElevenLabs Conversations API, and a feedback store for the Control Center.

---

## File Structure

```
rag/
├── main.py               # FastAPI app — all routes
├── rag.py                # Retrieval logic (Qdrant + LlamaIndex)
├── ingest.py             # One-time ingestion script
├── feedback.py           # SQLite feedback store
├── elevenlabs_client.py  # Thin httpx wrapper for ElevenLabs API
├── requirements.txt
├── .env.example
├── feedback.db           # Created on first run (gitignored)
└── qdrant_data/          # Local Qdrant storage (gitignored)
```

---

## Setup

```bash
cd rag
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

Configure `.env`:

```bash
cp .env.example .env
```

```
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...

# Leave blank to use local Qdrant (./qdrant_data)
QDRANT_URL=https://...
QDRANT_API_KEY=...
```

---

## Ingest

Run once to embed all hotel chunks and write them to Qdrant. Re-run whenever `/data` changes.

```bash
python ingest.py
```

Reads all `*.json` files from `../data/`, creates one `TextNode` per chunk with metadata (`hotel_id`, `hotel_name`, `city`, `topic`, `tags`), and stores vectors in the `hotels` collection.

---

## Run

```bash
uvicorn main:app --reload --port 8000
```

The SQLite feedback database is created automatically on startup (`feedback.db`).

---

## Expose via ngrok

For ElevenLabs tool calling the server must be publicly reachable. ngrok tunnels your local port 8000 to a public HTTPS URL.

**1. Set your authtoken once** (stored in `~/.config/ngrok/ngrok.yml`):

```bash
ngrok config add-authtoken $NGORK_TOKEN
```

Or pass it inline without storing:

```bash
NGROK_AUTHTOKEN=$NGORK_TOKEN ngrok http 8000
```

**2. Start the tunnel** (in a separate terminal, while uvicorn is running):

```bash
ngrok http 8000
```

**3. Copy the forwarding URL** printed by ngrok, e.g. `https://dearly-uncomplimenting-wilton.ngrok-free.app`, and update the ElevenLabs tool webhook URL to:

```
https://<your-ngrok-subdomain>.ngrok-free.app/query
```

> **Free tier note:** the subdomain changes every time you restart ngrok. To get a stable URL, use a paid ngrok plan with a reserved domain — or set `NGROK_AUTHTOKEN` in `.env` and use the ngrok Python SDK to start the tunnel from within `main.py`.

---

## API Reference

### RAG

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/query` | Semantic search over hotel knowledge base |
| `GET`  | `/health` | Health check |

**POST /query**

```json
// Request
{ "question": "What are the parking options at the Coburg hotel?" }

// Response
{
  "question": "...",
  "results": [
    {
      "text": "...",
      "score": 0.87,
      "hotel_id": "coburg",
      "hotel_name": "DORMERO Hotel Coburg",
      "topic": "parking"
    }
  ]
}
```

Returns top-3 semantically similar chunks. ElevenLabs uses these to ground Viktoria's answer.

**ElevenLabs tool configuration:**

| Field | Value |
|-------|-------|
| Method | POST |
| URL | `https://<ngrok-url>/query` |
| Header | `ngrok-skip-browser-warning: true` |
| Body param | `question` (string, required) |

---

### Calls (ElevenLabs proxy)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/calls` | List conversations (with merged feedback) |
| `GET` | `/calls/{conversation_id}` | Full transcript for one call |

The frontend never calls ElevenLabs directly — the API key stays server-side.

---

### Feedback

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/calls/{conversation_id}/feedback` | Submit or update rating + comment |
| `GET`  | `/calls/{conversation_id}/feedback` | Read stored feedback |

**POST /calls/{id}/feedback**

```json
{ "rating": 4, "comment": "Handled the parking question well." }
```

`rating` is 1–5. Both fields are optional (partial updates are supported via upsert).

---

## Test Locally

```bash
# Health
curl http://localhost:8000/health

# RAG query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"Do you allow dogs at the Stuttgart hotel?\"}"

# Call list
curl http://localhost:8000/calls
```
