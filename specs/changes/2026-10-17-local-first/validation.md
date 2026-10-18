# Local first, deploy last: validation

## The app, run locally (2026-10-17)

Postgres 17, the backend with `uv run uvicorn` and Groq (`openai/gpt-oss-120b`), the frontend as a production build (`next build && next start`). A Playwright script walked through: dev sign-in, chat (a CalmSense breakdown added to Today, and small talk), "Break it down" on a typed task and a step ticked, the "Why?" card, Focus on a step (start, stop, "Mark this step done"), the calendar file, an uploaded text file simplified by SimplifyCore, Stats, Activity, Settings, Focus and Today, and the data export.

- First run: sign-in failed. `next start` answered every `/api/auth/*` call with Auth.js's `UntrustedHost` (A-039). With `AUTH_TRUST_HOST=true` in `.env.local` it worked.
- Second run: every step passed except chat, which answered "I didn't quite catch that" to a breakdown request. The local `.env` reached Groq as `LLM_PROVIDER=openai`, so no reasoning effort was sent and the classifier's reply ran past its 512 tokens (A-037). Four direct calls with `LLM_PROVIDER=groq` all returned valid JSON.
- Third run, with `LLM_PROVIDER=groq`: every step passed, with no console errors and no failed API calls. Agent calls took 3–5 s.
- Seen on the Activity page: "Content Safety: passed" on every entry although Content Safety isn't configured (A-038).

## Checks

- [x] `docs-links.test.ts` passes (the roadmap and audit links resolve).
