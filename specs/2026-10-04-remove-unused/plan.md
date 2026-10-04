# 6.1 Remove what isn't used: plan

1. Survey tracked files; ask about `demo/` and `docs/` (delete both, the user chose).
2. Run knip; delete dead code, un-export internal symbols, prune index re-exports; config and CI step.
3. Run vulture; configure the framework patterns; CI step.
4. Delete the folders, stubs and icons; fix the README, CLAUDE.md and layout references.
5. Build, lint, knip, vulture, all tests, E2E; tick 6.1.
