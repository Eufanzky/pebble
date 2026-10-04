# 6.4 Clear names: requirements

Roadmap item: **6.4** (Phase 6), asked for after 6.3: "it says pebble for the frontend, it should say frontend; handle similar confusions in naming folders." Branch: `refactor/6.4-clear-names`.

## Goal

Each folder and package says what it is, and the app has one name.

## Renames

| Was | Now | Why |
|:--|:--|:--|
| `pebble/` | `frontend/` | Pebble is the whole app; the folder holds only the frontend, beside `backend/`. |
| npm package `pebble` | `pebble-frontend` | The same reason, in `package.json`. |
| Python package `focusbuddy-backend` | `pebble-backend` | The hackathon name, in `pyproject.toml` and `uv.lock`. |
| "Focusbuddy" in the four agent prompts | "Pebble" | The model was told the app had another name (A-024). |
| `frontend/src/app/(app)/` | `frontend/src/app/(signed-in)/` | "app inside app" said nothing; the group is the pages that need a signed-in user (`/signin` is outside it). |
| `backend/tests/domain/` | `backend/tests/unit/domain/` | Domain tests are unit tests; they now sit beside `unit/application/`, as `testing.md` describes. |
| `backend/db/init/` | `docker/postgres-init/` | It only creates the test databases when Docker Compose first starts Postgres. Beside `migrations/` and `app/infrastructure/db/`, it looked like part of the schema. |

## Kept

- **The backend's `app/` package.** It's FastAPI's convention, every import starts with it, and inside `backend/` it isn't ambiguous.
- **Database, role and URL names** (`pebble`, `pebble_test`, `pebble_e2e`). They name the app, which is right.
- **History.** The dated change records, the audit's findings and the done roadmap items keep the old paths: they describe the tree as it was.
- **`subtasks` in the API** (A-027). The UI says steps, but renaming it changes the API contract and saved JSON, so it waits for a decision.

## Checks

- `docs-links.test.ts` also checks that every repo path the current docs name in backticks exists, so a rename can't leave the docs behind.
- `names.test.ts` fails if the code (frontend, backend, tests, configs, CI) says "Focusbuddy".
- The prompt change re-runs the real-LLM evals; the result is a baseline row.
