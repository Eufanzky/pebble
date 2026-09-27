# Pebble backend

FastAPI backend for Pebble. It runs the AI agents (the orchestrator, CalmSense, SimplifyCore and PebbleVoice) behind a safety pipeline, and reads uploaded documents in memory. The only thing it needs is an LLM: any OpenAI-compatible API, or `LLM_PROVIDER=fake` to run with no model at all.

Tasks, preferences and the activity log live in the browser for now. Roadmap phase 4 adds Postgres.

## Setup

Requires Python 3.12+ and [uv](https://docs.astral.sh/uv/getting-started/installation/), which installs Python 3.12 for you if needed.

```bash
cd backend
uv sync                        # .venv with app + dev dependencies, from uv.lock
cp .env.example .env           # set LLM_API_KEY, or LLM_PROVIDER=fake
uv run uvicorn app.main:app --port 8000 --reload
```

The API is at **http://localhost:8000**, with Swagger UI at **/docs**. The frontend (`cd pebble && npm run dev`) calls it through its `/api` rewrite. For the frontend's chat to work locally, set `DEV_MODE=true`: the frontend doesn't sign in yet (roadmap 4.3).

After changing dependencies, run `uv lock` and commit `uv.lock`.

### Tests and lint

```bash
uv run pytest            # all tests except the real-LLM evals
uv run pytest --cov      # with coverage; fails below 80% overall
uv run coverage report --include="app/domain/*,app/application/*" --fail-under=90   # the layer floor
uv run ruff check        # lint (add --fix for the safe autofixes)
```

Tests run the app in-process with `httpx.ASGITransport`, so they need no network and no external service. Every test runs with fakes behind the ports: `tests/conftest.py` installs a container with the scripted `FakeLLM` (`llm` fixture) and `ScriptedSafety` from `tests/fakes.py` (`safety` fixture). The test layers:

- `tests/domain/`: domain rules
- `tests/unit/application/`: use cases, with fakes
- `tests/contract/`: adapters, against recorded response shapes with respx
- `tests/api/`: HTTP behaviour

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
| GET | `/api/health` | Health check |

Everything except `/api/health` needs a signed-in user (see Authentication).

Errors:
- Unsafe input: 422 with a user-safe message.
- An LLM or safety outage: 503 "Pebble couldn't answer just now."
- A provider rate limit: 503 "Pebble is resting", with `Retry-After`.

## LLM provider

The agents reach the model through the `LLMProvider` port (`app/application/ports/llm.py`). `LLM_PROVIDER` picks the adapter:

| `LLM_PROVIDER` | Adapter | Needs |
|:--|:--|:--|
| `github` (default) | `OpenAICompatibleLLM.github_models` | Retired: GitHub Models shut down on 2026-07-30 (A-018). A new default is pending. |
| `openai` | `OpenAICompatibleLLM.openai` | `LLM_API_KEY`; with `LLM_BASE_URL`, any OpenAI-compatible provider |
| `azure` | `OpenAICompatibleLLM.azure` | `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_DEPLOYMENT` |
| `fake` | `FakeLLM` (`app/infrastructure/llm/fake.py`) | nothing: deterministic offline replies |

`LLM_MODEL` and `LLM_BASE_URL` override the defaults. When the selected provider has no credentials, the LLM is disabled cleanly: every call raises `LLMUnavailableError`. The adapter talks HTTP with `httpx`, and its contract tests (`tests/contract/`) cover success, malformed responses, 429 and timeouts with respx.

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
│   ├── domain/                 # agents/intents/moods, chat, tasks, documents, safety rules (pure Python)
│   ├── application/
│   │   ├── agents/             # use cases: orchestrator (HandleChat), calmsense, simplifycore, pebblevoice
│   │   ├── ports/              # LLMProvider, SafetyChecker, PIIRedactor, DocumentParser, ReaderTokenProvider
│   │   ├── safety.py           # SafetyGate: the input/output pipeline
│   │   ├── documents.py        # ParseDocument
│   │   └── prompts.py          # system prompts and the Pebble voice rules
│   ├── infrastructure/
│   │   ├── config.py           # settings from .env (pydantic-settings)
│   │   ├── llm/                # OpenAI-compatible adapter, FakeLLM, factory
│   │   ├── safety/             # Azure Content Safety (REST), no-op adapter, factory
│   │   ├── pii/                # regex PII redactor
│   │   ├── parsing/            # pypdf + python-docx parser
│   │   └── immersive_reader.py # optional Azure Immersive Reader token
│   └── api/
│       ├── dependencies.py     # wiring: adapters into use cases (set_container() for tests)
│       ├── errors.py           # use-case errors to HTTP
│       ├── presenters.py       # results to camelCase JSON
│       ├── middleware.py       # request logging
│       ├── auth.py             # Entra ID JWT validation (DEV_MODE bypass)
│       ├── routers/            # agents, documents
│       └── schemas/            # request/response models
├── tests/                      # domain/, unit/, contract/, api/, fixtures/
├── pyproject.toml              # dependencies, pytest and ruff config
├── uv.lock
└── .env.example
```

## Authentication

Every endpoint except `/api/health` requires a Microsoft Entra ID bearer token (`api/auth.py`). With `DEV_MODE=true`, validation is skipped and the user is `dev-user-00000000`. Roadmap 4.3 replaces both with Auth.js sign-in and short-lived backend tokens.
