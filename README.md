<div align="center">

# 🐾 Pebble

**An AI-powered cognitive load reduction assistant with an animated CSS cat companion**

Pebble helps neurodivergent users (ADHD, autism, dyslexia) manage tasks, simplify documents, and stay focused through a calm, supportive interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Microsoft Foundry](https://img.shields.io/badge/Microsoft_Foundry-AI_Platform-0078D4?logo=microsoft&logoColor=white)](https://ai.azure.com/)

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
| **⚙️ Backend** | FastAPI, Python 3.12+, Microsoft Foundry, Cosmos DB | `backend/` |

### 🤖 Multi-Agent System

All agents are orchestrated through **Microsoft Foundry** using **Semantic Kernel** and **Foundry Models (GPT-4o)**.

| Agent | Role |
|:------|:-----|
| **🧠 Pebble Orchestrator** | Classifies user intent and routes to the right agent |
| **🧩 CalmSense** | Task decomposition with time-boxed subtasks |
| **📖 SimplifyCore** | Document simplification at target reading levels |
| **💬 PebbleVoice** | Personalized encouragement (never generic platitudes) |
| **🔄 AdaptLens** | User preference adaptation over time |
| **❓ WhyBot** | Explainability generation for every AI decision |
| **🔗 BridgeBot** | Third-party integrations (Teams, Outlook, Slack, etc.) |

### ☁️ Microsoft Foundry & Azure Services

| Service | Purpose |
|:--------|:--------|
| **Microsoft Foundry** | AI platform — agent orchestration, Foundry Models (GPT-4o), and inference |
| **Foundry Tools — Content Safety** | Input/output safety filtering (severity ≥ 2 = rejected) |
| **Foundry Tools — Document Intelligence** | PDF/Word document parsing |
| **Foundry Tools — Immersive Reader** | Text-to-speech, syllable highlighting, line focus |
| **Azure AI Search** | Vector indexing and RAG queries |
| **Azure Cosmos DB** | NoSQL storage for all collections |
| **Microsoft Entra ID** | JWT authentication |
| **Azure Blob Storage** | Document file uploads |
| **Azure Web PubSub** | Real-time WebSocket for focus rooms |
| **Azure Monitor — Application Insights** | Telemetry and audit logging |

> **Note:** The platform formerly known as *Azure AI Services* / *Azure Cognitive Services* is now **Foundry Tools** under the unified **Microsoft Foundry** platform. See [What is Microsoft Foundry?](https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry) for details.

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|:------------|:--------|
| **Node.js** | 18+ |
| **Python** | 3.12+ |
| **Conda** | [Install guide](https://docs.conda.io/en/latest/) |
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
| `npm start` | Serve production build |

### ⚙️ Backend

```bash
# 1. Create and activate environment
conda create -n focusbuddy python=3.12 -y
conda activate focusbuddy

# 2. Install dependencies
cd backend
pip install -r requirements.txt

# 3. Configure credentials
cp .env.example .env
# Edit .env with your Azure credentials

# 4. Start the server
uvicorn app.main:app --port 8000 --reload
```

The API runs at **http://localhost:8000**. Swagger docs at **http://localhost:8000/docs**.

> The server starts gracefully even without all Azure credentials configured — unconfigured services are skipped.

### 🔗 Running Both Together

In two terminals:

```bash
# Terminal 1 — Backend
conda activate focusbuddy
cd backend
uvicorn app.main:app --port 8000 --reload

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
│   │   └── lib/                     # Types, constants, API client, utilities
│   └── public/                      # Static assets (backgrounds, icons)
├── ⚙️ backend/                      # Backend API (FastAPI)
│   ├── app/
│   │   ├── main.py                  # App creation, middleware, router registration
│   │   ├── config.py                # Settings from .env
│   │   ├── agents/                  # AI agent implementations (orchestrator + specialized agents)
│   │   ├── models/                  # Pydantic request/response schemas
│   │   ├── routers/                 # API route handlers (/api/*)
│   │   └── services/                # Azure & Foundry service clients
│   ├── requirements.txt
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
| `GET/POST /api/tasks` | Task CRUD |
| `GET/PUT /api/preferences` | User preferences |
| `GET/POST /api/activity` | Activity log |
| `POST /api/agents/*` | AI agents — decompose, simplify, motivate, chat |
| `POST /api/documents/*` | Upload, parse, simplify, extract, RAG search |
| `GET/POST /api/focus/rooms` | Focus rooms with Pomodoro timer |
| `GET /api/audit` | Agent decision audit trail |

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
