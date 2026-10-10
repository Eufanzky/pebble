# The Pebble API (roadmap 10.1). Build from backend/: `docker build -t pebble-backend .`
# The dependencies come from uv.lock (no dev group); the image runs the migrations, then uvicorn on $PORT.

FROM ghcr.io/astral-sh/uv:0.12.18 AS uv

FROM python:3.12-slim AS build
COPY --from=uv /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never
WORKDIR /app
# Dependencies first, so a code change doesn't reinstall them
COPY pyproject.toml uv.lock .python-version ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --locked --no-dev

FROM python:3.12-slim
RUN useradd --create-home --uid 10001 pebble
WORKDIR /app
COPY --from=build /app/.venv /app/.venv
COPY alembic.ini ./
COPY migrations ./migrations
COPY app ./app
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PORT=8000
USER pebble
EXPOSE 8000
# The slim image has no curl: ask the health endpoint with the standard library
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
    CMD ["python", "-c", "import os, urllib.request; urllib.request.urlopen(f\"http://127.0.0.1:{os.environ['PORT']}/api/health\", timeout=4)"]
# Migrations first when there's a database (without one the store endpoints answer 503), then the API.
# Hosts such as Render set $PORT.
CMD ["sh", "-c", "{ [ -z \"$DATABASE_URL\" ] || alembic upgrade head; } && exec uvicorn app.main:app --host 0.0.0.0 --port \"$PORT\""]
