# 10.5 Local setup that just works: plan

1. `backend/scripts/setup_local.py` with `read_env`, `fill`, `write` and `setup(root, fake)`; tests on copies of the real examples in a temporary folder.
2. `AUTH_TRUST_HOST=true` in `frontend/.env.example`.
3. The LLM factory: `_is_groq(base_url)` gives `low` effort under `openai`; respx tests on the request actually sent.
4. `describe(settings)` in `infrastructure/config.py`, logged by the lifespan; unit tests, including that no secret appears.
5. README, backend README and CLAUDE.md: the new setup commands. Check from a fresh clone.
