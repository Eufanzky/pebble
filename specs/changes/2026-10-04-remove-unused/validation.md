# 6.1 Remove what isn't used: validation

- [x] `npm run lint:dead` (knip) and `uv run vulture` report nothing; both run in CI.
- [x] No reference to a removed path is left in the README, CLAUDE.md or code; the hackathon release link resolves.
- [x] Build, lint, `tsc`, 535 frontend tests, 604 backend tests (with Postgres) and E2E 27/27 pass.
