# 1.2 Frontend test tooling: requirements

Roadmap item: **1.2 Frontend test tooling** (Phase 1). Branch: `test/1.2-frontend-test-tooling`.

## Goal

Give the frontend a test runner and the helpers that 1.4 (characterization), 1.5 (guilt scan) and 3.6 (accessibility) build on.

## Scope

In scope:
- Dev dependencies: Vitest, `@vitejs/plugin-react`, jsdom, Testing Library (`react`, `dom`, `jest-dom`, `user-event`), MSW and vitest-axe.
- `vitest.config.mts`: jsdom environment, the `@/` alias, colocated `src/**/*.test.ts(x)` files.
- `src/test/`: a setup file, an MSW server with shared handlers, and render helpers that wrap the app's provider tree.
- `npm test` (single run) and `npm run test:watch`.
- The first real test: `stripEmoji` from `PreferencesContext`.
- Docs: README, `CLAUDE.md`.

Out of scope:
- Characterization tests (1.4), the guilt scan (1.5), CI (1.6), coverage floors (3.8).
- Changing `stripEmoji`. Its gaps are logged as A-011 and fixed in 1.7.

## Decisions

1. **`stripEmoji` is tested through `usePreferences()`**, not extracted into a pure function. It lives in `contexts/`, the old layout, and 3.4 moves it into a feature. Testing it through the hook changes no app code and still holds after that move.
2. **Tests pin today's behaviour.** Emoji in the listed ranges, variation selectors, ZWJ sequences and keycaps are covered. Emoji the regex misses (A-011) aren't asserted either way, so the 1.7 fix only adds tests.
3. **No real network.** MSW runs with `onUnhandledRequest: 'error'`, so a request without a handler fails the test (rule 4 in `testing.md`). jsdom's origin is `http://localhost:3000`, so handlers and app code both use relative `/api/...` paths.
4. **Render helpers wrap the whole `AppShell` provider tree** (Preferences, Pebble, Tasks, ActivityLog, Toast) but not the layout, so components that use any context render without extra setup.
5. **Tooling self-test.** `src/test/setup.test.tsx` checks that MSW, the unhandled-request guard, user-event and axe work, so a broken setup fails in one obvious place.
6. **Versions.** Vitest 5 needs `@types/node` ≥22, so it was bumped from `^20` to `^22` to match the Node 22 runtime. jsdom is pinned to `^29`: jsdom 30 requires Node ≥22.22.2.
7. **Two setup workarounds**, each commented in the code:
   - vitest-axe 0.1 only augments the old global `Vi` namespace, so `src/test/vitest.d.ts` registers `toHaveNoViolations` with Vitest's current types.
   - jsdom has no canvas, and axe probes it, which logs "Not implemented" on every run. `getContext` is stubbed to return `null`, as a browser without canvas would.
