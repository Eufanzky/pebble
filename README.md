<div align="center">

# 🐾 Pebble

**An AI-powered cognitive load reduction assistant with an animated CSS cat companion**

Pebble helps neurodivergent users (ADHD, autism, dyslexia) manage tasks, simplify documents, and stay focused through a calm, supportive interface.

[![CI](https://github.com/Eufanzky/pebble/actions/workflows/ci.yml/badge.svg)](https://github.com/Eufanzky/pebble/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

<div align="center">

### 📐 Architecture

</div>

![Architecture Diagram](docs/architecture.png)

<div align="center">

> 📊 [**Presentation Slides (PowerPoint)**](docs/Pebble_Original_English.pptx)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🐱 Pebble Companion
- Animated CSS cat that reacts to your progress with **4 mood states** (sleepy, normal, happy, excited)
- **7 hand-crafted character models** — all pure CSS, no images
- 5 color themes and 3 personality modes
- Time-aware greetings and rotating motivational messages

</td>
<td width="50%">

### 📋 Task Management
- Color-coded tasks by category (study, communication, project, wellbeing)
- AI-powered **task decomposition** — breaks large tasks into time-boxed subtasks
- Explainability cards ("Why?") for every AI decision
- Roadmap view as an alternative vertical timeline
- **Distress detection** — responds to phrases like "I'm overwhelmed" with gentle support

</td>
</tr>
<tr>
<td width="50%">

### 📄 Document Simplification
- Upload PDFs, Word documents, or text files
- **Reading level slider** (1–10) based on Flesch-Kincaid readability grades
- Side-by-side original vs. simplified view
- Comprehension checks with supportive feedback
- Extract action items as tasks or multi-day study plans
- **Immersive Reader** integration (text-to-speech, syllable highlighting, line focus)

</td>
<td width="50%">

### 🎯 Focus Rooms
- Virtual co-working spaces with ambient presence (no cameras, no microphones)
- Built-in **Pomodoro timer** with circular progress visualization
- Multiple rooms with live participant counts
- Audio chime on session completion

</td>
</tr>
<tr>
<td width="50%">

### 📊 Activity Log & Explainability
- Tracks every AI agent decision with full reasoning
- **6 named agents**: CalmSense, AdaptLens, SimplifyCore, PebbleVoice, WhyBot, BridgeBot
- Safety status on every action (passed/flagged)
- Filterable by agent

</td>
<td width="50%">

### ♿ Accessibility
- **Reduce animations** toggle (WCAG 2.2 compliant)
- **Calm mode** — strips all emoji and decorative symbols
- Reading level preference for document simplification
- Configurable task chunk sizes (small/medium/large)
- Keyboard navigation with focus management
- Skip-to-content link and full ARIA support

</td>
</tr>
</table>

---

## 🏗️ Architecture

The project has two main components:

| Layer | Stack | Directory |
|:------|:------|:----------|
| **🖥️ Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 | `pebble/` |
| **⚙️ Backend** | FastAPI, Python 3.12+, clean architecture, any OpenAI-compatible LLM | `backend/` |

### 🤖 Multi-Agent System

Each agent is a use case behind small interfaces (ports), so the LLM and the safety service can be swapped. Any OpenAI-compatible API works (OpenAI, Azure OpenAI, or another provider through `LLM_BASE_URL`), and `LLM_PROVIDER=fake` runs everything offline. GitHub Models, the planned free default, was retired on 2026-07-30; a new default is still to be chosen.

| Agent | Role | Status |
|:------|:-----|:-------|
| **🧠 Pebble Orchestrator** | Classifies user intent and routes to the right agent | Working |
| **🧩 CalmSense** | Task decomposition with time-boxed subtasks | Working |
| **📖 SimplifyCore** | Document simplification at target reading levels | Working |
| **💬 PebbleVoice** | Specific encouragement (never generic platitudes) | Working |
| **🔄 AdaptLens** | Suggests preference changes from how you use Pebble | Planned (roadmap 5.3) |
| **❓ WhyBot** | A plain-language "why" for every AI decision | Planned (roadmap 5.1) |
| **🔗 BridgeBot** | Calendar export and integrations | Planned (roadmap 5.4) |

### 🛡️ Safety and privacy

Every message goes through Prompt Shields, Content Safety (severity ≥ 2 is rejected) and PII redaction before any model sees it, and every reply is checked again. Documents are parsed in memory and never stored.

### ☁️ External services

| Service | Purpose | Needed? |
|:--------|:--------|:--------|
| **An OpenAI-compatible LLM** (OpenAI, Azure OpenAI, ...) | The LLM behind every agent | Yes, or `LLM_PROVIDER=fake` |
| **Azure AI Content Safety** (free F0 tier) | Content Safety and Prompt Shields | Optional; PII redaction always runs |
| **Azure Immersive Reader** | Microsoft's reader for documents | Optional; the built-in reader is the fallback |
| **Microsoft Entra ID** | Sign-in (replaced by Auth.js in roadmap 4.3) | Optional with `DEV_MODE=true` |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|:------------|:--------|
| **Node.js** | 22.13+ (Vitest and jsdom need it) |
| **Python** | 3.12+ |
| **uv** | [Install guide](https://docs.astral.sh/uv/getting-started/installation/) |
| **Azure account** | With services provisioned (see backend setup) |

### 🖥️ Frontend

```bash
cd pebble
npm install
npm run dev
```

The frontend runs at **http://localhost:3000**. No environment variables or external services needed — all features work standalone with sample data.

| Command | Description |
|:--------|:------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (catches TypeScript errors) |
| `npm run lint` | ESLint check |
| `npm test` | Vitest unit and component tests, plus the guilt scan (`npm run test:watch` to watch) |
| `npm start` | Serve production build |

### ⚙️ Backend

```bash
# 1. Install dependencies (creates .venv from uv.lock)
cd backend
uv sync

# 2. Configure: LLM_PROVIDER=openai + LLM_API_KEY (+ LLM_BASE_URL for other providers), or LLM_PROVIDER=fake
cp .env.example .env

# 3. Start the server
uv run uvicorn app.main:app --port 8000 --reload
```

Run the backend tests with `uv run pytest` and the linter with `uv run ruff check`.

CI (`.github/workflows/ci.yml`) runs the same checks on every pull request and on `main`: frontend lint, `tsc --noEmit`, tests and build; backend `ruff check`, and `pytest` with coverage floors (80% overall, 90% on the domain and application layers).

The API runs at **http://localhost:8000**. Swagger docs at **http://localhost:8000/docs**.

> The server starts gracefully even without all Azure credentials configured — unconfigured services are skipped.

### 🔗 Running Both Together

In two terminals:

```bash
# Terminal 1 — Backend
cd backend
uv run uvicorn app.main:app --port 8000 --reload

# Terminal 2 — Frontend
cd pebble
npm run dev
```

| | URL |
|:--|:----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **Swagger Docs** | http://localhost:8000/docs |

---

## 📁 Project Structure

```
Focusbuddy/
├── 🖥️ pebble/                      # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                     # App Router pages (/today, /documents, /activity, /focus, /settings)
│   │   ├── components/              # UI components (pebble models, tasks, documents, focus, chat, settings)
│   │   ├── contexts/                # React context providers (preferences, pebble, tasks, activity, toast)
│   │   ├── hooks/                   # Custom hooks (localStorage, timeOfDay, reduceMotion, focusOnNav)
│   │   ├── data/                    # Sample data (tasks, documents, activity, pebble messages)
│   │   ├── lib/                     # Types, constants, API client, utilities
│   │   └── test/                    # Vitest setup, MSW server, render helpers
│   └── public/                      # Static assets (backgrounds, icons)
├── ⚙️ backend/                      # Backend API (FastAPI)
│   ├── app/
│   │   ├── main.py                  # Composition root: app, middleware, router registration
│   │   ├── domain/                  # Entities and rules (pure Python)
│   │   ├── application/             # Use cases, ports, prompts
│   │   ├── infrastructure/          # Adapters for the ports, settings (config.py)
│   │   └── api/                     # Routers, schemas, auth, wiring
│   ├── tests/                       # pytest suite
│   ├── pyproject.toml               # Dependencies (uv), pytest and ruff config
│   ├── uv.lock
│   └── .env.example
├── 📐 docs/
│   ├── architecture.png             # System architecture diagram
│   └── Pebble_Original_English.pptx # Presentation slides
└── README.md
```

---

## 📡 API Reference

See [**backend/README.md**](backend/README.md) for full API endpoint documentation.

| Endpoint | Description |
|:---------|:------------|
| `POST /api/agents/chat` | Talk to Pebble: the orchestrator routes to the right agent |
| `POST /api/agents/{decompose,simplify,motivate}` | Call CalmSense, SimplifyCore or PebbleVoice directly |
| `POST /api/documents/parse` | Read a PDF, Word or text file's text (in memory, never stored) |
| `GET /api/documents/immersive-reader/token` | Optional Immersive Reader token |

Tasks, preferences and the activity log live in the browser for now; roadmap phase 4 moves them to Postgres.

---

## 🎨 Design Principles

| Principle | Details |
|:----------|:--------|
| **🌙 Dark mode only** | Background `#0F0D0A`, no light theme |
| **🧘 No anxiety-inducing patterns** | No streaks, no "days missed", no red badges, no shame language |
| **🤖 Responsible AI** | Every AI decision has an explainability card; Content Safety filtering on all agent I/O |
| **♿ Accessibility first** | Reduce animations, calm mode, reading level slider, keyboard navigation |
| **🎨 Pure CSS character** | All 7 Pebble models use divs with `border-radius`, no SVGs or images |

---

## 📄 License

See [LICENSE](LICENSE) for details.
