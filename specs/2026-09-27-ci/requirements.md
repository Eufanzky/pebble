# 1.6 CI: requirements

Roadmap item: **1.6 CI** (Phase 1). Branch: `chore/1.6-ci`.

## Goal

Every PR runs lint, typecheck and all tests for both parts, so "green before merge" is checked by a machine.

## Scope

In scope:
- `.github/workflows/ci.yml`, on `pull_request` and on `push` to `main`:
  - **Frontend** (`pebble/`): `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm test` (includes the guilt scan), `npm run build`
  - **Backend** (`backend/`): `uv sync --locked`, `uv run ruff check`, `uv run pytest` (evals stay excluded)
- A README badge and docs.

Out of scope:
- Coverage floors (2.9, 3.8), the OpenAPI drift check (3.5), E2E (3.7), the scheduled eval run (2.8).
- Branch protection (required checks), which is a repository setting, not code.

## Decisions

1. **Two parallel jobs**, one per part, each with its own working directory and dependency cache (`npm` on `package-lock.json`, uv on `uv.lock`).
2. **`--locked`** makes the backend job fail if `uv.lock` is out of date with `pyproject.toml`.
3. **Typecheck means `tsc --noEmit` on the frontend.** `tech-stack.md` names only ruff for Python, so there's no backend type checker to run. The build also runs, because it catches Next.js-specific errors that `tsc` doesn't.
4. **Pinned action versions.** `actions/checkout@v7` and `actions/setup-node@v7` use major tags. `astral-sh/setup-uv` doesn't publish a floating major tag, so it's pinned to `v10.2.0`.
5. **Least privilege and no wasted runs:** `contents: read`, a 15-minute timeout per job, and superseded runs on the same ref are cancelled.
