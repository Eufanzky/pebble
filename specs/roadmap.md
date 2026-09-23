# Roadmap

The order is foundation first: fix, set up tests, and restructure, then build new features on solid ground.
Each phase is **one PR, about one work session**, with a clear "done" check.
Read `mission.md` for the why, `tech.stack.md` for the how, and `testing.md` for how it's verified.

Rules for every phase:
- The app still builds and runs at the end of the phase.
- **The phase ships with tests for the behaviour it adds or changes** (see `testing.md`). A bug fix starts with a failing regression test.
- CI is green (from phase 1.6 onwards), including the coverage floors once they're enforced.
- `CLAUDE.md` and the README are updated if the phase changes structure, commands, or features.

---

## Phase 0: Baseline

- [x] **0.1 Audit.** Install dependencies and run `build`, `lint`, and `tsc` in the frontend, and import-check the backend. Walk through every page by hand. Record each error and broken flow in `specs/audit.md`.
  *Done:* `audit.md` lists every known issue, tagged by severity.
- [ ] **0.2 Green build.** Fix every type, lint, and build error from the audit.
  *Done:* `npm run build` and `npm run lint` pass cleanly.

## Phase 1: Test tooling, safety net, and CI

- [ ] **1.1 Backend test tooling.** Add `pyproject.toml` with `uv`, ruff, pytest, pytest-asyncio, pytest-cov, and respx. Add a `conftest.py` with an app factory, and a health-endpoint test.
  *Done:* `uv run pytest` and `uv run ruff check` pass.
- [ ] **1.2 Frontend test tooling.** Add Vitest, Testing Library, user-event, MSW, and vitest-axe, with a `src/test/` setup and render helpers. Add a first test for `stripEmoji`.
  *Done:* `npm test` passes.
- [ ] **1.3 Backend characterization tests.** Pin today's behaviour with the LLM and Content Safety mocked:
  - intent routing, including distress and the chat fallback
  - the severity ≥ 2 rejection
  - PII redaction
  - the `{intent, response, mood, agentName, data}` response shape
  *Done:* tests pass on the current, untouched code.
- [ ] **1.4 Frontend characterization tests.** Pin today's behaviour:
  - `TasksContext` mood derivation and the excited flash
  - `PreferencesContext` DOM effects
  - the chat error state (MSW 500)
  - toggling a task step
  *Done:* tests pass on the current, untouched code.
- [ ] **1.5 Guilt scan.** Add a test that fails on banned patterns in UI copy, sample data, and prompts (see `testing.md`).
  *Done:* it runs in `npm test` and passes today.
- [ ] **1.6 CI.** Add a GitHub Actions workflow that runs lint, typecheck, and all tests for both parts on every PR.
  *Done:* the workflow is green on a PR.
- [ ] **1.7 Runtime bugs.** Fix the broken flows from the audit that won't be rewritten later, each with a regression test.
  *Done:* every remaining audit item is either fixed or linked to the phase that removes it.

## Phase 2: Backend clean architecture

The characterization tests from 1.3 must stay green through every item in this phase.

- [ ] **2.1 Layer skeleton.** Create `domain/`, `application/`, `infrastructure/`, and `api/`, and move the config. Document the dependency rule in the backend README.
  *Done:* the app starts and the 1.3 tests pass.
- [ ] **2.2 LLM port.** Add an `LLMProvider` interface, an OpenAI-compatible adapter (GitHub Models by default, Azure OpenAI by config), and a scripted `fake` provider selectable with `LLM_PROVIDER=fake`.
  *Done:* adapter contract tests (respx) cover success, malformed JSON, 429, and timeout.
- [ ] **2.3 Safety port.** Add a `SafetyChecker` interface, an Azure Content Safety adapter, and a no-op adapter for when it's unconfigured. Move PII redaction behind a port.
  *Done:* contract tests cover the severity mapping; unit tests cover the reject path.
- [ ] **2.4 Orchestrator and CalmSense as use cases.** Move them into `application/` so `handle_chat` runs the shared agent pipeline. The router becomes thin.
  *Done:* pipeline tests cover the safety order, PII redaction before the LLM, and the routing table; the 1.3 tests are ported and still pass.
- [ ] **2.5 SimplifyCore and PebbleVoice as use cases.** Same pattern as 2.4.
  *Done:* use-case and API tests cover both.
- [ ] **2.6 Local document parsing.** Add a `DocumentParser` port with a `pypdf` + `python-docx` adapter. Files are parsed in memory and not stored.
  *Done:* tests with small fixture files (PDF, DOCX, TXT, plus one corrupt file) pass with no Azure services.
- [ ] **2.7 Remove dead services.** Delete Semantic Kernel, Cosmos, AI Search, Web PubSub, the focus router, Blob Storage, Document Intelligence, App Insights, and `deploy.ps1`, along with their dependencies.
  *Done:* the backend runs with only an LLM key set, the whole suite passes, and `requirements.txt` is gone.
- [ ] **2.8 LLM eval suite.** Add a labelled set of about 30 messages (including distress) and `pytest -m eval` checks for JSON validity, intent accuracy, distress recall, and the voice rules. Schedule it weekly in CI.
  *Done:* a baseline score is recorded in `backend/tests/evals/README.md`.
- [ ] **2.9 Backend coverage floor.** Enforce 90% on `domain/` + `application/` and 80% overall in CI.
  *Done:* CI fails below the floor.

## Phase 3: Frontend feature structure

The characterization tests from 1.4 must stay green through every item in this phase.

- [ ] **3.1 Skeleton and chat.** Create `features/` and `shared/`, then move the chat feature and the API client there.
  *Done:* chat works, the 1.4 chat tests pass, and the import boundaries are documented.
- [ ] **3.2 Tasks.** Split `today/page.tsx` into `features/tasks` (list, card, roadmap view, WhyCard, hooks).
  *Done:* the page file is under ~100 lines, each hook has unit tests, and `TaskCard` and `WhyCard` have component tests.
- [ ] **3.3 Documents.** Split `DocumentModal` and `ImmersiveReader` into `features/documents`.
  *Done:* no file exceeds ~200 lines, and tests cover the reading-level slider, the comprehension check, and the built-in reader fallback.
- [ ] **3.4 Settings, activity, and companion.** Split the settings page and move the activity log and the Pebble character into their features.
  *Done:* every page is thin, and the settings toggles (calm mode, reduce animations) have tests.
- [ ] **3.5 Typed API contract.** Generate TS types from FastAPI's OpenAPI with `openapi-typescript`, replace the hand-written `ChatResponse`, type the MSW handlers from them, and add a CI check for drift.
  *Done:* changing a backend schema breaks the frontend typecheck.
- [ ] **3.6 Accessibility tests.** Add axe checks for each feature's main components, plus keyboard tests for the skip link, focus on navigation, and modal focus trap.
  *Done:* there are no axe violations, and the keyboard tests pass.
- [ ] **3.7 E2E demo flow.** Set up Playwright against the local stack with `LLM_PROVIDER=fake`, covering the demo flow from `testing.md` plus an axe scan per page. Add it to PR CI.
  *Done:* the spec passes locally and in CI.
- [ ] **3.8 Frontend coverage floor.** Enforce 80% on `features/*/lib` + `hooks` in CI.
  *Done:* CI fails below the floor.

## Phase 4: Persistence and auth

- [ ] **4.1 Postgres and tasks.** Add `docker compose` Postgres (plus a CI service container), SQLAlchemy models, Alembic, a `TaskRepository`, and the task endpoints.
  *Done:* repository integration tests pass against real Postgres, and the migration from empty is tested.
- [ ] **4.2 Preferences and activity.** Add repositories and endpoints. The agent pipeline now writes activity entries server-side.
  *Done:* a parametrized test proves every agent writes an activity row with its reasoning and safety status.
- [ ] **4.3 Auth.js.** Add GitHub and Google sign-in, have Next.js sign short-lived backend tokens, and add `get_current_user` in FastAPI. Remove Entra and `DEV_MODE`, and add a dev login for local use and E2E.
  *Done:* API tests cover missing, invalid, and expired tokens (401) and **user isolation** for every resource; E2E signs in with the dev login.
- [ ] **4.4 Tasks from the API.** The tasks feature uses TanStack Query against the backend instead of localStorage.
  *Done:* component tests (MSW) cover loading, optimistic toggle, and rollback on error; E2E passes.
- [ ] **4.5 Preferences and activity from the API.** Move both over, and import any existing localStorage data into the account once.
  *Done:* the one-time import is tested (runs once, idempotent); localStorage holds only UI conveniences.
- [ ] **4.6 Data export and deletion.** Add an export-all-data (JSON) endpoint and a delete-account endpoint, with UI in settings.
  *Done:* tests, parametrized from the ORM metadata, prove that export covers every user table and deletion leaves zero rows.

## Phase 5: Make the named agents real

- [ ] **5.1 WhyBot.** Generate a plain-language explanation in the pipeline for every agent result, store it with the activity entry, and have `WhyCard` show it.
  *Done:* the pipeline test asserts that every agent result has an explanation; no hard-coded "why" text remains.
- [ ] **5.2 Undo and dismiss.** Every AI-created change (steps, tasks from documents) can be undone or dismissed.
  *Done:* API and component tests cover undo for each kind of AI change.
- [ ] **5.3 AdaptLens.** Collect simple usage signals (skipped steps, reading-level changes, chunk-size edits) and suggest preference changes that the user approves.
  *Done:* tests prove that a suggestion applies only when accepted, and that a dismissed one doesn't come back immediately.
- [ ] **5.4 BridgeBot: calendar export.** Export a task plan as an `.ics` file.
  *Done:* tests validate the `.ics` output against a parser; a manual import into Google Calendar and Outlook works.
- [ ] **5.5 BridgeBot: Google Calendar (optional).** Push steps to Google Calendar using the Google sign-in scope.
  *Done:* adapter contract tests (respx) pass, and steps appear in the user's calendar after consent.
- [ ] **5.6 Evals for new agents.** Extend the eval set for WhyBot (explanations follow the voice rules) and AdaptLens (sensible suggestions).
  *Done:* the scores are recorded.

## Phase 6: Structure without guilt

See principle 1 in `mission.md`.

- [ ] **6.1 Guilt audit.** Review UI copy, sample data, and prompts against principle 1, and extend the guilt scan (1.5) with any new patterns found.
  *Done:* the scan covers every rule in principle 1 and passes.
- [ ] **6.2 Cumulative progress.** Add counts that only go up ("14 steps finished this month") to Today and Activity. Nothing resets.
  *Done:* a domain test proves counts never decrease across gaps of days.
- [ ] **6.3 Neutral deadlines.** Show time left as a calm bar. Near a deadline, Pebble offers to make the task smaller with CalmSense.
  *Done:* tests with a fixed clock cover the bar maths and when the offer appears; there is no red styling.
- [ ] **6.4 "Still open" flow.** Past-due tasks offer three choices: move it, make it smaller, or let it go. Letting go archives the task and logs it neutrally.
  *Done:* domain, API, and component tests cover all three paths.
- [ ] **6.5 Welcome back.** After time away, Today opens fresh with "Want to pick one small thing?" and never mentions how long the user was gone.
  *Done:* tests with a fixed clock cover the greeting, and the guilt scan covers the copy.
- [ ] **6.6 Opt-in reminders.** The user sets a gentle reminder (in-app, plus optional browser notifications). They are off by default.
  *Done:* tests prove nothing notifies unless the user turned it on.

## Phase 7: Solo focus

- [ ] **7.1 Remove rooms.** Delete the multi-user rooms UI, fake participant counts, and related sample data.
  *Done:* no fake presence numbers remain, and the 1.4 tests and E2E pass.
- [ ] **7.2 Focus session.** A Pomodoro session tied to one task step, with Pebble working beside you. It respects reduce-animations and never penalizes stopping early.
  *Done:* timer hook tests use fake timers; component tests cover stopping early with no penalty; E2E starts focus from a step.

## Phase 8: Deploy

- [ ] **8.1 Backend Dockerfile.** Build the backend with `uv` and add a health check.
  *Done:* `docker compose up` runs the backend and Postgres locally, and CI runs E2E against the built image.
- [ ] **8.2 Neon and Render.** Deploy the database and backend, running migrations on deploy.
  *Done:* the public health endpoint responds.
- [ ] **8.3 Vercel.** Deploy the frontend with the rewrite target from an env var and the Auth.js callback URLs.
  *Done:* sign-in and chat work on the live URL.
- [ ] **8.4 Rate limits.** Add a per-user limit on agent calls to protect the GitHub Models quota, plus a gentle "Pebble is resting" message on 429.
  *Done:* an API test covers the limit, an MSW component test covers the message, and the message passes the guilt scan.

## Phase 9: Presentation

- [ ] **9.1 Architecture diagram.** Redraw it for the new stack as Mermaid in the README (so it stays in sync with the code) and remove the old PNG.
  *Done:* the diagram matches `tech.stack.md`.
- [ ] **9.2 README rewrite.** Cover honest features, screenshots/GIFs, the live link, local setup in five commands or fewer, and how to run the tests.
  *Done:* every claimed feature is covered by the E2E demo flow.
- [ ] **9.3 Production smoke test.** Run the E2E demo flow against production after each deploy.
  *Done:* the post-deploy job is green against the live URL.
