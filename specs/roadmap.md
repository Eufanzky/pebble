# Roadmap

The order is foundation first: fix, set up tests, and restructure, then build new features on solid ground.
Each phase is **one PR, about one work session**, with a clear "done" check.
Read `mission.md` for the why, `tech-stack.md` for the how, and `testing.md` for how it's verified.

Rules for every phase:
- The app still builds and runs at the end of the phase.
- **The phase ships with tests for the behaviour it adds or changes** (see `testing.md`). A bug fix starts with a failing regression test.
- CI is green (from phase 1.6 onwards), including the coverage floors once they're enforced.
- `CLAUDE.md` and the README are updated if the phase changes structure, commands, or features.

---

Phases were renumbered twice: on 2026-10-03 the redesign became Phase 5 (old 5–9 became 6–10), and on 2026-10-04 "Tidy up and document" became Phase 6 (6–10 became 7–11). Spec folders use the numbers of their day.

## Phase 0: Baseline

- [x] **0.1 Audit.** Install dependencies and run `build`, `lint`, and `tsc` in the frontend, and import-check the backend. Record each error in `specs/audit.md`. (The manual page walkthrough was deferred: flow bugs are caught by 1.4 and fixed in 1.7.)
  *Done:* `audit.md` lists every known issue, tagged by severity.
- [x] **0.2 Green build.** Fix every type, lint, and build error from the audit.
  *Done:* `npm run build` and `npm run lint` pass cleanly.

## Phase 1: Test tooling, safety net, and CI

- [x] **1.1 Backend test tooling.** Add `pyproject.toml` with `uv`, ruff, pytest, pytest-asyncio, pytest-cov, and respx. Add a `conftest.py` with an app factory, and a health-endpoint test.
  *Done:* `uv run pytest` and `uv run ruff check` pass.
- [x] **1.2 Frontend test tooling.** Add Vitest, Testing Library, user-event, MSW, and vitest-axe, with a `src/test/` setup and render helpers. Add a first test for `stripEmoji`.
  *Done:* `npm test` passes.
- [x] **1.3 Backend characterization tests.** Pin today's behaviour with the LLM and Content Safety mocked:
  - intent routing, including distress and the chat fallback
  - the severity ≥ 2 rejection
  - PII redaction
  - the `{intent, response, mood, agentName, data}` response shape
  *Done:* tests pass on the current, untouched code.
- [x] **1.4 Frontend characterization tests.** Pin today's behaviour:
  - `TasksContext` mood derivation and the excited flash
  - `PreferencesContext` DOM effects
  - the chat error state (MSW 500)
  - toggling a task step
  *Done:* tests pass on the current, untouched code.
- [x] **1.5 Guilt scan.** Add a test that fails on banned patterns in UI copy, sample data, and prompts (see `testing.md`).
  *Done:* it runs in `npm test` and passes today.
- [x] **1.6 CI.** Add a GitHub Actions workflow that runs lint, typecheck, and all tests for both parts on every PR.
  *Done:* the workflow is green on a PR.
- [x] **1.7 Runtime bugs.** Fix the broken flows from the audit that won't be rewritten later, each with a regression test.
  *Done:* every remaining audit item is either fixed or linked to the phase that removes it.

## Phase 2: Backend clean architecture

The characterization tests from 1.3 must stay green through every item in this phase.

- [x] **2.1 Layer skeleton.** Create `domain/`, `application/`, `infrastructure/`, and `api/`, and move the config. Document the dependency rule in the backend README.
  *Done:* the app starts and the 1.3 tests pass.
- [x] **2.2 LLM port.** Add an `LLMProvider` interface, an OpenAI-compatible adapter (GitHub Models by default, Azure OpenAI by config), and a scripted `fake` provider selectable with `LLM_PROVIDER=fake`.
  *Done:* adapter contract tests (respx) cover success, malformed JSON, 429, and timeout.
- [x] **2.3 Safety port.** Add a `SafetyChecker` interface, an Azure Content Safety adapter, and a no-op adapter for when it's unconfigured. Move PII redaction behind a port.
  *Done:* contract tests cover the severity mapping; unit tests cover the reject path.
- [x] **2.4 Orchestrator and CalmSense as use cases.** Move them into `application/` so `handle_chat` runs the shared agent pipeline. The router becomes thin.
  *Done:* pipeline tests cover the safety order, PII redaction before the LLM, and the routing table; the 1.3 tests are ported and still pass.
- [x] **2.5 SimplifyCore and PebbleVoice as use cases.** Same pattern as 2.4.
  *Done:* use-case and API tests cover both.
- [x] **2.6 Local document parsing.** Add a `DocumentParser` port with a `pypdf` + `python-docx` adapter. Files are parsed in memory and not stored.
  *Done:* tests with small fixture files (PDF, DOCX, TXT, plus one corrupt file) pass with no Azure services.
- [x] **2.7 Remove dead services.** Delete Semantic Kernel, Cosmos, AI Search, Web PubSub, the focus router, Blob Storage, Document Intelligence, App Insights, and `deploy.ps1`, along with their dependencies.
  *Done:* the backend runs with only an LLM key set, the whole suite passes, and `requirements.txt` is gone.
- [x] **2.8 LLM eval suite.** Add a labelled set of about 30 messages (including distress) and `pytest -m eval` checks for JSON validity, intent accuracy, distress recall, and the voice rules. Schedule it weekly in CI.
  *Done:* a baseline score is recorded in `backend/tests/evals/README.md`.
- [x] **2.9 Backend coverage floor.** Enforce 90% on `domain/` + `application/` and 80% overall in CI.
  *Done:* CI fails below the floor.

## Phase 3: Frontend feature structure

The characterization tests from 1.4 must stay green through every item in this phase.

- [x] **3.1 Skeleton and chat.** Create `features/` and `shared/`, then move the chat feature and the API client there.
  *Done:* chat works, the 1.4 chat tests pass, and the import boundaries are documented.
- [x] **3.2 Tasks.** Split `today/page.tsx` into `features/tasks` (list, card, roadmap view, WhyCard, hooks).
  *Done:* the page file is under ~100 lines, each hook has unit tests, and `TaskCard` and `WhyCard` have component tests.
- [x] **3.3 Documents.** Split `DocumentModal` and `ImmersiveReader` into `features/documents`.
  *Done:* no file exceeds ~200 lines, and tests cover the reading-level slider, the comprehension check, and the built-in reader fallback.
- [x] **3.4 Settings, activity, and companion.** Split the settings page and move the activity log and the Pebble character into their features.
  *Done:* every page is thin, and the settings toggles (calm mode, reduce animations) have tests.
- [x] **3.5 Typed API contract.** Generate TS types from FastAPI's OpenAPI with `openapi-typescript`, replace the hand-written `ChatResponse`, type the MSW handlers from them, and add a CI check for drift.
  *Done:* changing a backend schema breaks the frontend typecheck.
- [x] **3.6 Accessibility tests.** Add axe checks for each feature's main components, plus keyboard tests for the skip link, focus on navigation, and modal focus trap.
  *Done:* there are no axe violations, and the keyboard tests pass.
- [x] **3.7 E2E demo flow.** Set up Playwright against the local stack with `LLM_PROVIDER=fake`, covering the demo flow from `testing.md` plus an axe scan per page. Add it to PR CI.
  *Done:* the spec passes locally and in CI.
- [x] **3.8 Frontend coverage floor.** Enforce 80% on `features/*/lib` + `hooks` in CI.
  *Done:* CI fails below the floor.

## Phase 4: Persistence and auth

- [x] **4.1 Postgres and tasks.** Add `docker compose` Postgres (plus a CI service container), SQLAlchemy models, Alembic, a `TaskRepository`, and the task endpoints.
  *Done:* repository integration tests pass against real Postgres, and the migration from empty is tested.
- [x] **4.2 Preferences and activity.** Add repositories and endpoints. The agent pipeline now writes activity entries server-side.
  *Done:* a parametrized test proves every agent writes an activity row with its reasoning and safety status.
- [x] **4.3 Auth.js.** Add GitHub and Google sign-in, have Next.js sign short-lived backend tokens, and add `get_current_user` in FastAPI. Remove Entra and `DEV_MODE`, and add a dev login for local use and E2E.
  *Done:* API tests cover missing, invalid, and expired tokens (401) and **user isolation** for every resource; E2E signs in with the dev login.
- [x] **4.4 Tasks from the API.** The tasks feature uses TanStack Query against the backend instead of localStorage.
  *Done:* component tests (MSW) cover loading, optimistic toggle, and rollback on error; E2E passes.
- [x] **4.5 Preferences and activity from the API.** Move both over, and import any existing localStorage data into the account once.
  *Done:* the one-time import is tested (runs once, idempotent); localStorage holds only UI conveniences.
- [x] **4.6 Data export and deletion.** Add an export-all-data (JSON) endpoint and a delete-account endpoint, with UI in settings.
  *Done:* tests, parametrized from the ORM metadata, prove that export covers every user table and deletion leaves zero rows.

## Phase 5: A calmer, clearer look

A redesign that feels smooth on every screen size, plus the features users asked for most. The photo backgrounds render poorly and go; everything visual is drawn in CSS, like Pebble. Every item keeps principle 1 (no streaks, no red, progress only adds up), reduced motion, calm mode, and the axe checks.

- [x] **5.1 Design system.** Tokens for colour, type scale, spacing, radius, elevation and motion (durations, easing, reduced-motion variants), and shared primitives in `shared/ui/` (Button, IconButton, Card, Field, Chip, Sheet/Dialog with the focus trap). New and redesigned screens use only these.
  *Done:* component and axe tests for each primitive; a token page lists them (dev only); no new inline colour values.
- [x] **5.2 Ambient backgrounds.** Replace the photo `ScreenBackground` with slow, blurred CSS gradient fields tinted by Pebble's colour, one mood per screen. They hold still under reduce-motion and calm mode, and the images leave `public/`.
  *Done:* tests cover the still state; no background image is requested on any page (E2E); text contrast passes axe on every page.
- [x] **5.3 Responsive shell and mobile navigation.** A bottom tab bar on phones and a collapsible sidebar on wider screens, safe-area insets, touch targets of at least 44 px, and smooth page transitions (none under reduce-motion).
  *Done:* E2E runs every page at 360, 768 and 1280 px wide with no horizontal scroll and an axe scan at each; keyboard and screen-reader navigation still pass.
- [x] **5.4 Today, redesigned.** A clearer Today on the design system: what's up next, the list grouped by open and done, steps inline, and calm motion when a task or step is finished.
  *Done:* the existing Today tests and E2E pass on the new layout; new component tests cover the grouping.
- [x] **5.5 Edit and organise tasks.** Edit a task's title, estimate, tag and priority; delete one task; reorder by drag or keyboard (a `position` on the server); filter by tag and search by title.
  *Done:* API tests for reorder (including user isolation), component tests for edit, delete, keyboard reorder, filter and search, and an E2E edit-and-reorder step.
- [x] **5.6 Stats.** A stats page with progress that only adds up: steps and tasks finished, focus minutes, and finished tasks per tag, by week and by month. Served by a backend stats endpoint computed from the user's tasks and activity. No streaks, no "missed" days, no comparisons.
  *Done:* domain tests prove counts never go down across gaps of days; API tests cover the ranges and isolation; the guilt scan covers the copy; axe passes.
- [x] **5.7 The other screens.** Documents, Activity, Focus, Settings and sign-in move to the design system and the new backgrounds.
  *Done:* each screen's tests and the E2E pass; axe passes at all three widths.
- [x] **5.8 Installable app.** A web app manifest, icons drawn from Pebble, a theme colour, and an offline page that says calmly that Pebble needs a connection.
  *Done:* Chromium's installability check (`Page.getInstallabilityErrors`; Lighthouse 12 dropped its PWA audits) passes in the E2E; a test covers the offline page.

## Phase 6: Tidy up and document

The repo still carries the hackathon's leftovers, and the docs grew item by item. Before building more, remove what isn't used, give the repo a structure that's easy to find your way in, and bring every document up to date. Nothing here changes what the app does.

- [x] **6.1 Remove what isn't used.** Delete the old `demo/` prototype, the hackathon slides and the outdated architecture PNG in `docs/` (all kept in the `v0.1.0-hackathon` tag), the placeholder stubs in `pebble/` (`api/`, `docs/`, `presentation/`, the create-next-app README), duplicate icons, and any unused code, styles, exports and dependencies found by a dead-code scan (`knip` for the frontend, `vulture` for the backend).
  *Done:* the dead-code scans report nothing (or only listed, justified exceptions); build, lint, tests and E2E pass.
- [x] **6.2 A clearer structure.** The dated spec folders move under `specs/changes/`, with an index; leftover old-layout code and styles (`globals.css` pieces that belong to a feature, the old `--accent-*` tokens) move into their features or onto the design tokens; the repo root holds only what a newcomer needs.
  *Done:* a test fails on colour tokens outside `tokens.css` across `src/`; links in the docs resolve (a link check); build, lint, tests and E2E pass.
- [x] **6.3 Docs up to date.** Rewrite the root README for the app as it is today (features, a Mermaid architecture diagram, setup in a few commands, structure, tests), update `backend/README.md`, restructure `CLAUDE.md` into short sections, and bring `tech-stack.md`, `testing.md` and `audit.md` in line with the code.
  *Done:* every command in the README and `CLAUDE.md` is run as part of the check; the link check passes; every claimed feature is covered by a test.
- [x] **6.4 Clear names.** Each folder and package says what it is, and the app has one name: `pebble/` becomes `frontend/`; the packages are `pebble-frontend` and `pebble-backend`; the prompts say Pebble, not "Focusbuddy"; the route group `app/(app)/` becomes `app/(signed-in)/`; the backend's domain tests join `tests/unit/`; Docker Compose's init script moves from `backend/db/init/` to `docker/postgres-init/`.
  *Done:* nothing outside the dated records says "Focusbuddy" or uses an old path (a test checks every repo path the docs name); CI, E2E and the evals pass.
- [x] **6.5 Names in the code.** Every file, module, class and test says what it holds, and an agent has one name. The prompts and the fake LLM use the agents' names (CalmSense, SimplifyCore, PebbleVoice), not their intents; adapters and tests sit where their layer is; each test file tests one thing; a module named after another feature (`activity/lib/stats.ts`) or a vague one (`chat/lib/chat.ts`) is renamed; the two small Pebble faces become one; the `pb-` and `glass-` CSS names say what they style; the E2E is split by area.
  *Done:* a reader can find any piece from its name; CI, E2E and the evals pass.
- [ ] **6.6 One word for steps.** The UI says "steps"; the API, the frontend types and the prompts say `subtasks`, and settings says "Task chunk size". Use "steps" (and "step size") everywhere, keeping old browser data and saved preferences readable.
  *Done:* no `subtask` or `chunk` in the code outside the readers of old data; CI, E2E and the evals pass.

## Phase 7: Make the named agents real

- [ ] **7.1 WhyBot.** Generate a plain-language explanation in the pipeline for every agent result, store it with the activity entry, and have `WhyCard` show it.
  *Done:* the pipeline test asserts that every agent result has an explanation; no hard-coded "why" text remains.
- [ ] **7.2 Undo and dismiss.** Every AI-created change (steps, tasks from documents) can be undone or dismissed.
  *Done:* API and component tests cover undo for each kind of AI change.
- [ ] **7.3 AdaptLens.** Collect simple usage signals (skipped steps, reading-level changes, chunk-size edits) and suggest preference changes that the user approves.
  *Done:* tests prove that a suggestion applies only when accepted, and that a dismissed one doesn't come back immediately.
- [ ] **7.4 BridgeBot: calendar export.** Export a task plan as an `.ics` file.
  *Done:* tests validate the `.ics` output against a parser; a manual import into Google Calendar and Outlook works.
- [ ] **7.5 BridgeBot: Google Calendar (optional).** Push steps to Google Calendar using the Google sign-in scope.
  *Done:* adapter contract tests (respx) pass, and steps appear in the user's calendar after consent.
- [ ] **7.6 Evals for new agents.** Extend the eval set for WhyBot (explanations follow the voice rules) and AdaptLens (sensible suggestions).
  *Done:* the scores are recorded.

## Phase 8: Structure without guilt

See principle 1 in `mission.md`.

- [ ] **8.1 Guilt audit.** Review UI copy, sample data, and prompts against principle 1, and extend the guilt scan (1.5) with any new patterns found.
  *Done:* the scan covers every rule in principle 1 and passes.
- [ ] **8.2 Cumulative progress.** Show the counts from the 5.6 stats ("14 steps finished this month") on Today and Activity too. Nothing resets.
  *Done:* a domain test proves counts never decrease across gaps of days.
- [ ] **8.3 Neutral deadlines.** Show time left as a calm bar. Near a deadline, Pebble offers to make the task smaller with CalmSense.
  *Done:* tests with a fixed clock cover the bar maths and when the offer appears; there is no red styling.
- [ ] **8.4 "Still open" flow.** Past-due tasks offer three choices: move it, make it smaller, or let it go. Letting go archives the task and logs it neutrally.
  *Done:* domain, API, and component tests cover all three paths.
- [ ] **8.5 Welcome back.** After time away, Today opens fresh with "Want to pick one small thing?" and never mentions how long the user was gone.
  *Done:* tests with a fixed clock cover the greeting, and the guilt scan covers the copy.
- [ ] **8.6 Opt-in reminders.** The user sets a gentle reminder (in-app, plus optional browser notifications). They are off by default.
  *Done:* tests prove nothing notifies unless the user turned it on.

## Phase 9: Solo focus

- [x] **9.1 Remove rooms.** Delete the multi-user rooms UI, fake participant counts, and related sample data.
  *Done:* no fake presence numbers remain, and the 1.4 tests and E2E pass.
- [ ] **9.2 Focus session.** A Pomodoro session tied to one task step, with Pebble working beside you. It respects reduce-animations and never penalizes stopping early.
  *Done:* timer hook tests use fake timers; component tests cover stopping early with no penalty; E2E starts focus from a step.

## Phase 10: Deploy

- [ ] **10.1 Backend Dockerfile.** Build the backend with `uv` and add a health check.
  *Done:* `docker compose up` runs the backend and Postgres locally, and CI runs E2E against the built image.
- [ ] **10.2 Neon and Render.** Deploy the database and backend, running migrations on deploy.
  *Done:* the public health endpoint responds.
- [ ] **10.3 Vercel.** Deploy the frontend with `BACKEND_URL` (the `/api` proxy's target), the shared `AUTH_TOKEN_SECRET`, and the Auth.js callback URLs.
  *Done:* sign-in and chat work on the live URL.
- [ ] **10.4 Rate limits.** Add a per-user limit on agent calls so one account can't use up the shared Groq free-tier rate limits. Over the limit, the API answers 429 with `Retry-After`. The backend already turns a provider 429 into a 503 "Pebble is resting"; the frontend shows that gentle "resting" message in both cases instead of its generic error.
  *Done:* an API test covers the limit, an MSW component test covers the message, and the message passes the guilt scan.

## Phase 11: Presentation

- [ ] **11.1 Architecture diagram.** Keep the Mermaid diagram from 6.3 in step with what deploy adds (hosts, the proxy, the database).
  *Done:* the diagram matches `tech-stack.md`.
- [ ] **11.2 README rewrite.** Cover honest features, screenshots/GIFs, the live link, local setup in five commands or fewer, and how to run the tests.
  *Done:* every claimed feature is covered by the E2E demo flow.
- [ ] **11.3 Production smoke test.** Run the E2E demo flow against production after each deploy.
  *Done:* the post-deploy job is green against the live URL.
