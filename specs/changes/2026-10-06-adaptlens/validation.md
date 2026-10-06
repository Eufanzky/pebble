# 7.6 AdaptLens: validation

- [x] A suggestion applies only when accepted. Tested at three levels:
  - Use case: the preference is unchanged until `accept`.
  - API: `GET /api/suggestions` changes nothing; a stale key is a 409 and changes nothing.
  - Card: the level stays 5 until "Use level 3".
- [x] A dismissed suggestion doesn't come back right away: it's absent at 13 days and back at 14 (fake clock). Over the API, the dismissal hides it at once.
- [x] Rules: a clear pattern suggests; too few signals, no agreement, the current value, the largest size, or older signals beyond the newest 5 don't.
- [x] Signals come from real actions: three simplified uploads, or three tasks finished through the API with their steps open.
- [x] Store contract on Postgres and the fake; migration 0007; export and deletion cover both new tables; every table has a one-column key.
- [x] Backend: 689 tests with Postgres, coverage 99.6%, ruff, vulture. Frontend: 597 tests, lint, knip, `tsc`, axe on Today with the card.
- [x] E2E 28/28. The new spec breaks down three tasks, finishes them with every step open, sees the larger-steps suggestion, accepts it, and finds the step size changed and AdaptLens's entry in the log.
- [x] No prompt changed, so no eval run.
