# TODO

## Control Center
- [ ] Real-time sidebar updates when a new call finishes
  - Option A: polling (setInterval every 30s) — simple but not elegant
  - Option B: Supabase real-time subscriptions — requires swapping SQLite for Supabase
  - Option C: Server-Sent Events (SSE) from FastAPI — no external dependency, elegant

## Agent Tools
- [ ] `log_complaint` tool — Viktoria logs complaint summary during the call, persisted and surfaced in control center
- [ ] `escalate_to_human` tool — Viktoria hands off call gracefully, flagged in call log
- [ ] `hotel_id` filter on `/query` — restrict RAG results to the hotel the guest is calling about

## Infrastructure
- [ ] Deploy RAG backend to Render (makes ElevenLabs tool calling work without local machine)
- [ ] Rotate ngrok authtoken (exposed in conversation)
