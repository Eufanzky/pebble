# 10.1 Backend Dockerfile: validation

Docker doesn't run in this WSL setup, so the image is checked in CI.

- [x] `tests/unit/test_dockerfile.py`: `.env`, `.venv` and the tests are ignored; `uv sync --locked --no-dev`; the `HEALTHCHECK` asks `/api/health`, which the app serves; migrations run before uvicorn on `$PORT`; a non-root user.
- [x] CI Docker job: `docker compose up --build --wait` passes both health checks, `/api/health` answers, and `alembic current` is at head.
- [x] CI E2E: all specs pass with the backend from the built image.
- [x] Backend ruff, vulture, pytest; frontend `tsc` (the Playwright config); local E2E still runs the backend from source.
