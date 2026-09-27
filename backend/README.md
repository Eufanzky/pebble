# Focusbuddy Backend

FastAPI backend for the Focusbuddy cognitive load reduction assistant. Powers the AI agents, document pipeline, focus rooms, and data persistence behind the Next.js frontend. Built on **Microsoft Foundry** (formerly Azure AI Foundry) and Azure services.

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (installs Python 3.12 for you if needed)
- Azure account with the following services provisioned:
  - **Microsoft Foundry** project (orchestrates agents and AI services)
  - Azure Cosmos DB (NoSQL)
  - Azure OpenAI (GPT-4o deployment)
  - Azure AI Content Safety
  - Azure Blob Storage
  - Azure AI Document Intelligence
  - Azure AI Search
  - Azure Web PubSub
  - Azure Application Insights (optional)
  - Microsoft Entra ID (app registration)

## Setup

### 1–2. Install dependencies

```bash
cd backend
uv sync
```

This creates `.venv/` from `pyproject.toml` and the locked versions in `uv.lock`, including the dev tools (pytest, ruff). After changing dependencies, run `uv lock` and commit `uv.lock`. `requirements.txt` is legacy and goes away in roadmap 2.7.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Azure credentials. See `.env.example` for all required variables. The server will start without credentials configured — services that aren't configured will be skipped gracefully.

### 4. Run the server

```bash
cd backend
uv run uvicorn app.main:app --port 8000 --reload
```

The API is available at **http://localhost:8000**.

Interactive API docs (Swagger UI): **http://localhost:8000/docs**

### Tests and lint

```bash
uv run pytest            # all tests except the real-LLM evals
uv run pytest --cov      # with a coverage report
uv run ruff check        # lint (add --fix for the safe autofixes)
```

Tests live in `tests/` (layout in `specs/testing.md`). They run the app in-process with `httpx.ASGITransport`, which skips the lifespan, so no Azure service or network is needed. Every test runs with fakes behind the ports: `tests/conftest.py` installs a container with the scripted `FakeLLM` (`llm` fixture) and `ScriptedSafety` from `tests/fakes.py` (`safety` fixture). Use cases are tested with fakes in `tests/unit/application/`, domain rules in `tests/domain/`, adapters against recorded response shapes with respx in `tests/contract/`, and HTTP behaviour in `tests/api/`.

### 5. Run the frontend (separate terminal)

```bash
cd pebble
npm install
npm run dev
```

Frontend at **http://localhost:3000**, backend at **http://localhost:8000**.

## API Endpoints

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/{id}` | Get a task |
| PATCH | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

### Preferences
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/preferences` | Get user preferences (creates defaults if none) |
| PUT | `/api/preferences` | Update preferences |

### Activity Log
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity` | List activity entries |
| POST | `/api/activity` | Log an activity entry |

### AI Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agents/decompose` | Break a task into subtasks (CalmSense agent) |
| POST | `/api/agents/simplify` | Simplify text at a reading level (SimplifyCore agent) |
| POST | `/api/agents/motivate` | Generate personalized encouragement (PebbleVoice agent) |
| POST | `/api/agents/chat` | Send a message to Pebble (orchestrator routes to the right agent) |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload and parse a PDF/Word/text file |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/{id}` | Get a document |
| POST | `/api/documents/{id}/simplify` | Simplify document at a reading level |
| POST | `/api/documents/{id}/tasks` | Extract action items as tasks |
| POST | `/api/documents/search` | Search across indexed documents (RAG) |
| DELETE | `/api/documents/{id}` | Delete a document |

### Focus Room
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/focus/rooms` | Create a focus room |
| GET | `/api/focus/rooms` | List active rooms |
| GET | `/api/focus/rooms/{id}` | Get a room |
| POST | `/api/focus/rooms/{id}/join` | Join room (returns WebSocket URL) |
| POST | `/api/focus/rooms/{id}/leave` | Leave room |
| POST | `/api/focus/rooms/{id}/timer` | Start/pause/reset Pomodoro timer |
| POST | `/api/focus/rooms/{id}/complete` | Complete a focus session |

### Audit Trail
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit/decisions` | List agent decisions (filterable by agent) |
| GET | `/api/audit/agents` | List all agents and their roles |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## LLM provider

The agents reach the model through the `LLMProvider` port (`app/application/ports/llm.py`). `LLM_PROVIDER` picks the adapter:

| `LLM_PROVIDER` | Adapter | Needs |
|:--|:--|:--|
| `github` (default) | `OpenAICompatibleLLM.github_models` | `LLM_API_KEY`: a GitHub token with `models:read` |
| `openai` | `OpenAICompatibleLLM.openai` | `LLM_API_KEY` |
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

The backend follows a clean architecture (`specs/tech-stack.md`). The agents are use cases in `application/agents/` (`orchestrator.py`, `calmsense.py`, `simplifycore.py`, `pebblevoice.py`). `services/` is legacy and is removed in roadmap 2.7.

```
backend/
├── app/
│   ├── main.py                 # composition root: app, middleware, router registration
│   ├── domain/                 # entities, value objects, rules (pure Python)
│   ├── application/            # use cases, ports, prompts
│   ├── infrastructure/         # adapters that implement the ports
│   │   └── config.py           # settings from .env (pydantic-settings)
│   ├── api/                    # HTTP: routers, schemas, auth, wiring
│   │   ├── auth.py             # Entra ID JWT validation (DEV_MODE bypass)
│   │   ├── routers/            # tasks, preferences, activity, agents, documents, focus, audit, verify
│   │   └── schemas/            # request/response models (agents, documents, focus, records)
│   └── services/               # legacy: Azure clients (removed in 2.7)
├── tests/                      # pytest suite (conftest.py: app, client and AI-service fixtures; fakes.py)
├── pyproject.toml              # dependencies, pytest and ruff config
├── uv.lock                     # locked dependency versions
├── requirements.txt            # legacy, removed in roadmap 2.7
├── .env.example
└── README.md
```

## Azure & Microsoft Foundry Services

| Service | Purpose |
|---------|---------|
| **Microsoft Foundry** | AI platform — agent orchestration, model deployments, project management |
| Microsoft Foundry Agent Service | Multi-agent orchestration (Pebble orchestrator + sub-agents) |
| Azure Cosmos DB | Tasks, preferences, activity log, documents, rooms |
| Azure OpenAI (GPT-4o) | Task decomposition, document simplification, motivation |
| Azure AI Content Safety | Input/output safety filtering on all agent responses |
| Azure Blob Storage | Uploaded document files |
| Azure AI Document Intelligence | PDF/Word parsing and text extraction |
| Azure AI Search | Vector index for RAG search over user documents |
| Azure Web PubSub | Real-time presence in focus rooms (WebSocket) |
| Azure Application Insights | Request logging, agent decision audit trail |
| Microsoft Entra ID | JWT authentication |

## Authentication

All endpoints (except `/api/health` and `/docs`) require a Bearer token from Microsoft Entra ID. The frontend handles the OAuth flow and sends the token in the `Authorization` header.

```
Authorization: Bearer <entra-id-jwt>
```
