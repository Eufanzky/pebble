# Pebble

An AI-powered cognitive load reduction assistant with an animated CSS cat companion. Pebble helps neurodivergent users (ADHD, autism, dyslexia) manage tasks, simplify documents, and stay focused through a calm, supportive interface.

![Architecture](docs/architecture.png)

> [Presentation Slides (PowerPoint)](docs/Pebble_Original_English.pptx)

---

## Features

### Pebble Companion
- Animated CSS cat that reacts to your progress with 4 mood states (sleepy, normal, happy, excited)
- 7 hand-crafted character models — all pure CSS, no images
- 5 color themes and 3 personality modes
- Time-aware greetings and rotating motivational messages

### Task Management
- Color-coded tasks by category (study, communication, project, wellbeing)
- AI-powered task decomposition — breaks large tasks into time-boxed subtasks
- Explainability cards ("Why?") for every AI decision
- Roadmap view as an alternative vertical timeline visualization
- Distress detection — responds to phrases like "I'm overwhelmed" with gentle support

### Document Simplification
- Upload PDFs, Word documents, or text files
- Reading level slider (1–10) based on Flesch-Kincaid readability grades
- Side-by-side original vs. simplified view
- Comprehension checks with supportive feedback
- Extract action items as tasks or multi-day study plans
- Azure Immersive Reader integration (text-to-speech, syllable highlighting, line focus)

### Focus Rooms
- Virtual co-working spaces with ambient presence (no cameras, no microphones)
- Built-in Pomodoro timer with circular progress visualization
- Multiple rooms with live participant counts
- Audio chime on session completion

### Activity Log & Explainability
- Tracks every AI agent decision with full reasoning
- 6 named agents: CalmSense, AdaptLens, SimplifyCore, PebbleVoice, WhyBot, BridgeBot
- Safety status on every action (passed/flagged)
- Filterable by agent

### Accessibility
- Reduce animations toggle (WCAG 2.2 compliant)
- Calm mode — strips all emoji and decorative symbols
- Reading level preference for document simplification
- Configurable task chunk sizes (small/medium/large)
- Keyboard navigation with focus management
- Skip-to-content link and full ARIA support

---

## Architecture

The project has two main components:

| Layer | Stack | Directory |
|-------|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 | `pebble/` |
| **Backend** | FastAPI, Python 3.12+, Azure AI services, Cosmos DB | `backend/` |

### Multi-Agent System

| Agent | Role |
|-------|------|
| **Pebble Orchestrator** | Classifies user intent and routes to the right agent |
| **CalmSense** | Task decomposition with time-boxed subtasks |
| **SimplifyCore** | Document simplification at target reading levels |
| **PebbleVoice** | Personalized encouragement (never generic platitudes) |
| **AdaptLens** | User preference adaptation over time |
| **WhyBot** | Explainability generation for every AI decision |
| **BridgeBot** | Third-party integrations (Teams, Outlook, Slack, etc.) |

### Azure Services

| Service | Purpose |
|---------|---------|
| Microsoft Foundry | AI platform — agent orchestration and model deployments |
| Azure Cosmos DB | NoSQL storage for all collections |
| Azure OpenAI (GPT-4o) | LLM for all agents |
| Microsoft Entra ID | JWT authentication |
| Azure AI Content Safety | Input/output safety filtering |
| Azure Blob Storage | Document file uploads |
| Azure AI Document Intelligence | PDF/Word parsing |
| Azure AI Search | Vector indexing and RAG queries |
| Azure Web PubSub | Real-time WebSocket for focus rooms |
| Azure Application Insights | Telemetry and audit logging |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12+ and [Conda](https://docs.conda.io/en/latest/)
- **Azure account** with services provisioned (see backend setup)

### Frontend

```bash
cd pebble
npm install
npm run dev
```

The frontend runs at **http://localhost:3000**. No environment variables or external services needed — all features work standalone with sample data.

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (catches TypeScript errors) |
| `npm run lint` | ESLint check |
| `npm start` | Serve production build |

### Backend

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

The server starts gracefully even without all Azure credentials configured — unconfigured services are skipped.

### Running Both Together

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

Frontend: http://localhost:3000 | Backend: http://localhost:8000

---

## Project Structure

```
Focusbuddy/
├── pebble/                     # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                # App Router pages (/today, /documents, /activity, /focus, /settings)
│   │   ├── components/         # UI components (pebble models, tasks, documents, focus, settings)
│   │   ├── contexts/           # React context providers (preferences, pebble, tasks, activity, toast)
│   │   ├── hooks/              # Custom hooks (localStorage, timeOfDay, reduceMotion, focusOnNav)
│   │   ├── data/               # Sample data (tasks, documents, activity, pebble messages)
│   │   └── lib/                # Types, constants, utilities
│   └── public/                 # Static assets (backgrounds, icons)
├── backend/                    # Backend API (FastAPI)
│   ├── app/
│   │   ├── main.py             # App creation, middleware, router registration
│   │   ├── config.py           # Settings from .env
│   │   ├── agents/             # AI agent implementations
│   │   ├── models/             # Pydantic schemas
│   │   ├── routers/            # API route handlers
│   │   └── services/           # Azure service clients
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── architecture.png        # System architecture diagram
│   └── Pebble_Original_English.pptx  # Presentation slides
└── README.md
```

---

## API Reference

See [backend/README.md](backend/README.md) for the full API endpoint documentation, including:

- `/api/tasks` — Task CRUD
- `/api/preferences` — User preferences
- `/api/activity` — Activity log
- `/api/agents` — AI agents (decompose, simplify, motivate, chat)
- `/api/documents` — Upload, parse, simplify, extract, RAG search
- `/api/focus/rooms` — Focus rooms with Pomodoro timer
- `/api/audit` — Agent decision audit trail

---

## Design Principles

- **Dark mode only** — background `#0F0D0A`, no light theme
- **No anxiety-inducing patterns** — no streaks, no "days missed", no red badges, no shame language
- **Responsible AI** — every AI decision has an explainability card; Content Safety filtering on all agent I/O
- **Accessibility first** — reduce animations, calm mode, reading level slider, keyboard navigation
- **Pure CSS character** — all 7 Pebble models use divs with border-radius, no SVGs or images

---

## License

See [LICENSE](LICENSE) for details.
