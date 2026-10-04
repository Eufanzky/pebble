# Tech stack

The stack, as built through phase 6 (hosting is planned for phase 10). The budget is $0: free tiers everywhere, and every external service sits behind an interface so it can be swapped.

## At a glance

| Layer | Choice | Why |
|:--|:--|:--|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 | Already in place; no reason to change. Needs Node 22.13+ (for Vitest and jsdom). |
| Frontend data | TanStack Query | Caching and optimistic updates (e.g. ticking off a step) once data lives in the backend. |
| Auth | Auth.js (NextAuth) with GitHub and Google sign-in | Open source, no vendor, runs natively on Vercel. |
| Backend | FastAPI, Python 3.12+, Pydantic v2 | Already in place. |
| Python tooling | `uv` + `pyproject.toml`, ruff | One lockfile that works the same locally, in CI, and in Docker (replaces conda + `requirements.txt`). |
| Database | PostgreSQL, SQLAlchemy 2 (async) + Alembic | Tasks → steps → activity is relational data. Portable to any host. |
| LLM | `LLMProvider` port; default adapter: OpenAI-compatible client pointed at **Groq's free tier** (`openai/gpt-oss-120b`, no card, rate-limited) | Free for good (rate caps, not credits), keeps no prompts by default (optional zero data retention), JSON mode on every model. Same client covers OpenAI, Azure OpenAI and other compatible hosts by config. GitHub Models, the original choice, was retired on 2026-07-30 (A-018). |
| Safety | `SafetyChecker` port; default adapter: Azure AI Content Safety (F0 free tier) incl. Prompt Shields | Keeps today's safety behaviour for free. PII redaction stays in-process. |
| Document parsing | `DocumentParser` port; local adapter using `pypdf` and `python-docx` | Free and private: files are parsed in memory and never stored. |
| Immersive Reader | Optional Azure adapter; the built-in reader is the default | Works with no Azure setup at all. |
| Tests | pytest + respx (backend), Vitest + Testing Library + MSW (frontend), axe, Playwright | Full strategy in `testing.md`. |
| Dead code | knip (frontend), vulture (backend) | Unused files, exports and dependencies fail CI (6.1). |
| CI | GitHub Actions | Lint, dead code, typecheck, tests, the API contract and E2E on every PR. |

## Hosting ($0, planned in phase 10)

| Part | Host | Notes |
|:--|:--|:--|
| Frontend + Auth.js | Vercel Hobby | Made by the Next.js team. The `/api` proxy route forwards to `BACKEND_URL`. |
| Backend | Render free web service (Docker) | Sleeps after 15 min idle; the 30–60 s cold start is accepted. Warm it up before demos. |
| Database | Neon free tier | Scales to zero and wakes in under a second. Unlike Supabase free, it does not pause the project after a week. |

Local development uses `docker compose` for Postgres (the `pebble`, `pebble_test` and `pebble_e2e` databases); the backend and frontend run directly.

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
Instead, the Next.js server signs a short-lived access token (HS256 JWT: `sub` is the user id, `iss` `pebble-web`, `aud` `pebble-api`, 5 minutes) with `AUTH_TOKEN_SECRET`, which it shares with the backend, and attaches it in `app/api/[...path]/route.ts`, the route that proxies every `/api/*` call.
FastAPI verifies that token in one dependency, `get_current_user`.

## Code principles

### Backend: clean architecture

```
backend/app/
  domain/          entities and value objects (Task, Step, Preferences, ActivityEntry, ProgressEvent). Pure Python, no framework imports.
  application/     use cases (HandleChat, DecomposeTask, SimplifyDocument, ...) and ports (LLMProvider,
                   SafetyChecker, DocumentParser, TaskRepository, ...). Prompts live here.
  infrastructure/  adapters that implement ports: llm/, safety/, pii/, parsing/, db/ (SQLAlchemy models + repositories), config.py.
  api/             FastAPI routers, request/response schemas, auth, and dependency wiring.
  main.py          composition root: the app, middleware and routers (api/dependencies.py wires adapters into use cases).
```

- **Dependency rule:** `api → application → domain`. `infrastructure` implements `application` ports. `domain` imports nothing from the project.
- Routers stay thin: parse the request, call one use case, map the result. No business logic, no SDK calls.
- Each agent is a use case that depends only on ports, so it can be tested with a fake LLM.
- Every agent result flows through one pipeline: input safety → PII redaction → agent → output safety → activity log. A WhyBot explanation joins it after the agent in 7.1.
- Configuration comes from `pydantic-settings`. A missing optional service disables its feature cleanly.

### Frontend: feature-based

```
frontend/src/
  app/             routes only. Pages are thin and compose feature components.
  features/<name>/ components/, hooks/, api/, lib/, types.ts, index.ts (the public API)
                   features: tasks, documents, chat, focus, activity, settings, stats, auth, companion (the Pebble character)
  shared/          ui/ (the design system: tokens, primitives), hooks/, lib/ (api client, query client), preferences/ (read by
                   every feature), api/ (generated OpenAPI types)
```

- A feature imports from `shared/` and from other features only through their `index.ts`. ESLint enforces this, and `shared/` never imports a feature.
- The app shell (providers, navigation, global chat) lives in `app/(signed-in)/_shell/`, since it composes features. `app/(signed-in)/` holds the signed-in pages; `/signin` sits outside it.
- Soft limit of about 200 lines per component file. Past that, split it.
- Logic goes in hooks and `lib/`, not in JSX. Components render.
- The Pebble character stays pure CSS and divs, with no SVG or images.
- API types are generated from FastAPI's OpenAPI schema (`openapi-typescript`) and never written by hand.
- Styles use the design tokens in `shared/ui/tokens.css`; no colour is defined anywhere else (a test checks it).

### Testing

See `testing.md` for the rules, layers, principle checks, coverage floors, and CI gates. In short:
- Nothing is done without tests.
- Behaviour is pinned before refactors.
- PR tests make no real LLM calls.
- CI must be green before merge.
