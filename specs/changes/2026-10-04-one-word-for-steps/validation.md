# 6.6 One word for steps: validation

- [x] Backend: ruff, vulture, 605 tests with Postgres (one more: the 0005 migration test), coverage 99.6%.
- [x] Frontend: lint, knip, `tsc`, 556 tests (one more: the step-name check), API types regenerated, build.
- [x] `names.test.ts` fails on `subtask` in the code (checked with a probe file) and passes.
- [x] E2E 27/27, after #65 gave each E2E test its own dev user (the 6.5 split had made parallel tests share accounts).
- [ ] **Evals: voice below its 0.9 target in both 6.6 runs (0.87, 0.83).** JSON, intent and distress are 1.00. `main` without 6.6 scored 0.90 the same afternoon. 6.6 changes only CalmSense's input, and in the second run four of the five misses came from agents whose prompts didn't change, so the rename isn't the cause: the voice score varies by about a reply around its threshold (A-028). Recorded in `tests/evals/README.md`; the fix is prompt work, not a rename.
