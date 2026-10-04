# 2.7 Remove dead services: requirements

Roadmap item: **2.7** (Phase 2). Branch: `chore/2.7-remove-dead-services`.

## Goal

The backend runs with only an LLM key. Everything the hackathon wired to Azure that the product no longer uses is gone, along with its dependencies.

## Scope

In scope:
- Removed:
  - Semantic Kernel, Cosmos DB, AI Search, Web PubSub and the focus router, Blob Storage, Document Intelligence, Application Insights
  - the verify router (it smoke-tested those services)
  - `deploy.ps1` and `requirements.txt`
  - the unused `openai` SDK, `aiohttp`, `azure-identity`, `azure-ai-contentsafety` and `azure-ai-projects`
  - the lockfile goes from 141 to 47 packages
- The Cosmos-backed endpoints: tasks, preferences, activity, audit, and the document upload/list/get/simplify/tasks/search/delete endpoints. The frontend calls none of them, and they can't work without Cosmos. Phase 4 rebuilds them on Postgres.
- Kept, made thin:
  - request logging (`api/middleware.py`)
  - the Immersive Reader token, now behind a `ReaderTokenProvider` port with an Azure adapter and an unconfigured one
- Settings trimmed to what's used; honest API docs (OpenAPI description, both READMEs, `CLAUDE.md`).
- Tests:
  - the app starts and stops with only an LLM key
  - only working routes are exposed
  - only the four layer packages exist
  - the reader adapter (respx) and endpoint

## Decisions

1. **Delete rather than stub the CRUD endpoints.** A route that can only answer 500 is a dishonest claim (principle 6). 4.1 and 4.2 bring them back with real storage and tests.
2. **Warnings fail the backend tests.** A-008's filter existed only for Semantic Kernel. With it gone, `filterwarnings = error` keeps new deprecations visible.
3. **The Immersive Reader stays optional.** Unconfigured is a 503 on the token endpoint, which the frontend already handles with its built-in reader. 3.3 decides its future.
4. **The root README is corrected, not rewritten.** Removed services, the agents' real status and the endpoint table are fixed now; 9.2 is the full rewrite.
