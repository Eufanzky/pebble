# 8.4 "Still open" flow: plan

1. Backend: `Task.let_go`/`take_back`, `TaskFinishedError`, the use case, list and reorder skipping let-go tasks (Postgres and the fake, held to one contract), migration 0009, the two endpoints; domain, use-case, API (with isolation) and contract tests.
2. Frontend: the API calls and the MSW fake; `letGo`/`takeBack` in the context; `useStillOpen`; `StillOpen` on `TaskCard`.
3. Tests: card (choices, focus), Today against the fake (all three paths, undo), axe, E2E (move, let go, reload).
4. Docs, roadmap, PR.
