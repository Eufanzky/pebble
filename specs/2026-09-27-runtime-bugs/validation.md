# 1.7 Runtime bugs: validation

Run from `pebble/`.

- [x] Before the fix, the new tests fail: 5 `stripEmoji` cases, both chat error cases, calm-mode chat, and retry after an error.
- [x] After the fix, `npm test` passes (98 tests), including the guilt scan on the new copy.
- [x] `npm run lint`, `npx tsc --noEmit` and `npm run build` pass.
- [x] Every open item in `specs/audit.md` names the phase that fixes or removes it.
- [x] CI is green on the PR.
