# 1.7 Runtime bugs: plan

1. Branch `fix/1.7-runtime-bugs` from `main`.
2. Write the regression tests for A-011, A-014 and A-016, and watch them fail.
3. Fix `stripEmoji` and `PebbleChat`; the tests pass.
4. Scan the remaining flows for obvious breakage; log A-016 and A-017.
5. Update `specs/audit.md` (statuses, open list) and tick 1.7.
6. Open the PR and merge when CI is green.
