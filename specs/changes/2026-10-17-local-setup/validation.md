# 10.5 Local setup that just works: validation

- [x] `tests/unit/test_setup_local.py`: a fresh clone gets both files with one shared secret and a separate `AUTH_SECRET`; the examples' comments and defaults are kept (`AUTH_TRUST_HOST`, the dev login, `DATABASE_URL`); `--fake` needs no key; an existing file is only completed, and its secret goes to the new file; a file without the secret gets the other's; a second run changes nothing; different secrets are pointed out, not changed.
- [x] `tests/unit/infrastructure/test_llm_factory.py`: the reasoning effort sent for `groq`, for `openai` with Groq's URL (`low`), for OpenAI itself (none), and an explicit setting winning.
- [x] `tests/unit/infrastructure/test_config.py`: the startup line with everything set, with nothing set, for each LLM, and with no secret in it.
- [x] Real Groq, `LLM_PROVIDER=openai` with Groq's URL: four classifier calls, all valid JSON (before the fix, all four failed; A-037).
- [x] A fresh clone, following the README: `setup_local.py --fake`, `alembic upgrade head`, `uvicorn`, `npm install && npm run dev`. The backend logged "Starting with LLM fake (offline, scripted); database on; sign-in on; Content Safety off (PII redaction only); …". A scripted walk through every screen (sign in, chat, a breakdown, Focus on a step, the calendar file, SimplifyCore, every page, the export) passed with no console errors or failed API calls.
- [x] Earlier the same walk passed against Groq with a production build (`next start`) once `AUTH_TRUST_HOST` was set (see `2026-10-17-local-first/validation.md`).
- [x] Backend ruff, vulture, pytest; frontend docs and name checks.
