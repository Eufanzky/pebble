# 6.5 Names in the code: validation

- [x] Backend: ruff, vulture, 604 tests with Postgres (the same count before and after the splits).
- [x] Evals on Groq after the prompt change: JSON 1.00, intent 1.00, distress 1.00, voice 0.90; every eval passes. Recorded in `tests/evals/README.md`.
- [x] Frontend: lint, knip, `tsc`, 555 tests, build.
- [x] E2E: 27 passed across the seven specs (1.6 min, was 2.4).
- [x] No duplicate `@keyframes` after the CSS rename, and no `.pebble-` selector outside the character's own files.
- [x] Docs name only paths that exist (`docs-links.test.ts`).
