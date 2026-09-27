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

Tests live in `tests/` (layout in `specs/testing.md`). They run the app in-process with `httpx.ASGITransport`, which skips the lifespan, so no Azure service or network is needed. The LLM and Content Safety are faked: `tests/fakes.py` has a scripted `FakeLLM` and a `FakeContentSafety`, and the `llm`, `content_safety` and `content_safety_http` fixtures in `tests/conftest.py` install them (the last one fakes Prompt Shields and Groundedness Detection with respx). `tests/api/test_chat.py` pins today's `/api/agents/chat` behaviour: routing, safety, PII redaction and the response shape.

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

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app, middleware, router registration
│   ├── config.py               # Pydantic settings from .env
│   ├── agents/                 # AI agent logic
│   │   ├── prompts.py          # System prompts with Pebble voice rules
│   │   ├── orchestrator.py     # Intent classification + routing
│   │   ├── task_decomposition.py
│   │   ├── document_simplification.py
│   │   └── motivation.py
│   ├── models/                 # Pydantic request/response schemas
│   │   ├── schemas.py          # Tasks, preferences, activity
│   │   ├── agent_schemas.py    # Agent request/response
│   │   ├── document_schemas.py # Document pipeline
│   │   └── focus_schemas.py    # Focus room
│   ├── routers/                # FastAPI route handlers
│   │   ├── tasks.py
│   │   ├── preferences.py
│   │   ├── activity.py
│   │   ├── agents.py
│   │   ├── documents.py
│   │   ├── focus.py
│   │   └── audit.py
│   └── services/               # Azure service clients
│       ├── auth.py             # Entra ID JWT validation
│       ├── db.py               # Cosmos DB client
│       ├── openai_client.py    # Azure OpenAI
│       ├── content_safety.py   # Content Safety filter
│       ├── blob_storage.py     # Blob Storage uploads
│       ├── doc_intelligence.py # Document Intelligence parsing
│       ├── search.py           # AI Search indexing + RAG
│       ├── webpubsub.py        # Web PubSub real-time
│       └── monitoring.py       # App Insights + request logging
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
