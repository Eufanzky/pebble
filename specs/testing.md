# Testing

How Pebble is tested. The goal: the app can be restructured and extended without breaking, and the principles in `mission.md` are checked by tests, not by memory.

## Rules

1. **No tests, not done.** Every roadmap item that adds or changes behaviour ships with tests for that behaviour in the same PR.
2. **Pin behaviour before refactoring.** Before a phase moves code (phases 2 and 3), characterization tests pin today's behaviour. The refactor must keep them green.
3. **Bugs start with a failing test.** A bug fix first adds a regression test that fails, then makes it pass.
4. **No real network in PR tests.** The LLM, content safety, and OAuth are faked. Real LLM calls happen only in the opt-in eval suite.
5. **Deterministic.** Fixed clock, seeded data, scripted fake-LLM responses. A flaky test is fixed or deleted, never retried until it passes.
6. **Test behaviour, not implementation.** Assert on what the user or caller sees, so tests survive the restructure.

## Tools

| Area | Tools |
|:--|:--|
| Backend unit and integration | pytest, pytest-asyncio, pytest-cov |
| Backend HTTP | httpx `AsyncClient` against the FastAPI app, with dependency overrides |
| Outbound HTTP (adapters) | respx, with recorded responses |
| Database | Real Postgres: `docker compose` locally, a service container in CI. Alembic runs from empty. |
| Frontend unit and component | Vitest, Testing Library, `@testing-library/user-event` |
| API mocking (frontend) | MSW, with handlers typed from the generated OpenAPI types |
| Accessibility | `vitest-axe` on components, `@axe-core/playwright` on pages |
| End to end | Playwright, against the full local stack with `LLM_PROVIDER=fake` |

## Layout

```
backend/tests/
  unit/          domain/ (entity rules), application/ (use cases with fakes), infrastructure/ (adapters with no
                 outside service), and the architecture rule
  api/           routers over HTTP: auth, validation, response shape, the activity pipeline
  integration/   repositories, migrations, export and deletion against real Postgres
  contract/      adapters against recorded provider responses
  evals/         real-LLM prompt checks (marker: eval, not run on PRs)
  fixtures/      sample documents (and the script that makes them)
  fakes.py       in-memory stores and ScriptedSafety
  conftest.py    app, client, the container of fakes

frontend/
  src/**/*.test.ts(x)   colocated unit and component tests
  src/test/             setup, stateful MSW fakes of the API, render helpers, repo-wide checks
  e2e/                  Playwright specs
```

The fake LLM lives in `backend/app/infrastructure/llm/fake.py`, not only in tests, because E2E runs the real backend with `LLM_PROVIDER=fake`.

## What to test

### Backend

- **Domain:** entity rules. For example, progress counts never decrease; a "still open" task can be moved, made smaller, or let go.
- **Agent pipeline (use cases with fakes):**
  - Unsafe input is rejected before the LLM is called.
  - The fake LLM receives PII-redacted text, never the raw input.
  - Unsafe output is replaced with a safe reply.
  - Every agent result writes an activity entry with the agent name, reasoning, WhyBot's explanation and safety status (parametrized over all agents); when WhyBot can't answer, the agent's reasoning explains it.
- **Routing:** a table test mapping each intent to its agent. Unknown intent falls back to chat. Malformed classifier JSON falls back gracefully. Distress never calls a sub-agent.
- **API:**
  - Missing, invalid, or expired tokens get a 401.
  - **User isolation:** user A can never read or change user B's data (parametrized over every resource).
  - Response shapes match the schemas.
- **Privacy:** export includes every user-owned table; account deletion leaves zero rows for that user. Both are parametrized from the ORM metadata, so a new table can't be forgotten.
- **Adapters:** request building and response parsing for each provider (e.g. Content Safety severity mapping), plus error and timeout handling.
- **Migrations:** `alembic upgrade head` works on an empty database.

### Frontend

- **Logic (`lib/`, hooks):**
  - `stripEmoji`.
  - Mood derived from completion percentage.
  - Time-of-day greeting.
  - Progress counters and the stats summary.
  - Deadline bar maths with a fixed clock (8.3).
- **Components:**
  - Toggling a task step.
  - `WhyCard` showing the reasoning.
  - Chat showing a gentle error when the backend fails.
  - Calm mode stripping emoji from rendered text.
  - Reduce-animations toggling the `<html>` class.
  - The three-choice "still open" flow (8.4).
- **Accessibility:** axe finds no violations on key components. Keyboard paths work (skip link, focus on navigation, modal focus trap).
- **API layer:** MSW handlers for success, 401, 429 ("Pebble is resting"), and 5xx.

### End to end (Playwright)

`frontend/e2e/`, one spec per area. `demo-flow.spec.ts` is kept short and stable:
1. Dev login.
2. Ask CalmSense in chat, and add its steps to Today.
3. Break a task of your own into steps on Today, finish one, and reload to see it saved.
4. Upload a document, have SimplifyCore simplify it, and add its action item to Today.
5. Open the activity log and see the agent name and its reasoning.

Beside it: `tasks` (editing, reordering, filtering), `stats` (progress adds up), `account` (the one-time import, export, deletion), `installable` (install and the offline page), `sign-in` (signing out, the 401 when signed out) and `layout` (every page at 360, 768 and 1280px with axe and an overflow check, and the phone tab bar). It runs on every PR against the local stack (real Postgres, fake LLM), and after deploy against production (roadmap 11.3).

### Principle checks

These enforce `mission.md` automatically:

- **Guilt scan:** a test fails if UI copy, sample data, or prompts contain banned patterns (streaks, "overdue", missed-day wording, red or alarm classes, loss framing). New exceptions need a written reason next to them.
- **No silent AI:** covered by the parametrized activity-entry test above.
- **Privacy:** covered by the export and deletion tests above.
- **Honest claims:** the E2E exercises every feature the README claims.
- **One source of style:** `tokens.test.ts` fails if a colour token is defined outside `shared/ui/tokens.css` or a `var(--…)` is used that nothing defines.
- **Docs stay true:** `docs-links.test.ts` fails on a broken relative link in the Markdown docs.
- **No dead code:** knip and vulture fail CI on unused files, exports, dependencies or functions.

### LLM evals (opt-in)

`uv run pytest -m eval` calls the real provider (Groq's free tier by default) with a small labelled set of about 30 messages, including distress cases. It checks:
- The JSON output is valid.
- The intent accuracy meets a target.
- Distress is always caught.
- Replies follow the voice rules (no shaming or rushing words, short sentences).

Run it after any prompt change and weekly in CI (scheduled, never on PRs, to protect the rate limits). Results are tracked, so a prompt change that makes things worse is visible.

## Coverage

Coverage is a floor, not a goal, and it can only go up.

| Scope | Floor | Enforced from |
|:--|:--|:--|
| Backend `domain/` + `application/` | 90% | end of phase 2 |
| Backend overall | 80% | end of phase 2 |
| Frontend `features/*/lib` + `hooks` | 80% | end of phase 3 |
| Frontend components | none (covered by behaviour tests + E2E) | |

## CI gates

| When | Runs |
|:--|:--|
| Every PR | Lint, dead code (knip, vulture), typecheck, backend unit/api/contract/integration, frontend unit/component, guilt scan, token and link checks, OpenAPI drift check, coverage floors, the backend image under `docker compose` (both health checks, migrations at head), E2E (fake LLM, the backend from its image) |
| Weekly (scheduled) + manual | LLM evals |
| After deploy (11.3) | E2E demo flow against production |

## Commands

```bash
# backend (from backend/)
uv run pytest                          # everything except evals
uv run pytest tests/unit               # one layer
uv run pytest -k routing               # by name
uv run pytest --cov                    # with the 80% floor
TEST_DATABASE_URL=postgresql+asyncpg://pebble:pebble@localhost:5432/pebble_test uv run pytest   # plus integration
uv run pytest -m eval                  # real-LLM evals (needs `LLM_API_KEY`, a free Groq key)
uv run ruff check && uv run vulture    # lint, dead code

# frontend (from frontend/)
npm test                               # Vitest, all
npm test -- src/features/tasks         # one folder or file
npm run test:coverage                  # with the 80% floor on lib and hooks
npm run lint && npm run lint:dead      # ESLint, knip
npm run test:e2e                       # Playwright; starts the backend (fake LLM) and a production build
```
