# 1.1 Backend test tooling: validation

Run from `backend/` after a fresh `rm -rf .venv && uv sync`.

- [ ] `uv sync --locked` succeeds (the lockfile matches `pyproject.toml`).
- [ ] `uv run pytest` passes, with no warnings.
- [ ] `uv run pytest -m eval` selects no tests (exit code 5) and doesn't fail on marker errors.
- [ ] `uv run pytest --cov` prints a coverage report for `app/`.
- [ ] `uv run ruff check` passes.
- [ ] `uv run python -c "import app.main"` succeeds with no `.env`.
- [ ] The only `app/` changes are ruff's safe autofixes plus the two hand fixes (`routers/verify.py`, `agents/plugins.py`).
- [ ] `git status` shows no `.venv/`, cache or `.coverage` files.
- [ ] A-007 is marked fixed in `specs/audit.md`, and 1.1 is ticked in `specs/roadmap.md`.
