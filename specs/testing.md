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
  unit/          domain rules and use cases, with fakes
  api/           routers over HTTP: auth, validation, response shape
  integration/   repositories and migrations against real Postgres
  contract/      adapters against recorded provider responses
  evals/         real-LLM prompt checks (marker: eval, not run on PRs)
  conftest.py    app factory, fakes, test DB session

pebble/
  src/**/*.test.ts(x)   colocated unit and component tests
  src/test/             setup, MSW handlers, render helpers
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
  - Every agent result writes an activity entry with the agent name, reasoning, WhyBot explanation, and safety status (parametrized over all agents).
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
  - Progress counters.
  - Deadline bar maths with a fixed clock.
- **Components:**
  - Toggling a task step.
  - `WhyCard` showing the reasoning.
  - Chat showing a gentle error when the backend fails.
  - Calm mode stripping emoji from rendered text.
  - Reduce-animations toggling the `<html>` class.
  - The three-choice "still open" flow.
- **Accessibility:** axe finds no violations on key components. Keyboard paths work (skip link, focus on navigation, modal focus trap).
- **API layer:** MSW handlers for success, 401, 429 ("Pebble is resting"), and 5xx.

### End to end (Playwright)

One demo-flow spec, kept short and stable:
1. Dev login.
2. Break a task into steps.
3. Finish a step.
4. Simplify a document.
5. Open the activity log and see the agent name and its "why".

It runs on every PR against the local stack with the fake LLM, and after deploy against production (roadmap 9.3). Each page also gets an axe scan.

### Principle checks

These enforce `mission.md` automatically:

- **Guilt scan:** a test fails if UI copy, sample data, or prompts contain banned patterns (streaks, "overdue", missed-day wording, red or alarm classes, loss framing). New exceptions need a written reason next to them.
- **No silent AI:** covered by the parametrized activity-entry test above.
- **Privacy:** covered by the export and deletion tests above.
- **Honest claims:** the E2E demo flow exercises every feature the README claims.

### LLM evals (opt-in)

`uv run pytest -m eval` calls the real provider (GitHub Models) with a small labelled set of about 30 messages, including distress cases. It checks:
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
| Every PR | Lint, typecheck, backend unit/api/contract/integration, frontend unit/component, guilt scan, OpenAPI drift check, coverage floors, E2E demo flow (fake LLM) |
| Weekly (scheduled) + manual | LLM evals |
| After deploy | E2E demo flow against production |

## Commands

These come into effect as the roadmap adds them.

```bash
# backend (from backend/)
uv run pytest                          # everything except evals
uv run pytest tests/unit               # one layer
uv run pytest -k routing               # by name
uv run pytest -m eval                  # real-LLM evals (needs a GitHub Models token)

# frontend (from pebble/)
npm test                               # Vitest, all
npm test -- src/features/tasks         # one folder or file
npm run test:e2e                       # Playwright (needs the local stack)
```
