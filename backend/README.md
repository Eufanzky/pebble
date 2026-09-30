# Pebble backend

FastAPI backend for Pebble. It runs the AI agents (the orchestrator, CalmSense, SimplifyCore and PebbleVoice) behind a safety pipeline, and reads uploaded documents in memory. The only thing it needs is an LLM: Groq's free tier by default, any OpenAI-compatible API by config, or `LLM_PROVIDER=fake` to run with no model at all.

Tasks, preferences and the activity log are saved per user in Postgres (SQLAlchemy 2 async, Alembic). Every agent result, and every message the safety checks hold back, is written to the activity log server-side. The frontend still keeps all three in the browser until roadmap 4.4 and 4.5.

## Setup

Requires Python 3.12+ and [uv](https://docs.astral.sh/uv/getting-started/installation/), which installs Python 3.12 for you if needed.

```bash
cd backend
uv sync                        # .venv with app + dev dependencies, from uv.lock
cp .env.example .env           # set LLM_API_KEY, or LLM_PROVIDER=fake
docker compose up -d db        # from the repo root: Postgres 17 (optional)
uv run alembic upgrade head    # create or update the tables
uv run uvicorn app.main:app --port 8000 --reload
```

The API is at **http://localhost:8000**, with Swagger UI at **/docs**. The frontend (`cd pebble && npm run dev`) calls it through its `/api` proxy route, signed as the user; set `AUTH_TOKEN_SECRET` to the same value in both `.env` files.

After changing dependencies, run `uv lock` and commit `uv.lock`.

### Database

`DATABASE_URL` (`postgresql+asyncpg://...`) turns on saving. Without it the app starts as before and the task, preferences and activity endpoints answer 503 "Pebble couldn't reach your saved tasks just now"; so does a database outage. Chat and the agents keep working either way: a log entry that can't be written is logged as a warning and skipped. The tables are SQLAlchemy models in `app/infrastructure/db/models.py`. After changing one, generate a migration and check it by hand:

```bash
uv run alembic revision --autogenerate -m "what changed"
uv run alembic upgrade head
```

`tests/integration/test_migrations.py` fails if a model changed without a migration (`alembic check`).

### Tests and lint

```bash
uv run pytest            # all tests except the real-LLM evals
uv run pytest --cov      # with coverage; fails below 80% overall
uv run coverage report --include="app/domain/*,app/application/*" --fail-under=90   # the layer floor
uv run ruff check        # lint (add --fix for the safe autofixes)

# integration tests: a database they may wipe (docker compose creates pebble_test)
TEST_DATABASE_URL=postgresql+asyncpg://pebble:pebble@localhost:5432/pebble_test uv run pytest
```

Tests run the app in-process with `httpx.ASGITransport`, so they need no network and no external service. Every test runs with fakes behind the ports: `tests/conftest.py` installs a container with the scripted `FakeLLM` (`llm` fixture) and `ScriptedSafety` from `tests/fakes.py` (`safety` fixture). The test layers:

- `tests/domain/`: domain rules
- `tests/unit/application/`: use cases, with fakes
- `tests/contract/`: adapters, against recorded response shapes with respx
- `tests/api/`: HTTP behaviour (the stores are the in-memory fakes from `tests/fakes.py`: fixtures `task_repository`, `preferences_repository`, `activity_repository`)
- `tests/integration/`: real Postgres: the migrations, and the task, preferences and activity store contracts, each run against both the Postgres repository and its in-memory fake. Without `TEST_DATABASE_URL` they skip; CI sets `REQUIRE_TEST_DATABASE=true`, so there they fail instead.

Warnings fail the run.

Real-LLM evals live in `tests/evals/` (`uv run pytest -m eval`). They're excluded from the normal run and run weekly in CI; see `tests/evals/README.md` for the scores and baselines.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agents/chat` | Talk to Pebble. The orchestrator routes to CalmSense, SimplifyCore or PebbleVoice, or answers itself (chat, distress). Returns `{intent, response, mood, agentName, data}`. |
| POST | `/api/agents/decompose` | CalmSense: break a task into time-boxed steps |
| POST | `/api/agents/simplify` | SimplifyCore: simplify text to a reading level (1-10), with action items and a groundedness check |
| POST | `/api/agents/motivate` | PebbleVoice: specific encouragement from the user's progress |
| POST | `/api/documents/parse` | Read a PDF, Word (.docx) or text file's text in memory (never stored) |
| GET | `/api/documents/immersive-reader/token` | Optional Azure Immersive Reader token (503 when not configured) |
| GET | `/api/tasks` | Your tasks, in the order you added them, each with its `subtasks` |
| POST | `/api/tasks` | Add a task (201). Pebble picks the ids |
| PATCH | `/api/tasks/{id}` | Change only the fields sent, e.g. `{"completed": true}` |
| DELETE | `/api/tasks/{id}` | Remove one task (204) |
| DELETE | `/api/tasks` | Clear your list (204) |
| PUT | `/api/tasks/{id}/subtasks` | Replace a task's steps (e.g. from CalmSense); new steps start open |
| PATCH | `/api/tasks/{id}/subtasks/{subtaskId}` | Tick a step on or off. The last open step finishes the task; unticking never reopens it |
| GET | `/api/preferences` | Your preferences over the defaults (a new account gets the defaults) |
| PATCH | `/api/preferences` | Change only the fields sent; returns all of them |
| GET | `/api/activity?limit=50` | Your activity log, newest first (limit 1-200) |
| POST | `/api/activity` | Log something you did that Pebble reacted to (201). The agents log their own results |
| GET | `/api/health` | Health check |

Everything except `/api/health` needs a signed-in user (see Authentication).

Errors:
- Unsafe input: 422 with a user-safe message.
- An LLM or safety outage: 503 "Pebble couldn't answer just now."
- A provider rate limit: 503 "Pebble is resting", with `Retry-After`.
- A task or step that isn't yours or doesn't exist: 404 (another user's task looks exactly like a missing one).
- No database, or a database outage: 503.

## Activity log

Each agent use case takes an optional `ActivityLog` (`app/application/activity.py`). When called with a `user_id` (the routers always pass one), it writes one entry per result: the agent, what it did, its reasoning, and the safety status. `watch()` logs a message held back by Prompt Shields or Content Safety, or a flagged reply, as a `flagged` entry without the text, and lets the error through. Entries only ever hold redacted text, shortened to 50 characters. `tests/api/test_activity_pipeline.py` checks this for every agent, through chat and through the direct endpoints.

## LLM provider

The agents reach the model through the `LLMProvider` port (`app/application/ports/llm.py`). `LLM_PROVIDER` picks the adapter:

| `LLM_PROVIDER` | Adapter | Needs |
|:--|:--|:--|
| `groq` (default) | `OpenAICompatibleLLM.groq` | `LLM_API_KEY`: a free key from [console.groq.com/keys](https://console.groq.com/keys). Model `openai/gpt-oss-120b`, reasoning effort `low`. |
| `openai` | `OpenAICompatibleLLM.openai` | `LLM_API_KEY`; with `LLM_BASE_URL`, any OpenAI-compatible provider |
| `azure` | `OpenAICompatibleLLM.azure` | `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_DEPLOYMENT` |
| `fake` | `FakeLLM` (`app/infrastructure/llm/fake.py`) | nothing: deterministic offline replies |

`LLM_MODEL`, `LLM_BASE_URL` and `LLM_REASONING_EFFORT` (for reasoning models) override the defaults. Why Groq: a permanent free tier with no card, no prompts kept by default (enable Zero Data Retention in Groq's Data Controls if your plan offers it), and JSON mode on every model. Its free limits for `gpt-oss-120b` are 30 requests and 8K tokens a minute, and 1,000 requests and 200K tokens a day, enough for demos and a small group. If the model's JSON-mode reply is invalid, Groq answers 400 `json_validate_failed`; the agents treat that like any unusable reply and answer gently. When the selected provider has no credentials, the LLM is disabled cleanly: every call raises `LLMUnavailableError`. The adapter talks HTTP with `httpx`, and its contract tests (`tests/contract/`) cover success, malformed responses, `json_validate_failed`, 429 and timeouts with respx.

## Safety

Every agent's input and output goes through `SafetyGate` (`app/application/safety.py`):

- Input: Prompt Shields, then Content Safety, then PII redaction.
- Output: Content Safety, then PII redaction.

Content at severity 2 or more in any category (Hate, SelfHarm, Sexual, Violence) is rejected (`app/domain/safety.py`).

- `SafetyChecker` port: `AzureContentSafety` (REST, `infrastructure/safety/`) when `CONTENT_SAFETY_ENDPOINT` and `CONTENT_SAFETY_KEY` are set, otherwise `NoOpSafetyChecker`. Text analysis fails closed. Prompt Shields and Groundedness fail open with a warning.
- `PIIRedactor` port: `RegexPIIRedactor` (in-process: emails, phones, SSNs, cards). It always runs.

## Documents

`POST /api/documents/parse` reads an upload's text with the `DocumentParser` port. The adapter is `LocalDocumentParser` (`infrastructure/parsing/`), which uses `pypdf` and `python-docx`. The file is parsed in memory and never stored. Limits and messages:

| Case | Status |
|:--|:--|
| Over 10 MB | 413 |
| Not PDF, .docx, .txt or .md | 415 |
| Damaged, password-protected, or no text (a scan) | 422 |

Fixtures live in `tests/fixtures/documents/`. Regenerate them with `uv run python tests/fixtures/documents/make_fixtures.py`.

## Architecture: the dependency rule

```
api ──▶ application ──▶ domain
             ▲
infrastructure
```

- `domain` imports nothing from the project and no framework: only the standard library.
- `application` imports only `domain`. Use cases depend on ports (interfaces), never on SDKs.
- `infrastructure` implements the application ports. It never imports `api`.
- `api` may import any layer: it parses requests, calls one use case, maps the result, and wires adapters into use cases.
- `main.py` is the composition root.

`tests/unit/test_architecture.py` enforces the rule by parsing every module's imports, so a violation fails `uv run pytest`.

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # composition root: app, middleware, routers
│   ├── domain/                 # agents/intents/moods, chat, tasks and steps, preferences, activity, documents, safety (pure Python)
│   ├── application/
│   │   ├── agents/             # use cases: orchestrator (HandleChat), calmsense, simplifycore, pebblevoice
│   │   ├── ports/              # LLMProvider, SafetyChecker, PIIRedactor, DocumentParser, ReaderTokenProvider, TaskRepository, PreferencesRepository, ActivityRepository
│   │   ├── safety.py           # SafetyGate: the input/output pipeline
│   │   ├── documents.py        # ParseDocument
│   │   ├── tasks.py            # Tasks: the task list use cases
│   │   ├── preferences.py      # UserPreferences
│   │   ├── activity.py         # ActivityLog, and the pipeline's note()/watch() helpers
│   │   └── prompts.py          # system prompts and the Pebble voice rules
│   ├── infrastructure/
│   │   ├── config.py           # settings from .env (pydantic-settings)
│   │   ├── llm/                # OpenAI-compatible adapter, FakeLLM, factory
│   │   ├── safety/             # Azure Content Safety (REST), no-op adapter, factory
│   │   ├── pii/                # regex PII redactor
│   │   ├── parsing/            # pypdf + python-docx parser
│   │   ├── db/                 # SQLAlchemy models, engine, Sql{Task,Preferences,Activity}Repository
│   │   └── immersive_reader.py # optional Azure Immersive Reader token
│   └── api/
│       ├── dependencies.py     # wiring: adapters into use cases (set_container() for tests)
│       ├── errors.py           # use-case errors to HTTP
│       ├── presenters.py       # results to camelCase JSON
│       ├── middleware.py       # request logging
│       ├── auth.py             # get_current_user: verifies the Next.js server's short-lived token
│       ├── routers/            # agents, documents, tasks, preferences, activity
│       └── schemas/            # request/response models
├── migrations/                 # Alembic (env.py, versions/); config in alembic.ini
├── tests/                      # domain/, unit/, contract/, api/, integration/, fixtures/
├── pyproject.toml              # dependencies, pytest and ruff config
├── uv.lock
└── .env.example
```

## Authentication

Users sign in with Auth.js in the Next.js app (GitHub, Google, or a dev login for local use and E2E). The browser never talks to this backend directly: the Next.js server proxies every `/api/*` call and adds a bearer token it signs for that request (HS256 with `AUTH_TOKEN_SECRET`, 5 minutes; `sub` is the user id such as `github:123`, `iss` is `pebble-web`, `aud` is `pebble-api`).

`get_current_user` (`api/auth.py`) verifies it on every endpoint except `/api/health`:

| Case | Status |
|:--|:--|
| No token, a bad signature, expired, wrong issuer or audience, no `sub`/`exp`/`iat` | 401 |
| `AUTH_TOKEN_SECRET` not set | 503 "Sign-in isn't set up yet." |

There is no bypass; `DEV_MODE` and Entra ID are gone.
