# 6.4 Clear names: validation

- [x] No `pebble/` folder, `(app)` group, `tests/domain/` or `backend/db/init/` left; nothing outside the history names them.
- [x] `docs-links.test.ts` fails on a stale path (checked with `backend/db/init/...` added to CLAUDE.md) and passes on the docs.
- [x] `names.test.ts` fails on "Focusbuddy" in the code (checked with a probe file) and passes.
- [x] Evals on Groq after the prompt change: JSON 1.00, intent 0.97, distress 1.00, voice 0.90; every eval passes. The misses are long sentences and `chat-thanks`, as in the baseline, and none involves the name.
- [x] Frontend: lint, knip, `tsc`, 555 tests, API types unchanged, build. Backend: ruff, vulture, 604 tests with Postgres, coverage 99.6%. E2E 27/27.
- [ ] `docker compose up -d db` with the moved init script: Docker isn't available in this WSL. The mount path is checked by hand (`./docker/postgres-init` exists); CI uses service containers, not Compose.
