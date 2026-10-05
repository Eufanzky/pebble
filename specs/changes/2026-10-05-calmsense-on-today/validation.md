# 7.1 CalmSense on Today: validation

- [x] Backend: 616 tests with Postgres (6 unit tests for `BreakDownTask`, 3 API tests, 2 for CalmSense's title), coverage 99.6%, ruff, vulture.
- [x] Frontend: 574 tests. They cover the context (`breakDown` with the fake API, a just-added task, failure, show/hide), the hook, the card (offered only without steps, the working state with bars only with motion, the gentle failure, none for a finished task), Today, chat ("Add to Today" once, the title fallback, nothing for other replies) and axe on the failure state. Plus lint, knip, `tsc` and coverage.
- [x] E2E 27/27. The demo flow adds CalmSense's chat breakdown to Today, breaks down a typed task through the real backend, reloads, and finds CalmSense's entry with its reasoning.
- [x] Evals after the prompt change: JSON 1.00, intent 0.97, distress 1.00, voice 0.90 (all pass).
- [x] No "breaking it down" animation runs without a request behind it (the reveal and `BREAK_DOWN_MS` are gone).
