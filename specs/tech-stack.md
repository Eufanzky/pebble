# Tech stack

Target stack for the update. The budget is $0: free tiers everywhere, and every external service sits behind an interface so it can be swapped.

## At a glance

| Layer | Choice | Why |
|:--|:--|:--|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 | Already in place; no reason to change. Needs Node 20.9+. |
| Frontend data | TanStack Query | Caching and optimistic updates (e.g. ticking off a step) once data lives in the backend. |
| Auth | Auth.js (NextAuth) with GitHub and Google sign-in | Open source, no vendor, runs natively on Vercel. |
| Backend | FastAPI, Python 3.12+, Pydantic v2 | Already in place. |
| Python tooling | `uv` + `pyproject.toml`, ruff | One lockfile that works the same locally, in CI, and in Docker (replaces conda + `requirements.txt`). |
| Database | PostgreSQL, SQLAlchemy 2 (async) + Alembic | Tasks → steps → activity is relational data. Portable to any host. |
| LLM | `LLMProvider` port; default adapter: OpenAI-compatible client pointed at **GitHub Models** (GPT-4o, free, rate-limited) | Same client covers OpenAI and Azure OpenAI by config. An Anthropic adapter can be added later. |
| Safety | `SafetyChecker` port; default adapter: Azure AI Content Safety (F0 free tier) incl. Prompt Shields | Keeps today's safety behaviour for free. PII redaction stays in-process. |
| Document parsing | `DocumentParser` port; local adapter using `pypdf` and `python-docx` | Free and private: files are parsed in memory and never stored. |
| Immersive Reader | Optional Azure adapter; the built-in reader is the default | Works with no Azure setup at all. |
| Tests | pytest + respx (backend), Vitest + Testing Library + MSW (frontend), axe, Playwright | Full strategy in `testing.md`. |
| CI | GitHub Actions | Lint, typecheck, and tests on every PR. |

## Hosting ($0)

| Part | Host | Notes |
|:--|:--|:--|
| Frontend + Auth.js | Vercel Hobby | Made by the Next.js team. The `/api` rewrite target comes from an env var. |
| Backend | Render free web service (Docker) | Sleeps after 15 min idle; the 30–60 s cold start is accepted. Warm it up before demos. |
| Database | Neon free tier | Scales to zero and wakes in under a second. Unlike Supabase free, it does not pause the project after a week. |

Local development uses `docker compose` for Postgres (and optionally the backend).

## Removed from the hackathon stack

| Removed | Reason |
|:--|:--|
| Semantic Kernel | A thin `LLMProvider` port does the same job with far less coupling. |
| Cosmos DB | Replaced by Postgres (relational data, no Azure lock-in). |
| Entra ID + `DEV_MODE` bypass | Replaced by Auth.js. Local dev gets a proper dev login, not an auth skip. |
| Azure AI Search | Never used by the app. |
| Azure Web PubSub + focus router | Multi-user rooms are out of scope (see `mission.md`). |
| Azure Blob Storage | Documents are no longer stored. |
| Document Intelligence | Replaced by local parsing. |
| Application Insights | Replaced by structured logging; OpenTelemetry can come later. |
| `deploy.ps1` | Replaced by a Dockerfile and host config. |

## Auth flow

Auth.js's session cookie is an encrypted JWE meant only for Next.js, so the backend does not read it.
Instead, the Next.js server signs a short-lived access token (JWT: user id and expiry) with a secret it shares with the backend, and attaches it when proxying `/api/*` calls.
FastAPI verifies that token in one dependency, `get_current_user`.

## Code principles

### Backend: clean architecture

```
backend/app/
  domain/          entities and value objects (Task, Step, Preferences, ActivityEntry). Pure Python, no framework imports.
  application/     use cases (HandleChat, DecomposeTask, SimplifyDocument, ...) and ports (LLMProvider,
                   SafetyChecker, DocumentParser, TaskRepository, ...). Prompts live here.
  infrastructure/  adapters that implement ports: llm/, safety/, parsing/, db/ (SQLAlchemy models + repositories).
  api/             FastAPI routers, request/response schemas, auth, and dependency wiring.
  main.py          composition root: builds adapters, injects them into use cases.
```

- **Dependency rule:** `api → application → domain`. `infrastructure` implements `application` ports. `domain` imports nothing from the project.
- Routers stay thin: parse the request, call one use case, map the result. No business logic, no SDK calls.
- Each agent is a use case that depends only on ports, so it can be tested with a fake LLM.
- Every agent result flows through one pipeline: input safety → PII redaction → agent → WhyBot explanation → output safety → activity log.
- Configuration comes from `pydantic-settings`. A missing optional service disables its feature cleanly.

### Frontend: feature-based

```
pebble/src/
  app/             routes only. Pages are thin and compose feature components.
  features/<name>/ components/, hooks/, api/, lib/, types.ts, index.ts (the public API)
                   features: tasks, documents, chat, focus, activity, settings, companion (the Pebble character)
  shared/          ui/ (buttons, modals, cards), hooks/, lib/ (api client, utils)
```

- A feature imports from `shared/` and from other features only through their `index.ts`.
- Soft limit of about 200 lines per component file. Past that, split it.
- Logic goes in hooks and `lib/`, not in JSX. Components render.
- The Pebble character stays pure CSS and divs, with no SVG or images.
- API types are generated from FastAPI's OpenAPI schema (`openapi-typescript`) and never written by hand.

### Testing

See `testing.md` for the rules, layers, principle checks, coverage floors, and CI gates. In short:
- Nothing is done without tests.
- Behaviour is pinned before refactors.
- PR tests make no real LLM calls.
- CI must be green before merge.
