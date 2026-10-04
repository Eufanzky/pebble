# 1.5 Guilt scan: plan

1. Branch `test/1.5-guilt-scan` from `main`.
2. Grep today's copy for candidates to learn what the scan will hit.
3. Write `pebble/src/test/guilt-scan.test.ts`: file list, patterns with examples, exceptions, readable failures.
4. Plant a violation in each scanned area (sample data, a component, CSS, a prompt) and break the exception; each must fail. Revert.
5. Log A-015; update `CLAUDE.md` and the README; tick 1.5.
6. Run through `validation.md`, push, and open the PR.
