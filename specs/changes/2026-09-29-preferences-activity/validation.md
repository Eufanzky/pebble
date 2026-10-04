# 4.2 Preferences and activity: validation

- [x] Every agent result writes one activity entry with the agent name, reasoning and safety status, through chat and the direct endpoints (parametrized).
- [x] Held-back input and flagged replies write a `flagged` entry without the text; logged text is redacted.
- [x] Chat still answers when the activity log can't be written (no database, or an outage).
- [x] Preferences: defaults for a new account, partial updates, validation, per-user.
- [x] Activity: newest first, bounded limit, server time, per-user.
- [x] Store contracts pass on Postgres and on the in-memory fakes; migrations `0001`→`0002` up, down and drift-free.
- [x] `pytest --cov` (with `TEST_DATABASE_URL`), both floors, `ruff check`, `tsc --noEmit`, guilt scan pass; API types regenerated.
