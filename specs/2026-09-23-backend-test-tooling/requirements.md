# 1.1 Backend test tooling: requirements

Roadmap item: **1.1 Backend test tooling** (Phase 1). Branch: `test/1.1-backend-test-tooling`.

## Goal

Give the backend a reproducible environment, a linter and a test runner, so 1.3 can pin today's behaviour and 1.6 can run it all in CI.

## Scope

In scope:
- `backend/pyproject.toml` managed by `uv`: the runtime dependencies from `requirements.txt`, plus a `dev` group with pytest, pytest-asyncio, pytest-cov, respx and ruff.
- `backend/uv.lock` and `.python-version` (3.12). This fixes audit item A-007 (no lockfile).
- pytest config: `tests/` as the root, `asyncio_mode = auto`, and an `eval` marker that is excluded by default.
- ruff config, and the code changes needed for `uv run ruff check` to pass.
- `tests/conftest.py` with an `app` fixture and an async `client` fixture, and one health-endpoint test.
- Docs: both READMEs and `CLAUDE.md` switch from conda + pip to `uv`.

Out of scope:
- Characterization tests (1.3), CI (1.6), coverage floors (2.9).
- Deleting `requirements.txt`. The roadmap removes it in 2.7 with the dead services.

## Decisions

1. **The app isn't a package.** `[tool.uv] package = false`, so `uv sync` installs dependencies only and `app` is imported from the working directory, as uvicorn already does.
2. **The app factory is a fixture.** `main.py` already builds the app at import. The `app` fixture returns it and clears `dependency_overrides` after each test. The `client` fixture uses `httpx.ASGITransport`, which doesn't run the lifespan, so tests never initialise Cosmos or telemetry. `main.py` stays unchanged; phase 2 makes `main.py` the composition root.
3. **Ruff rules:** `E, F, I, UP, B`, line length 120. Safe autofixes are applied (import order, `X | None`, `datetime.UTC`, unused imports); they don't change behaviour. Ignored, with reasons in `pyproject.toml`:
   - `B008`: FastAPI's `Depends()` in defaults is intended.
   - `B904` and `UP042`: fixing them changes exception chaining and `str()` of enums, right before 1.3 pins behaviour. Phase 2 rewrites this code.
   - `E501` in `agents/prompts.py` only: rewrapping would change the prompt text.
4. **Known warning:** the A-008 Semantic Kernel deprecation warning is filtered in pytest with a pointer to the audit. It goes away in 2.7.
