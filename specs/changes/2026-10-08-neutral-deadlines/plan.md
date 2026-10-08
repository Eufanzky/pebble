# 8.3 Neutral deadlines: plan

1. Backend: `Task.due`/`due_set_at` and `with_due`, the use case's clock, migration 0008, schemas (null clears), presenter; domain, use-case, API and repository-contract tests.
2. Regenerate the API types; the MSW fake follows the same rule.
3. Frontend: `timeLeft()` with fixed-clock tests; `DueBar`, `useNow` and the offer on `TaskCard`; the date field in `EditTaskDialog`; the context starts the bar at once.
4. E2E: a task due tomorrow shows its bar and the offer, and taking it breaks the task down.
5. Docs, roadmap, PR.
