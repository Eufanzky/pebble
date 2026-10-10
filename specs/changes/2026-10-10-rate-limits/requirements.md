# 10.4 Rate limits: requirements

Roadmap item: **10.4** (Phase 10). Branch: `feat/10.4-rate-limits`.

## Goal

One account can't use up the LLM's shared free tier (Groq: 30 requests a minute, 1,000 requests and 200K tokens a day for every user together). When the agents can't be asked, the user sees one gentle "resting" message, whichever limit it was.

## The limit

- Each user may make `AGENT_CALLS_PER_MINUTE` (default 10) agent calls a minute and `AGENT_CALLS_PER_DAY` (default 100) a day. The windows slide; 0 turns one off.
- The calls that count are the five that ask the LLM: `/api/agents/chat`, `/decompose`, `/simplify`, `/motivate`, and `POST /api/tasks/{id}/breakdown`. All five share one count. Nothing else is limited.
- Over the limit: 429 `{"detail": "Pebble is resting for a moment. Try again in a little while."}` with `Retry-After` in seconds (rounded up), and the LLM isn't asked. A refused call doesn't count.
- Signing in comes first: signed out is still a 401.
- Kept in memory: the API runs as one instance, and a restart only lets users call sooner.

## The frontend

- `isResting(error)`: a 429, or a 503 whose detail is the backend's resting sentence (a provider limit).
- Then chat, a breakdown on Today (and "Make it smaller") and SimplifyCore on Documents show "Pebble is resting for a moment. Try again in a little while." in place of their own failure note, and can be tried again the same way.
- The message passes the guilt scan.

## Out of scope

- A shared store for the counts (Redis, Postgres), for when there's more than one instance.
- Counting tokens instead of calls.
