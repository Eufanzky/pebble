# 7.6 AdaptLens: plan

1. Domain rules (`suggest`, `still_quiet`) with unit tests.
2. Port, `UsageSignals` (hooked into `Tasks` and SimplifyCore), `AdaptLens` (current, accept, dismiss); tests with a fake clock.
3. Tables, repository, migration 0007, fake, store contract; export and deletion cover them.
4. `/api/suggestions` (GET, accept, dismiss), with a 409 for a changed suggestion; API tests from real requests.
5. Frontend: `adopt()`, the `suggestions` feature and its card on Today, the MSW fake, tests, axe; an E2E for the whole loop.
6. Docs, PR.
