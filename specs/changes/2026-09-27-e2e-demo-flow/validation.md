# 3.7 E2E demo flow: validation

- [x] `npm run test:e2e` passes locally twice in a row (6 tests, about 40 s), with fresh servers that are stopped afterwards.
- [x] No axe violations on any of the five pages in Chromium, colour contrast included.
- [x] The CI `E2E demo flow` job is green on this PR.
- [x] CI first failed at 00:29 UTC: the starter activity entries (fixed times of day) sorted above the flow's entries. The flow now starts from an empty log; logged as A-022.
