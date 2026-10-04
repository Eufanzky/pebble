# 2.9 Backend coverage floor: requirements

Roadmap item: **2.9** (Phase 2). Branch: `test/2.9-backend-coverage-floor`.

## Goal

Coverage can only go up: CI fails when backend coverage drops below 90% on `domain/` + `application/`, or below 80% overall.

## Scope

In scope:
- `[tool.coverage.report] fail_under = 80`, so `uv run pytest --cov` fails below the overall floor.
- A CI step: `coverage report --include="app/domain/*,app/application/*" --fail-under=90`.
- Auth tests for today's Entra ID dependency (missing and malformed tokens get a 401, the `DEV_MODE` bypass, health needs no token). `api/auth.py` was at 17%. 4.3 replaces it and adds expiry and user-isolation tests.

## Decisions

1. **One test run, two reports.** pytest-cov enforces the overall floor from the config. The layer floor reads the same `.coverage` data, so the tests run once.
2. **Floors, not targets.** Today it's 100% on domain + application and about 97% overall. The floors sit at the levels in `testing.md` so a small, honest change doesn't fail CI, but a real gap does.
3. **Evals don't count.** They're deselected in normal runs and never touch coverage.
