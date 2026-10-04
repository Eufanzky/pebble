# 3.8 Frontend coverage floor: requirements

Roadmap item: **3.8** (Phase 3). Branch: `test/3.8-frontend-coverage-floor`.

## Goal

CI fails when coverage of the frontend's logic, `src/features/*/lib` and `src/features/*/hooks`, drops below 80%.

## Scope

- `@vitest/coverage-v8`; a `coverage` block in `vitest.config.mts` with those includes and an 80% threshold on lines, statements, functions and branches.
- `npm run test:coverage`; the CI frontend job runs it instead of `npm test`.

## Decisions

1. **The floor covers logic only.** Components have no floor; behaviour tests and E2E cover them (`testing.md`).
2. **All four metrics, 80% each.** Today it's 99% statements and 96% branches, so an honest change has room while a real gap fails.
3. **Untested files count.** Coverage is measured over every file the includes match, so a new hook with no tests lowers the number.
