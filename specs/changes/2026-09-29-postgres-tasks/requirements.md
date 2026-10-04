# 4.1 Postgres and tasks: requirements

Roadmap item: **4.1** (Phase 4). Branch: `feat/4.1-postgres-tasks`.

## Goal

The backend can save each user's tasks and their steps in Postgres, behind a `TaskRepository` port, with the endpoints the frontend will switch to in 4.4.

## Scope

- `docker-compose.yml`: Postgres 17 for local use (`pebble`, plus `pebble_test` for the integration tests). CI's backend job gets a Postgres service container.
- Domain: `Task`, `TaskStep`, `TaskPriority`. Rule: ticking the last open step finishes the task; unticking a step never reopens a finished task (progress only adds up, principle 1).
- Application: the `TaskRepository` port, `PersistenceError`, and the `Tasks` use cases (list, add, update, set steps, tick a step, delete, clear).
- Infrastructure: SQLAlchemy 2 async models (`tasks`, `task_steps`), `SqlTaskRepository` on asyncpg, `UnconfiguredTaskRepository`, Alembic with an async `env.py` and the first migration.
- API: `/api/tasks` (GET, POST, DELETE), `/api/tasks/{id}` (PATCH, DELETE), `/api/tasks/{id}/subtasks` (PUT), `/api/tasks/{id}/subtasks/{subtaskId}` (PATCH). 404 for a task that isn't the user's; 503 without a database or during an outage.
- The OpenAPI schema and generated TS types are regenerated. The frontend doesn't call the endpoints yet.

## Decisions

1. **`DATABASE_URL` stays optional.** The app starts without it and only the task endpoints answer 503, like the other optional services. The frontend works as before until 4.4.
2. **Users are a `user_id` string column for now.** Whatever `get_current_user_id` returns. 4.3 brings Auth.js users; no `users` table until there's something to put in it.
3. **The API says `subtasks`, the domain says steps.** The frontend already calls them `subtasks` (and so does CalmSense's response); the API follows the frontend.
4. **The server picks ids** (UUIDs) for tasks and steps. The 4.5 import sends titles, not ids.
5. **Order is insertion order** (an identity column), not timestamps, so it's stable.
6. **Another user's task is a 404, never a 403,** so ids can't be probed.
7. **One transaction per repository call.** The use cases read, apply a domain rule, and save; a task removed in between is a 404.
8. **The in-memory fake is held to the same contract** as the Postgres repository (one parametrized test file), so API tests on the fake stay honest.
9. **Local Postgres without Docker works too:** any Postgres 17 with the same role and databases.
