# 1.2 Frontend test tooling: plan

All commands run from `pebble/`.

1. Branch `test/1.2-frontend-test-tooling` from `main`.
2. Install the dev dependencies. Bump `@types/node` to `^22` for Vitest's peer range, and pin jsdom to `^29` for the Node engine range.
3. Add `vitest.config.mts` and the `test` and `test:watch` scripts.
4. Add `src/test/`: `setup.ts`, `msw/server.ts`, `msw/handlers.ts`, `render.tsx`, `vitest.d.ts`, and the tooling self-test `setup.test.tsx`.
5. Add `src/contexts/PreferencesContext.test.tsx` for `stripEmoji`. Break `stripEmoji` by hand to check that the tests fail, then revert.
6. Log A-011 (emoji `stripEmoji` misses) in `specs/audit.md` for 1.7.
7. Update `README.md` and `CLAUDE.md`; tick 1.2 in `specs/roadmap.md`.
8. Run through `validation.md`, push, and open the PR.
