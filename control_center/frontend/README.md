# Viktoria Control Center — Frontend

React + TypeScript + Tailwind dashboard for reviewing Viktoria's call logs and leaving per-call feedback.

## Prerequisites

- Node.js 18+
- The FastAPI backend running on port 8000 (see `rag/README` in root)
- `ELEVENLABS_API_KEY` added to `rag/.env`

## Setup

```bash
cd control_center/frontend
npm install
```

## Run

```bash
npm run dev
```

Opens at http://localhost:5173. The Vite dev server proxies `/calls/*` and `/health` to FastAPI on port 8000 — no CORS config needed.

## Build

```bash
npm run build    # type-check + bundle to dist/
npm run preview  # serve the production build locally
```

## What you need in rag/.env

```
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_AGENT_ID=agent_2101kmb7xdxrf2p9qf4yrnb0dtzx
```

Get your API key from elevenlabs.io → Profile → API Keys.

## Features

- **Sidebar** — lists all conversations for the configured agent, with date, duration, and rating preview
- **Transcript view** — full chat-bubble transcript with Viktoria (V) and guest (G) differentiated visually
- **Feedback panel** — 1–5 star rating + free-text comment, persisted to SQLite via the backend

## Project structure

```
src/
  api.ts               # fetch helpers for the backend API
  types.ts             # shared TypeScript types
  App.tsx              # root layout, state for selected call
  main.tsx             # React entry point
  index.css            # Tailwind base styles
  components/
    Sidebar.tsx        # call list with CallItem entries
    CallItem.tsx       # single row in the sidebar
    Transcript.tsx     # renders the full message list
    MessageBubble.tsx  # individual chat bubble (guest vs. Viktoria)
    FeedbackPanel.tsx  # star rating + comment form
    StarRating.tsx     # reusable 1–5 star input
```

## Tech stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Dev server & bundler |
| Tailwind CSS | 3 | Utility-first styling |
