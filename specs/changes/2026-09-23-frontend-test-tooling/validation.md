# 1.2 Frontend test tooling: validation

Run from `pebble/` after a fresh `rm -rf node_modules && npm ci`.

- [ ] `npm ci` succeeds with no peer-dependency errors.
- [ ] `npm test` passes, with no stderr noise (no MSW or jsdom warnings).
- [ ] `npm test -- src/contexts` runs only the `stripEmoji` tests.
- [ ] Making `stripEmoji` always return its input fails the `stripEmoji` tests.
- [ ] A typo in an axe or jest-dom matcher name fails `npx tsc --noEmit`.
- [ ] `npm run lint`, `npx tsc --noEmit` and `npm run build` pass with 0 errors and 0 warnings.
- [ ] `git diff main -- src` shows no changes outside `src/test/` and the new test file.
- [ ] A-011 is logged in `specs/audit.md`, and 1.2 is ticked in `specs/roadmap.md`.
