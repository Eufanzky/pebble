# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pebble is an AI assistant for neurodivergent users, with an animated CSS cat companion. (It was called "Focusbuddy" during the hackathon; 6.4 removed that name.) Two parts:

- `frontend/`: the frontend. Next.js 16 App Router, React 19, TypeScript, Tailwind 4, TanStack Query, Auth.js v5.
- `backend/`: FastAPI (Python 3.12+, `uv`) in a clean architecture, with Postgres. It needs only an LLM: Groq's free tier by default (`LLM_PROVIDER=groq`, `openai/gpt-oss-120b`), any OpenAI-compatible API, or an offline fake. Azure Content Safety and Immersive Reader are optional.

Docs: the root `README.md` (features, diagram, setup) and `backend/README.md` (every endpoint, the agents, safety, the database). The tag and release `v0.1.0-hackathon` hold the original hackathon submission, with its prototype and slides.

## Specs and workflow

`specs/` is the project constitution; read it before planning a feature or refactor:

- `mission.md`: product scope and principles.
- `tech-stack.md`: the stack and the code-structure rules.
- `testing.md`: test rules, layers and CI gates. No roadmap item is done without tests.
- `roadmap.md`: small, ordered phases, each item one PR. Tick items off as they land.
- `audit.md`: known problems and where they're fixed. Note anything you find outside the current item here.
- `changes/<date>-<slug>/`: one folder per change (`requirements.md`, `plan.md`, `validation.md`), with a row in `changes/README.md`.

Working rules:

- **One roadmap item = one branch = one PR.** Never commit to `main`. Branches are `<type>/<roadmap-id>-<slug>`, e.g. `feat/4.4-tasks-from-api`, `docs/6.3-docs-up-to-date`.
- **Stay inside the item.** Anything else goes in `specs/audit.md` or the roadmap.
- **Before the PR:** the item's tests are written; lint, typecheck and tests pass locally; the roadmap box is ticked; this file and the READMEs are updated if structure, commands or features changed.
- **Commits** use Conventional Commit prefixes (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). PRs are squash-merged once CI is green; GitHub deletes the branch.

## Commands

Frontend (from `frontend/`):

```bash
npm install
cp .env.example .env.local   # AUTH_SECRET, AUTH_TOKEN_SECRET (same as the backend's), AUTH_DEV_LOGIN=true locally
npm run dev            # http://localhost:3000, sign in at /signin
npm run build          # production build; also the type check
npm run lint           # ESLint (next core-web-vitals, typescript, feature import boundaries)
npm run lint:dead      # knip: unused files, exports and dependencies (exceptions in knip.json)
npm test               # Vitest; `npm test -- <path>` for one file or folder
npm run test:coverage  # with the 80% floor on src/features/*/lib and hooks (what CI runs)
npm run test:e2e       # Playwright; starts the backend (fake LLM, Postgres) and a production build itself
npm run api:generate   # after a backend schema change: regenerate src/shared/api/ (needs uv)
```

Backend (from `backend/`; dependencies and tool config in `pyproject.toml`, versions in `uv.lock`; add with `uv add` or edit and `uv lock`):

```bash
uv sync
cp .env.example .env               # LLM_API_KEY (free Groq key) or LLM_PROVIDER=fake; AUTH_TOKEN_SECRET; DATABASE_URL
docker compose up -d db            # from the repo root: Postgres 17 with pebble, pebble_test and pebble_e2e
uv run alembic upgrade head        # `uv run alembic revision --autogenerate -m "..."` after a model change
uv run uvicorn app.main:app --port 8000 --reload   # Swagger at http://localhost:8000/docs
uv run pytest                      # evals excluded; `-m eval` runs them against a real LLM
uv run ruff check
uv run vulture                     # dead code ([tool.vulture] skips what FastAPI, Pydantic and enums use)
TEST_DATABASE_URL=postgresql+asyncpg://pebble:pebble@localhost:5432/pebble_test uv run pytest   # plus tests/integration
```

## CI

`.github/workflows/ci.yml` runs on every PR and push to `main`. Merge only when it's green.

- **Frontend:** `npm ci`, lint, knip, `tsc --noEmit`, `npm run test:coverage`, build.
- **Backend:** a Postgres 17 service, `uv sync --locked`, ruff, vulture, `pytest --cov` with `tests/integration` (80% overall, 90% on `app/domain` + `app/application`).
- **API contract:** `npm run api:generate`, then `git diff --exit-code` on `frontend/src/shared/api`.
- **E2E:** `npm run test:e2e` against a Postgres service.

`.github/workflows/evals.yml` runs the real-LLM evals (`backend/tests/evals/`) weekly and on demand, with the `LLM_API_KEY` secret (and optional `LLM_PROVIDER`, `LLM_BASE_URL`, `LLM_MODEL` variables); without the secret they skip. Run them after any prompt change and record baselines in `backend/tests/evals/README.md`.

## Testing

### Backend

- Warnings fail the run (`filterwarnings = error`).
- The `client` fixture (`tests/conftest.py`) runs the app in-process through `httpx.ASGITransport`, so the lifespan never runs.
- Every test gets a container of fakes (autouse `container`):
  - `llm`: the scripted `FakeLLM` (`app/infrastructure/llm/fake.py`). Script it per agent with `llm.script("orchestrator", {...})` or an agent's name (`"CalmSense"`, `"SimplifyCore"`, `"PebbleVoice"`); `llm.calls` are `LLMRequest`s.
  - `safety`: `ScriptedSafety` (`tests/fakes.py`), with `flag(text, category, severity)`, `attack_on(text)`, `analyzed` and `shielded`.
  - In-memory stores from `tests/fakes.py`: `task_repository`, `preferences_repository`, `activity_repository` (`entries[user_id]` shows what the agents logged).
- Auth: the autouse `auth_secret` fixture sets `AUTH_TOKEN_SECRET`, so a request without a token is a 401. Sign in with `app.dependency_overrides[get_current_user] = lambda: "user-1"`; `tests/api/test_auth.py` signs real tokens.
- Adapters are tested with respx in `tests/contract/`.
- `tests/integration/` uses real Postgres at `TEST_DATABASE_URL`. It drops and re-migrates the `public` schema and truncates every table before each test. It covers the migrations (upgrade, downgrade, `alembic check`), every store's contract (parametrized over the Postgres repository and its fake, so the fakes can't drift), and export and deletion for every table. Without the variable these tests skip; with `REQUIRE_TEST_DATABASE=true` (CI) they fail.
- `tests/unit/test_architecture.py` enforces the layer rule.

### Frontend

- Colocated `*.test.ts(x)` files, run by Vitest (`vitest.config.mts`, jsdom). Server code (`features/auth/lib`) opts into `// @vitest-environment node`.
- `src/test/setup.ts`:
  - Loads the jest-dom and vitest-axe matchers.
  - Starts an MSW server that fails any request without a handler; add handlers with `server.use(...)` (`src/test/msw/server.ts`).
  - Makes TanStack Query notify synchronously, so an optimistic change is visible right after its `act`.
  - Waits for in-flight requests before resetting the fakes, so a late save can't leak into the next test.
- Render with `renderWithProviders` (returns a `user` from user-event), `renderHookWithProviders` or `renderLoadedHook` (`src/test/render.tsx`). They wrap the same providers as `AppShell`, each with its own query cache and no retries.
- MSW fakes with the backend's rules (`src/test/msw/`):
  - `tasks.ts`: `taskStore` (`all()`, `set()`, `replace()`) and `taskHandlers` (`status(n)`, `saveStatus(n)`). Put tasks on it with `seed()` from `features/tasks/testing.ts`. Views load asynchronously, so use `findBy*`.
  - `account.ts`: preferences, activity and import (`accountStore`, `accountHandlers.status(n)`). Use `setTestPreferences()` and `devicePreferences()` (`src/test/preferences.ts`) and `expectLogged()` (`src/test/activity.ts`).
  - `stats.ts`: `statsStore.set()`, `focusSessions()`.
  - `handlers.ts`: `chatHandlers` (`reply`, `status`, `networkError`), `documentHandlers` (`parsed`, `status`; they check the `Content-Type`, because reading a multipart body hangs under jsdom), and `readerHandlers` (`unavailable` by default, `token()`).
- Tests may import a feature's `testing` module (ESLint allows it only in `*.test.*`). Components that use `next-auth/react` mock it with `vi.mock`.
- `useLocalStorage` caches at module level, so set the state each test depends on.
- Repo-wide checks that run in `npm test`:
  - `src/test/guilt-scan.test.ts`: principle-1 patterns (streaks, "overdue", missed days or time away, loss framing, red or alarm styling) in `frontend/src` and `backend/app`. Justified matches go in `EXCEPTIONS`, with a reason.
  - `src/test/tokens.test.ts`: colour tokens are defined only in `shared/ui/tokens.css`, and every `var(--…)` used is defined.
  - `src/test/docs-links.test.ts`: relative links in the Markdown docs resolve, and every repo path the current docs name in backticks (`frontend/…`, `backend/…`, `specs/…`, `docker/…`) exists, and that GitHub links name this repository (`Eufanzky/pebble`). The roadmap and the audit are exempt from the path check, since they record old paths.
  - `src/test/names.test.ts`: one name for each thing. The code calls the app Pebble (its hackathon name, Focusbuddy, appears only in docs that record history), a part of a task a step and its size the step size (`subtask` and `chunk size` appear only where old data is read: the browser import and migration 0005).
  - `shared/ui/primitives.test.tsx`: no colour literals in redesigned screens.
- Accessibility: `src/test/a11y.test.tsx` runs axe on every main view and open state; `AppShell.test.tsx` covers the skip link, `aria-current` and focus on navigation; `DocumentKeyboard.test.tsx` covers the focus traps. Add new views and modals to them.

### End to end

- `frontend/e2e/` (Playwright, Chromium) has one spec per area, with shared sign-in in `helpers.ts` (`signInEachTest()`):
  - `demo-flow.spec.ts`, the demo flow: dev login, chat to CalmSense through the real backend with `LLM_PROVIDER=fake`, break a task down and finish a step, reload, simplify a document, the activity log;
  - `layout.spec.ts`: axe and no horizontal overflow on every page at 360, 768 and 1280px, no pictures loaded, and the phone tab bar;
  - `tasks.spec.ts` (editing, reordering, filtering), `stats.spec.ts` (the stats adding up), `account.spec.ts` (the one-time import, the download, deleting the account), `installable.spec.ts` (installability over the DevTools protocol, the offline page) and `sign-in.spec.ts` (the redirect, 401 when signed out, signing out).
- Its `webServer` migrates and starts uvicorn against `E2E_DATABASE_URL` (default `pebble_e2e`) and runs `next build && next start`, with test-only secrets and the dev login.
- Each test signs in as a new dev user and turns animations off.
- Locally it reuses servers already on ports 3000 and 8000, so stop old ones first. First run: `npx playwright install chromium`.

## Frontend

### Structure

- `src/app/`: routes only. Each `page.tsx` renders an `AmbientBackground` (one `mood` per screen) and one feature view. App pages are in the `app/(signed-in)/` group, whose layout renders `AppShell`; `/signin` has no shell. `app/api/` holds the proxy and Auth.js; `app/icons/` and `app/manifest.ts` make the app installable.
- `src/features/<name>/`: `components/`, `hooks/`, `lib/` (pure logic), `api/`, `data/`, `context/`, `types.ts`, and a public `index.ts`.
- `src/shared/`: what features share; it never imports a feature. That's `lib/` (`api.ts` with `getJson`, `postJson`, `postForm` and `ApiError`; `query.tsx`; `audio.ts`), `hooks/` (`useLocalStorage`, `useTimeOfDay`, `useFocusOnNavigation`, `useFocusTrap`, `useFadeIn`), `ui/` (the design system), `preferences/` and `api/` (generated types).
- ESLint (`no-restricted-imports`) enforces the boundaries: outside a feature, import it only through `@/features/<name>` (or `@/features/<name>/server` from server code); a feature never reaches into another with `../../`.
- Imports use `@/*` for `src/*`.

### Features

- `tasks`: `TasksProvider`/`useTasks` and `TodayView`. Today has Pebble beside the greeting, an "Up next" card ("Mark as done"), and `TaskList` with "To do" and "Done today" regions. Each task is an `article` with a 44px check, a tag `Chip`, a "Why?" card, "Break it down" (CalmSense), a move handle and an edit button. `EditTaskDialog` edits and deletes. `TaskFilters` searches and filters by tag (a filtered list can't be reordered). `useReorder` reorders by keyboard (arrows, Home, End, announced) or drag; a drag follows the pointer on the window, because moving the card in the DOM drops pointer capture. There is also `RoadmapView`. Logic is in `lib/` (greeting, nudge, distress phrases, tags, `organise.ts`).
- `documents`: `DocumentsView`, the document modal, `BuiltInReader` and `ImmersiveReader`. The text logic (reading level, syllables, parts of speech, uploads) is in `lib/`. PDF and Word go to `POST /api/documents/parse`; text files are read in the browser.
- `chat`: `PebbleChat` and `useChat` (`POST /api/agents/chat`). It refreshes the activity log after each turn.
- `companion`: `PebbleProvider`/`usePebble` (mood, rotating messages), `PebbleCharacter`, `PebbleSpeechBubble`, and the 7 models.
- `activity`: `ActivityLogProvider`/`useActivityLog` and `ActivityView`.
- `settings`: `SettingsView`: Pebble's look and personality, reading level, step size, reduce animations, calm mode, a reset to defaults, and "Your data".
- `focus`: `FocusView` and the 25-minute timer (`useFocusTimer`). A finished session calls `postFocusSession`. There are no rooms or other people (9.1).
- `stats`: `StatsView` at `/stats`. The range is a sentence, with a one-hue column chart per day (arrow keys read a day, plus a table view) and tasks per tag as one-hue bars named on each row (the tag colours fail the dataviz checks, so colour never tells them apart). `lib/summary.ts` has the copy and the axis maths.
- `auth`: `SignInView`, `AccountSection` (download my data, delete my account; `useAccountData`), and, server-only in `server.ts`, the Auth.js config, `forwardToBackend` and `signBackendToken`.

### Sign-in and the API proxy

- `src/proxy.ts` (Next 16's middleware) sends anyone not signed in to `/signin?callbackUrl=...`. Paths with a dot (icons, the manifest) are let through.
- Auth.js (`next-auth@5.0.0-beta.32`, pinned; `features/auth/config.ts`) offers GitHub and Google when their `AUTH_*_ID`/`_SECRET` are set, and a dev login (any name, user `dev:<name>`) only with `AUTH_DEV_LOGIN=true`, never in production. The session is a JWT cookie; `session.user.id` is `provider:accountId`.
- `app/api/[...path]/route.ts` answers every `/api/*` call except Auth.js's own. Without a session it returns 401; otherwise `forwardToBackend` sends the call to `BACKEND_URL` with a fresh HS256 token (`sub` = the user id, `iss` `pebble-web`, `aud` `pebble-api`, 5 minutes, `AUTH_TOKEN_SECRET`). Cookies never reach the backend, and an unreachable backend is a gentle 503.
- Frontend code calls relative `/api/...` paths and never sees a token; keep it that way.

### State

- **Providers** (`app/(signed-in)/_shell/AppShell.tsx`): Query, then Preferences, Pebble, Tasks, ActivityLog and Toast. The shell also mounts the `Sidebar`, the page transition and `PebbleChat`.
- **Tasks** (`TasksContext`): `useQuery(['tasks'])`. Every change is optimistic and saved in the background, one save after another in order. New tasks and steps carry a `temp-` id until the server answers. A failed save sets `saveFailed` and reloads; a failed load sets `loadFailed` with `retry()` (`TasksStatus.tsx`). A new account gets an "Add example tasks" button. Which tasks show their steps is UI state, not saved. `reorderTasks` sends every id (`PUT /api/tasks/order`). `TasksContext` calls `usePebble()` to set Pebble's mood from progress.
- **Preferences** (`shared/preferences/`): a device copy (`pebble-preferences-cache`) so colour and motion apply on the first paint. The account's copy is applied when it arrives, except settings changed on this device since mount. Each change is saved as a PATCH of the changed fields only; a failed save puts them back. `<PreferencesProvider offline>` (sign-in) never calls the API. The provider sets the `reduce-animations` class and `--pebble-color`/`--pebble-dark`, and exposes `stripEmoji` (calm mode) and `reduceMotion` (the setting or the OS). Components use `reduceMotion`; only the settings toggle reads `preferences.reduceAnimations`.
- **Activity log**: `/api/activity`, newest first, optimistic `addEntry`. The backend logs agent results itself.
- **Before the first load**, a task or log change is saved and then reloaded, so the first load can't overwrite it.
- **Import:** `useImportLocalData` moves what a browser kept before accounts (`pebble-tasks`, `pebble-preferences`, `pebble-activity`) into the account once (`POST /api/import`), then deletes those keys. `pebble-import-started` stops a second tab from sending it twice.
- **Fallbacks:** if the backend is down, chat shows a gentle error, and `ImmersiveReader` falls back to `BuiltInReader`.

### Layout, design system and the app

- **Shell** (`_shell/shell.css`): one `Sidebar` nav laid out three ways. From 1100px it's a sidebar that can collapse to a rail (`pebble-nav-collapsed`). From 768 to 1099px it's the rail. On phones it's a bottom tab bar with safe-area insets. Labels stay in the accessibility tree. `--app-bottom-inset` keeps fixed things (the chat button) clear of the tab bar.
- **Screens** lay themselves out with `Screen` and `ScreenHeader` (a sentence-case title, one lead line, and a small Pebble whose bubble hides on phones).
- **Tokens** (`shared/ui/tokens.css`): every colour, type size, space, radius, elevation and motion token (`--color-*`, `--text-*`, `--space-1..8`, `--radius-*`, `--ease-settle`, `--duration-*`, `--tap`). Durations drop to 0 under reduced motion. `app/globals.css` keeps only app-wide rules and the Pebble colour defaults.
- **Primitives** (`@/shared/ui`, styled in `primitives.css`): `Button` (`primary` for the one main action, `quiet`, `ghost`; `busy`), `IconButton` (required `label`), `Card` (`as`, `tone`, `padding`; markup that can't use the component takes its `ui-card` class), `Field` (`hint`, `note`, `multiline`, wired with `aria-describedby`), `Chip` and `Dialog` (focus trap, Escape, outside click, `variant="sheet"` on phones). Render a `Dialog` only while it's open; it portals to `<body>`. A modal opened over another passes `active: false` to the one below.
- **Style rules:** no colour literals outside `tokens.css`, no monospace or all-caps labels (numbers use `tabular-nums`), surfaces separated by tone and a hairline rather than shadows. `/design-system` shows everything in development and is a 404 in production.
- **Backgrounds** are drawn in CSS, never photos: `AmbientBackground` (`shared/ui/ambient.css`) has one `mood` per screen. It's still under reduce motion or calm mode, and must render inside a `PreferencesProvider`.
- **Installable:** `app/manifest.ts`. The icons are drawn by `app/icons/[name]/route.tsx` (`next/og`); the browser tab icon is `app/icon.svg`. `public/sw.js` only shows `public/offline.html` when a page can't load and caches nothing else. `useServiceWorker` registers it in production builds.
- **Pebble's 7 models** (`features/companion/models/`) are only CSS and divs (`border-radius` shapes), with no SVG or images. They share `SharedParts.tsx`; styles are in `PebbleModels.css`, with `pebble-` class names. `PebbleFace` is the small face alone, for notes and explanations. Keep new character work in that style.

## Backend

### Layers

- `app/domain` (pure Python), `app/application` (use cases, ports, prompts), `app/infrastructure` (adapters, `config.py`, `db/`), `app/api` (routers, schemas, `auth.py`, `dependencies.py`, `errors.py`, `presenters.py`).
- `tests/unit/test_architecture.py` enforces the dependency rule: the domain is pure, application imports only the domain, and infrastructure never imports api.
- `api/dependencies.py` wires adapters into use cases (`get_container()`; tests use `set_container()`). A missing optional service disables its feature cleanly:
  - No LLM key: `UnconfiguredLLM`, and the agents answer 503.
  - No Content Safety: `NoOpSafetyChecker`; PII redaction still runs.
  - No Immersive Reader: a 503 on the token endpoint.
  - No `DATABASE_URL`: the `Unconfigured*` stores, and the store endpoints answer 503, as they do during a database outage (`PersistenceError`).
- Routers live under `/api/<name>` (`app/main.py`). Every route except `/api/health` takes the user through `Depends(get_current_user)`. It verifies the Next.js token (issuer, audience, `exp`, `iat`, `sub`). Problems are a 401, or a 503 with no secret set. There is no dev bypass.

### Agents (`application/agents/`)

`HandleChat` (`orchestrator.py`) is the chat use case:

1. `SafetyGate.screen_input` (`application/safety.py`) runs Prompt Shields, then Content Safety (severity ≥ 2 is a 422), then PII redaction. Everything after sees only the redacted text.
2. Classification: one LLM call with `ORCHESTRATOR_PROMPT`, parsed with `parse_json_object`. Bad JSON falls back to chat; unknown intents become `chat` and unknown moods `normal`. The reply goes through `screen_output`, and `SAFE_REPLY` replaces it if it's unsafe.
3. Routing: `distress` answers at once; `decompose` goes to CalmSense (`DecomposeTask`), `simplify` to SimplifyCore (`SimplifyDocument`, also checked for groundedness), and `motivate` to PebbleVoice (`Encourage`; task titles are redacted first). A flagged or unusable sub-agent reply becomes a gentle reply with `data: null`. A new intent means updating `ORCHESTRATOR_PROMPT`, `Intent` (`domain/agents.py`) and the route table.
4. Errors (`api/errors.py`): LLM or safety outages are a 503 with a gentle message; a provider 429 is a 503 "Pebble is resting" with `Retry-After`.

Each agent has `run()` for screened input and `__call__` for the direct endpoints (`/api/agents/decompose`, `/simplify`, `/motivate`; the frontend doesn't use them), which screens first. Chat responses are `{intent, response, mood, agentName, data}`.

### Data

- **Tasks** (`application/tasks.py` over `TaskRepository`; `SqlTaskRepository`): one transaction per call, every query scoped to the user, so another user's task is a 404. `Task.with_step_completed` finishes a task when its last open step is ticked and never reopens it. New tasks go last; `PUT /api/tasks/order` takes every id exactly once, or it's a 409 and nothing moves.
- **Progress** (`domain/progress.py`, `application/progress.py`): `ProgressLog` notes an event the first time a task or step is finished, and `POST /api/stats/focus` notes a focus session. Events are only ever added (unique per user, kind and item), so counts only grow. `GET /api/stats?days=&tz=` sums them per local day and per tag.
- **Preferences:** one JSONB row per user holding what was saved; `Preferences.from_saved` fills the gaps with defaults and drops damaged values.
- **Activity:** each agent use case takes an optional `ActivityLog`, and writes one entry per result (`note()`). `watch()` logs held-back input or flagged replies as `flagged`, without their text. Entries hold only redacted text. A failed write never breaks chat. `tests/api/test_activity_pipeline.py` covers every agent.
- **Export and deletion** (`application/account.py`, `SqlAccountDataStore`) walk the table metadata. Every table needs a `user_id` column or a foreign key to a table that has one; `tests/integration/test_account_data.py` checks each table.
- **Documents:** `POST /api/documents/parse` reads PDF, .docx and text in memory (`LocalDocumentParser`: pypdf + python-docx) and never stores them.
- Tables are in `infrastructure/db/models.py`; migrations in `backend/migrations/`.

### API types

Frontend API types are generated, never hand-written. `backend/scripts/export_openapi.py` writes `frontend/src/shared/api/openapi.json`, `openapi-typescript` makes `schema.d.ts`, and code uses `ApiSchema<'ChatResponse'>` from `@/shared/api`. Request bodies use camelCase aliases. After a schema change, run `npm run api:generate` and commit both files.

## Product constraints (UI copy and prompts)

- **Pebble's voice** (`PEBBLE_VOICE_RULES` in `application/prompts.py`; frontend copy too): never shame, rush, pressure or compare; be specific ("you finished 3 things", not "great job!"); use short, plain sentences.
- **Structure without guilt** (principle 1 in `specs/mission.md`):
  - Allowed: neutral visible time, progress that only adds up, user-set reminders, offers to make a task smaller.
  - Banned: streaks, counts of missed days or time away, red or alarm styling, loss framing. Late tasks are "still open", never "overdue".
- **Dark mode only** (background `#0F0D0A`).
- **Accessibility:** respect `reduceMotion` and `calmMode` (`stripEmoji` for user-facing text); keep keyboard navigation and ARIA working (`useFocusOnNavigation`, `useFocusTrap`, the skip link).
- **Explainable AI:** the activity log records the agent, its reasoning and the safety status, and tasks have "Why?" cards (`WhyCard`).
- **Agents:** the UI names CalmSense, SimplifyCore, PebbleVoice, AdaptLens, WhyBot and BridgeBot. Only the first three, plus the orchestrator, have code; phase 7 makes the others real.
