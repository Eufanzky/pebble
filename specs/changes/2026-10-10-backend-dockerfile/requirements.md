# 10.1 Backend Dockerfile: requirements

Roadmap item: **10.1** (Phase 10). Branch: `feat/10.1-backend-dockerfile`.

## Goal

The backend runs from a Docker image built with `uv`, with a health check: the image Render will run (10.2), and the one CI's E2E tests.

## The image

- `backend/Dockerfile`: dependencies from `uv.lock` (`uv sync --locked --no-dev`) on `python:3.12-slim`, with uv from its pinned image. The runtime stage has only the virtualenv, `app/`, `migrations/` and `alembic.ini`, and runs as a non-root user.
- On start: `alembic upgrade head` when `DATABASE_URL` is set (without one the backend starts as before, and the store endpoints answer 503), then uvicorn on `$PORT` (8000 by default).
- `HEALTHCHECK` asks `/api/health` with Python's standard library (the slim image has no curl).
- `.dockerignore` keeps `.env`, the tests, scripts and the virtualenv out.

## Compose

- `docker compose up -d db` still starts only Postgres.
- `docker compose up` also builds and starts the backend on port 8000, after Postgres is healthy, reading `backend/.env` if it exists, with `DATABASE_URL` pointed at the `db` service.

## CI

- A Docker job: `docker compose up --build --wait` (both health checks pass), `/api/health` answers, and `alembic current` is at head.
- E2E runs the backend from the built image (`E2E_BACKEND_IMAGE`), on the host network to reach the Postgres service. Locally, without the variable, Playwright still runs the backend from source.

## Out of scope

- A frontend image (Vercel builds it, 10.3), publishing the image, and deploying it (10.2).
