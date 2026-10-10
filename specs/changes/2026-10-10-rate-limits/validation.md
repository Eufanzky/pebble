# 10.4 Rate limits: validation

- [x] `tests/unit/domain/test_rate_limit.py`: under, at and over a limit; calls leaving the window; several limits (the longest wait wins).
- [x] `tests/unit/application/test_rate_limit.py`: `Retry-After` from a fixed clock, refused calls don't count, users are separate, the day limit after the minute one frees, rounding up, no or zero limits.
- [x] `tests/api/test_rate_limits.py`: each of the five routes answers a 429 with `RESTING` and `Retry-After` past the limit without asking the LLM; one shared count; another user and the other endpoints unaffected; signed out is a 401; a provider limit is a 503 in the same words; the settings and their defaults.
- [x] MSW component tests for both kinds (`limit` 429, `provider` 503): chat (`useChat.test.tsx`), a breakdown (`TaskCard.test.tsx`), SimplifyCore (`DocumentModal.test.tsx`), plus `isResting` and a check that the frontend's words match the backend's (`api.test.ts`).
- [x] The guilt scan passes the message and scans both files that hold it.
- [x] Backend ruff, vulture, pytest with coverage (740, 96%); frontend lint, knip, `tsc --noEmit`, `npm run test:coverage` (790).
- [x] E2E: two local full runs each had one unrelated first-navigation timeout (A-036), each passing alone; CI E2E green.
