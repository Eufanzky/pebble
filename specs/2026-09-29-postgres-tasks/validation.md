# 4.1 Postgres and tasks: validation

- [x] `alembic upgrade head` works on an empty database, `downgrade base` undoes it, and `alembic check` finds no drift (`tests/integration/test_migrations.py`).
- [x] The `TaskRepository` contract passes on Postgres and on the in-memory fake, including user isolation for every method.
- [x] User isolation over HTTP: user B gets a 404 for every request naming user A's task, and A's list is unchanged.
- [x] Finishing the last step finishes the task; unticking never reopens it (domain, use case and API tests).
- [x] No database: the app starts and the task endpoints answer 503.
- [x] `uv run pytest --cov` (with `TEST_DATABASE_URL`), both coverage floors, and `ruff check` pass locally; the CI backend job runs the integration tests against a Postgres service container.
- [x] `npm run api:generate` output is committed; `tsc --noEmit` passes.
