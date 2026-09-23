# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Pebble (also called "Focusbuddy" in backend code and the Cosmos DB names) is an AI assistant for neurodivergent users, with an animated CSS cat companion. It has three separate parts:

- `pebble/`: the real frontend. Next.js 16 App Router, React 19, TypeScript, Tailwind 4.
- `backend/`: FastAPI (Python 3.12+) on Azure / Microsoft Foundry (Azure OpenAI GPT-4o via Semantic Kernel, Cosmos DB, Content Safety, and more).
- `demo/`: an older standalone static HTML/CSS/JS prototype (vanilla JS plus GSAP). It is not wired to anything. Don't edit it when changing the app unless asked.

`specs/` is the project constitution: `mission.md` (product scope and principles), `tech-stack.md` (the target stack and code-structure rules), `testing.md` (test rules, layers, and CI gates; no roadmap item is done without tests), and `roadmap.md` (small, ordered phases, each one PR). The rest of this file describes the code as it is today; the specs describe where it is going. Read them before planning any feature or refactor, and tick off roadmap items as they land.

`docs/` holds the architecture diagram and slides. `pebble/api/`, `pebble/docs/` and `pebble/presentation/` are placeholder stubs, and `pebble/README.md` is create-next-app boilerplate. The real docs are the root `README.md` and `backend/README.md`, which has the full endpoint table. `.claude/`, `.cursor/` and similar files are gitignored; `CLAUDE.md` is committed.

The tag `v0.1.0-hackathon` (with a GitHub Release) marks the original hackathon submission. Everything after it is the rework described in `specs/`.

## Workflow: work by feature

- **One roadmap item = one branch = one PR.** Never commit straight to `main`. Name branches `<type>/<roadmap-id>-<slug>`, e.g. `feat/4.4-tasks-from-api`, `refactor/2.4-orchestrator-use-case`, `test/1.3-backend-characterization`, `docs/...`, `fix/...`.
- **Stay inside the item.** Don't mix unrelated changes into a PR. If you find something else, note it in `specs/audit.md` or as a new roadmap item.
- **Before opening the PR:**
  - the item's tests are written (see `specs/testing.md`) and lint, typecheck and tests pass locally
  - the roadmap checkbox is ticked in the same PR
  - this file and the README are updated if structure, commands or features changed
- **Commits** use Conventional Commit prefixes (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). PRs are squash-merged; GitHub deletes the branch on merge.
- **Code is organised by feature too.** New frontend code goes in `src/features/<feature>/` with a public `index.ts`, and shared pieces go in `src/shared/`. New backend code follows the clean-architecture layers. Both are described in `specs/tech-stack.md`. Code still in the old layout moves over during roadmap phases 2 and 3; don't add new code to the old layout.

## Commands

Frontend (run from `pebble/`):
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build; also the TypeScript type check
npm run lint     # ESLint (next core-web-vitals + typescript configs)
```

Backend (run from `backend/`, managed by `uv`; dependencies and tool config live in `pyproject.toml`, versions in `uv.lock`):
```bash
uv sync                           # create .venv with app + dev dependencies
cp .env.example .env              # fill in Azure credentials
uv run uvicorn app.main:app --port 8000 --reload   # Swagger at http://localhost:8000/docs
uv run pytest                     # tests (evals excluded; `-m eval` runs them)
uv run ruff check                 # lint
```

`requirements.txt` is legacy (removed in roadmap 2.7); add dependencies to `pyproject.toml` and run `uv lock`. Backend tests use the `app` and `client` fixtures in `backend/tests/conftest.py`; the client runs the app in-process through `httpx.ASGITransport`, so the lifespan (Cosmos, telemetry) never runs. The frontend has no test suite yet (roadmap 1.2); verify frontend changes with `npm run build` and `npm run lint`. `specs/testing.md` has the planned commands. `backend/deploy.ps1` is a PowerShell script that provisions the Azure resources with the `az` CLI.

## Architecture

### Frontend works standalone; the backend is optional
Almost all frontend state lives in the browser, not in the backend. The React contexts in `pebble/src/contexts/` keep their data in `localStorage` through `useLocalStorage`, under keys such as `pebble-tasks` and `pebble-preferences`, and seed it from `src/data/*` sample data. The backend's task, preferences, and activity CRUD endpoints exist but the UI doesn't call them. The frontend makes only two backend calls:
- `POST /api/agents/chat` in `src/lib/api.ts`, used by `components/chat/PebbleChat.tsx`
- `GET /api/documents/immersive-reader/token` in `components/documents/ImmersiveReader.tsx`

`next.config.ts` rewrites `/api/:path*` to `http://localhost:8000/api/:path*`, so frontend code calls relative `/api/...` paths. Keep it that way: backend CORS only allows `settings.frontend_url`. Imports use the `@/*` alias for `src/*`.

The frontend sends no `Authorization` header, but both endpoints it calls require `get_current_user_id`. So for local chat to work, the backend must run with `DEV_MODE=true` (`.env.example` defaults to `false`). `backend/README.md` says the frontend handles the Entra OAuth flow, but that isn't implemented. If the backend is down, chat surfaces an error and `ImmersiveReader` falls back to a built-in reader.

### Provider tree and cross-context coupling
`components/layout/AppShell.tsx` (a client component rendered from `app/layout.tsx`) nests the providers: Preferences, then Pebble, then Tasks, then ActivityLog, then Toast. It also mounts the sidebar, the page transition, and the global `PebbleChat`. Some contexts depend on each other. For example, `TasksContext` calls `usePebble()` to derive Pebble's mood from task completion percentage and to flash an "excited" mood when a task is completed. `PreferencesContext` applies preferences to the DOM: it toggles the `reduce-animations` class on `<html>`, sets the `--pebble-color`/`--pebble-dark` CSS variables, and exposes `stripEmoji` for calm mode.

### Pebble character
The 7 models in `components/pebble/models/` are built only from CSS and divs (`border-radius` shapes), with no SVG or images. They share pieces through `models/SharedParts.tsx`. Model styles live in `PebbleModels.css` and mood animations in `PebbleMoods.css`. Keep new character work in that style.

### Backend request flow
`app/main.py` registers routers under `/api/<name>`. Routes get the user through `Depends(get_current_user_id)` (`services/auth.py`), which validates Entra ID JWTs. With `DEV_MODE=true` it skips validation and returns `dev-user-00000000`. `/api/verify/services`, which smoke-tests every Azure service, only works in dev mode.

Missing Azure configuration is handled gracefully at startup, not at request time:
- `services/db.py` skips Cosmos init when there are no credentials, and `get_container()` then raises `RuntimeError`.
- Content Safety and the other services check `_is_configured()` and skip their work when unconfigured.

All Cosmos containers are partitioned by `/userId`.

### Agent pipeline (`backend/app/agents/`)
`orchestrator.handle_chat` is the chat entry point:
1. Input safety: Prompt Shields (`ensure_no_prompt_attack`), then Content Safety (`ensure_safe`, which rejects content at severity ≥ 2), then PII redaction (`services/pii_detector.py`).
2. Intent classification: `ORCHESTRATOR_PROMPT` runs through the Semantic Kernel singleton (`services/kernel.py`). If that fails, it falls back to a direct `openai_client.chat_completion`. The model must return JSON, which is parsed with `json.loads`.
3. Routing on the classifier's `intent` field. `distress` gets an immediate empathetic reply without calling a sub-agent. `decompose` goes to `task_decomposition` (CalmSense), `simplify` to `document_simplification` (SimplifyCore), and `motivate` to `motivation` (PebbleVoice). Anything else is treated as `chat` and returns the classifier's own `response`/`mood`. Adding an intent means updating `ORCHESTRATOR_PROMPT` and the routing in `handle_chat`.
4. The output also goes through Content Safety and PII redaction.

The response shape is `{intent, response, mood, agentName, data}`. It must stay in sync with `ChatResponse` in `pebble/src/lib/api.ts`. `agents/plugins.py` wraps the sub-agents as Semantic Kernel `kernel_function` plugins. The sub-agents can also be called directly through `/api/agents/decompose`, `/simplify` and `/motivate`, which the frontend doesn't use.

## Product constraints (apply to UI copy and prompts)
- Pebble voice rules (`PEBBLE_VOICE_RULES` in `agents/prompts.py`), which also apply to frontend copy:
  - Never shame, rush, or pressure the user, and never compare them to others.
  - Be specific, not generic ("you finished 3 things" rather than "great job!").
  - Use short, plain sentences.
- Structure without guilt (principle 1 in `specs/mission.md`):
  - Allowed: neutral visible time, progress that only adds up, user-set reminders, and offers to make a task smaller.
  - Banned: streaks, counts of missed days or time away, red or alarm styling, and loss framing.
  - Late tasks are "still open", never "overdue".
- The app is dark mode only (background `#0F0D0A`) and has no light theme.
- Accessibility:
  - Respect `reduceAnimations` and `calmMode` (use `stripEmoji` for user-facing text).
  - Keep keyboard navigation and ARIA working (`useFocusOnNavigation`, skip link).
- Every AI action should be explainable. The activity log records the agent name, reasoning, and safety status. Tasks have "Why?" cards (`WhyCard`).
- The named agents shown in the UI are CalmSense, SimplifyCore, PebbleVoice, AdaptLens, WhyBot, and BridgeBot. Only the first three plus the orchestrator have agent code. The other three appear only as names in schemas, `routers/audit.py`, and the frontend.
