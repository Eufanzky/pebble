# 10.5 Local setup that just works: requirements

Roadmap item: **10.5** (Phase 10). Branch: `feat/10.5-local-setup`.

## Goal

From a fresh clone, the app runs locally with a handful of commands, and an older local setup is brought up to date without losing anything. Found by running the app locally on 2026-10-17 (A-037, A-039).

## The setup script

- `uv run python scripts/setup_local.py` (from `backend/`) writes `backend/.env` and `frontend/.env.local` from their examples.
- Both get one `AUTH_TOKEN_SECRET`; the frontend gets its own `AUTH_SECRET`. Both are random (`secrets.token_urlsafe(32)`).
- A file that exists is never rewritten. Settings it lacks are added at the end with the example's value (empty ones are skipped), and the secret it already has is the one the other file gets. If the two files end up with different secrets, it says so and changes neither.
- `--fake` writes `LLM_PROVIDER=fake` into a new `backend/.env`, so Pebble runs without a key. Otherwise, without a key, it says where to get a free Groq key.
- Running it twice changes nothing.

## Fixes

- A-039: `AUTH_TRUST_HOST=true` is in `frontend/.env.example`, so a local production build can sign in.
- A-037: with `LLM_PROVIDER=openai` and Groq's URL, the adapter sends reasoning effort `low` like the `groq` provider. An explicit `LLM_REASONING_EFFORT` still wins.

## The startup line

- When the backend starts, it logs one line naming the LLM (provider and model, or what's missing), the database, sign-in, Content Safety, Immersive Reader and the agent call limits. It never contains a secret.

## Out of scope

- The smoke test suite (10.6) and the safety labels (10.7).
