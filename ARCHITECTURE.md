# Architectural Decisions

Decisions made during the design of Viktoria and the rationale behind each.

---

## Voice layer: ElevenLabs

ElevenLabs handles all voice I/O, conversation turn management, and LLM synthesis. Viktoria is configured as a conversational agent with a custom system prompt tuned for DORMERO's brand voice.

Chosen because:
- Purpose-built for voice agents — handles STT, TTS, and conversation state out of the box.
- Tool calling support allows injecting RAG results into the LLM context at inference time.
- Managed infrastructure — no self-hosting of speech models.

---

## RAG over custom knowledge base (not ElevenLabs' built-in KB)

ElevenLabs offers a built-in knowledge base feature. We deliberately chose not to use it.

**Why:** The custom RAG pipeline makes the retrieval architecture explicit and inspectable — how data is structured, chunked, embedded, and retrieved. This is intentional for a demo: it shows the full stack rather than hiding it behind a managed abstraction.

**Trade-off:** More moving parts (Qdrant, embeddings, LlamaIndex). Acceptable for this project size.

---

## Embedding model: OpenAI `text-embedding-3-small`

Best quality-to-cost ratio for semantic search over short text chunks. At ~53 chunks, embedding costs are negligible even if ingest is run many times.

`text-embedding-3-large` would give marginally better retrieval quality but is not justified at this scale.

---

## Vector store: Qdrant

Qdrant has a free managed cloud tier and a file-based local mode. The same `QdrantClient` code works in both:

- **Local (dev):** `QdrantClient(path="./qdrant_data")` — no external service, no account required.
- **Cloud (prod):** `QdrantClient(url=..., api_key=...)` — zero code change, switch via `.env`.

This makes the dev/prod transition zero-config. Alternative (Pinecone, Weaviate) would require separate client initialization or SDK differences between local and cloud.

---

## Retrieval orchestration: LlamaIndex

LlamaIndex provides a thin orchestration layer over the embed + retrieve pipeline. It avoids the boilerplate of manually constructing Qdrant payloads and query vectors while keeping the pipeline transparent. No agents, no chains — just `VectorStoreIndex` + `as_retriever()`.

Alternative (raw Qdrant client) would require manually calling the OpenAI embeddings API, constructing query vectors, and parsing Qdrant search results. LlamaIndex does this in two lines with no loss of transparency.

---

## API server: FastAPI

FastAPI exposes `POST /query` as the tool endpoint ElevenLabs calls during a conversation. It also proxies `GET /calls` and `GET /calls/{id}` to the ElevenLabs Conversations API, keeping the API key server-side and out of the browser.

Chosen for: async-native, Pydantic validation, automatic OpenAPI docs, minimal boilerplate.

---

## Feedback persistence: SQLite (local) → Postgres (cloud)

Call feedback (rating 1–5, optional comment) is stored in a local `feedback.db` SQLite file, managed via Python's built-in `sqlite3`.

**Why SQLite for local development:**

| Option | Verdict |
|--------|---------|
| SQLite | Zero setup, full SQL, single file — correct for a single-writer demo |
| JSON file | No atomic writes, corrupts under concurrent access |
| Supabase (Postgres) | Correct for production / real-time updates, over-engineered here |

**Deployment path:**

Render's filesystem is ephemeral — `feedback.db` would be wiped on every redeploy. When deploying, the database should be migrated to a managed Postgres service. Two practical options:

- **Supabase** — free tier, Postgres-compatible, includes a REST API and real-time subscriptions if the sidebar ever needs live updates.
- **Render PostgreSQL** — native to the hosting platform, simplest ops; free tier expires after 90 days.

The code change is minimal: swap the `sqlite3` connection in `feedback.py` for a SQLAlchemy engine pointed at `DATABASE_URL` from `.env`. The schema (one `feedback` table) is identical in both engines.

---

## Public exposure: ngrok

ElevenLabs tool calling requires a publicly reachable HTTPS endpoint. ngrok provides a temporary tunnel from `localhost:8000` to a public URL with no server setup.

The ngrok Python SDK (`python-ngrok`) is used so the tunnel can be started as part of the Python process rather than as a separate terminal command.

---

## RAG retrieval: city-scoped filtering

The `/query` endpoint accepts an optional `city` parameter (e.g. `"Coburg"`, `"Stuttgart"`). When provided, Qdrant applies a metadata filter before semantic scoring:

```
(city == <given_city>) OR (hotel_id == "general")
```

This means only chunks for the specific hotel plus chain-wide FAQs are ranked — irrelevant hotels are excluded entirely, improving both precision and efficiency.

**Why city and not hotel_id:** City is the natural unit ElevenLabs would know from context (e.g. the guest says "I'm staying in Stuttgart"). City maps 1:1 to a hotel at current scale. The value is normalised to title case server-side so the agent doesn't need to match exact casing.

**Multi-hotel-per-city limitation:** If a city ever has more than one DORMERO property, filtering by city alone is ambiguous. The correct fix is to filter by address or hotel_id instead — but this requires the agent to know which specific property the guest means. When this scenario arises, the decision is to ask the guest for the address and pass the resolved `hotel_id` directly.

**Fallback:** If `city` is omitted, retrieval runs across all hotels unfiltered (original behaviour).

---

## Data model: one JSON chunk per topic per hotel

```json
{
  "id": "coburg_parking",
  "hotel_id": "coburg",
  "hotel_name": "DORMERO Hotel Coburg",
  "city": "Coburg",
  "topic": "parking",
  "content": "...",
  "tags": ["parking", "car", "garage"]
}
```

One chunk = one topic at one hotel. General FAQs (chain-wide) live in a separate file without `hotel_id`, defaulting to `"general"`.

**Why this granularity:** One chunk per topic gives the retriever a clean semantic unit to score. Splitting at a finer grain (e.g. per sentence) would require more chunks with no retrieval benefit at this data size. Merging topics would produce chunks too large to rank precisely.

**Scalability:** Adding a new hotel = add one JSON file, re-run `ingest.py`. No schema changes, no migration.
