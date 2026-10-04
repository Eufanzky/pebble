# 2.1 Layer skeleton: validation

Run from `backend/`.

- [x] `uv run pytest` passes, and the 1.3 characterization tests are unchanged.
- [x] `uv run ruff check` passes.
- [x] `uv run uvicorn app.main:app` starts, and `/api/health` returns `{"status": "ok"}`.
- [x] The architecture test reports a planted violation.
- [x] No module imports `app.config`, `app.models`, `app.routers` or `app.services.auth`.
