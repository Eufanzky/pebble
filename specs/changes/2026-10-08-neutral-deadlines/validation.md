# 8.3 Neutral deadlines: validation

- [x] Fixed clock: `deadline.test.ts` (fill, labels, "Still open", a clock change), `TaskCard.test.tsx` (the bar's value, when the offer appears and when it doesn't, "Not now", the same look near and far), `test_a_due_day_starts_its_bar_when_it_is_chosen` (use case), `with_due` (domain).
- [x] API: set, keep, clear, a bad date is 422. Postgres: the due day round-trips and clears (`tests/integration`, 82 passed, including `alembic check`).
- [x] E2E `deadlines.spec.ts` through the real backend; the full suite passed 30 of 30 (one earlier full run had a one-off stats failure, A-035).
- [x] No red: the guilt scan passes, and the bar uses `--color-surface-2` and `--color-line-strong` only.
- [x] Frontend lint, knip, `tsc --noEmit`, `npm test`; backend ruff, vulture, pytest.
