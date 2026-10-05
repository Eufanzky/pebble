# 7.3 An honest activity log: validation

- [x] No frontend code writes an entry: `addEntry` and `postActivity` are gone, the context exposes only reads (a test checks its keys), and the MSW fake has no POST.
- [x] `POST /api/activity` is a 405, and nothing lands in the log (backend test).
- [x] Frontend: 582 tests, lint, knip, `tsc`, coverage. Backend: 616 tests with Postgres, ruff, vulture.
- [x] E2E 27/27. The demo flow still finds CalmSense's and SimplifyCore's entries, which the backend wrote.
