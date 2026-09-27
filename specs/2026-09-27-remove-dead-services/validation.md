# 2.7 Remove dead services: validation

- [x] `uv run pytest` (315 passed, warnings as errors) and `ruff check` pass.
- [x] `env -i PATH=/usr/bin:/bin LLM_API_KEY=... uvicorn app.main:app` starts. `/api/health` is ok, chat without auth is 401, and with `DEV_MODE=true` a bad key gives a gentle 503.
- [x] `requirements.txt`, `deploy.ps1` and `app/services/` are gone; `uv.lock` has 47 packages.
- [x] OpenAPI lists only the 7 working routes.
- [x] The frontend calls only `/api/agents/chat` and `/api/documents/immersive-reader/token`, and both still exist.
