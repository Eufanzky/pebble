# 3.5 Typed API contract: requirements

Roadmap item: **3.5** (Phase 3). Branch: `feat/3.5-typed-api-contract`.

## Goal

Frontend API types come from FastAPI's OpenAPI schema, never by hand, so changing a backend schema breaks the frontend typecheck.

## Scope

In scope:
- `backend/scripts/export_openapi.py`: prints the schema as stable, sorted JSON.
- `pebble/src/shared/api/`: the committed `openapi.json`, the generated `schema.d.ts`, and `ApiSchema<Name>`.
- `npm run api:schema`, `api:types` and `api:generate`; `openapi-typescript` as a dev dependency.
- `ChatRequest`, `ChatResponse`, the parsed-document and reader-token types come from `ApiSchema`; the MSW handler bodies are typed from them.
- A CI `API contract` job that regenerates both files and fails on a diff.

## Decisions

1. **Both files are committed.** A plain `tsc` or `next build` works without Python, and the diff in a PR shows the contract change.
2. **Requests use the documented camelCase fields** (`tasksCompleted`, not `tasks_completed`). The backend's aliases are camelCase; snake_case only worked through `populate_by_name`. The 1.4 chat test's body assertion is updated to match.
3. **Loose backend strings stay loose.** `intent`, `mood` and the parsed document `type` are plain strings in the schema, so the frontend narrows them itself (`replyMood`, `toDocumentType`). Making them enums in the backend is a later change.
