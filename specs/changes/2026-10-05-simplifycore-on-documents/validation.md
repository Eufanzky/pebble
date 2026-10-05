# 7.2 SimplifyCore on Documents: validation

- [x] Frontend: 587 tests. The modal covers an upload's working, ready and failed states, asking once per level, the original at 10, "Try again", action items to Today, the long-text and groundedness notes, and the log reload. The two log-reload tests fail when the reload is removed. Axe covers an upload while SimplifyCore works and after it fails. Plus lint, knip, `tsc` and coverage.
- [x] Backend: the 12,000-character cap (422, no LLM call); the fake LLM's action items. 618 tests with Postgres.
- [x] E2E 27/27. The demo flow uploads a text file, reads SimplifyCore's version, adds its action item to Today, and finds SimplifyCore's entry in the log.
- [x] No level shows text SimplifyCore didn't write, except the original (an upload has no pre-written levels).
- [x] No prompt changed (only the request size and the fake), so no eval run was needed.
