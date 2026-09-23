# 1.1 Backend test tooling: plan

All commands run from `backend/`.

1. Branch `test/1.1-backend-test-tooling` from `main`.
2. Add `pyproject.toml` and `.python-version`; run `uv sync` to create `uv.lock`.
3. Configure ruff; run `uv run ruff check --fix`, then fix the rest by hand (one unused variable, one long line) until it passes.
4. Add `tests/conftest.py` and `tests/api/test_health.py`; `uv run pytest` passes.
5. Ignore `.venv/`, `.pytest_cache/`, `.ruff_cache/` and `.coverage` in `.gitignore`.
6. Update `README.md`, `backend/README.md` and `CLAUDE.md`; mark A-007 fixed in `specs/audit.md`; tick 1.1 in `specs/roadmap.md`.
7. Run through `validation.md`, push, and open the PR.
