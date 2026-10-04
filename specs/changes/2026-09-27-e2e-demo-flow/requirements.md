# 3.7 E2E demo flow: requirements

Roadmap item: **3.7** (Phase 3). Branch: `test/3.7-e2e-demo-flow`.

## Goal

Playwright runs the demo flow from `testing.md` against the local stack with `LLM_PROVIDER=fake`, plus an axe scan of every page, locally and on every PR.

## Scope

In scope:
- `@playwright/test` and `@axe-core/playwright`; `playwright.config.ts` whose `webServer` starts the backend (uvicorn, `LLM_PROVIDER=fake`, `DEV_MODE=true`) and the frontend's production build.
- `e2e/demo-flow.spec.ts`:
  1. break a task into steps: a chat message goes through the real backend and CalmSense answers
  2. break a Today task down and finish a step
  3. simplify a document: move the reading level and see the simpler text and its note
  4. the activity log shows the agent and its reasoning
  5. axe on `/today`, `/documents`, `/activity`, `/focus` and `/settings`
- `npm run test:e2e`, and an `E2E demo flow` CI job that keeps the report on failure.

Out of scope:
- Dev login, the first step in `testing.md`. It joins the flow in 4.3, when sign-in exists.
- Production runs (9.3).

## Decisions

1. **Production build, real backend, fake LLM.** The flow checks what users get: the Next.js rewrite, the backend's safety and routing, and the fake LLM's deterministic replies.
2. **No retries.** `retries: 0`, as `testing.md` requires.
3. **Each test starts clean.** localStorage is cleared, with animations off, before the flow.
4. **Locally, running servers are reused.** A stale `next-server` on port 3000 served an old build and made every axe check fail with unstyled text. CLAUDE.md warns about it. CI always starts fresh servers.
