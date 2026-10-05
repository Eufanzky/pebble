# 7.1 CalmSense on Today: plan

1. Backend: `TaskBreakdown.title`, `Tasks.set_breakdown`, `BreakDownTask` (tasks + CalmSense + preferences), `POST /api/tasks/{id}/breakdown`; unit and API tests.
2. Frontend: `breakDownTask` API call, `breakDown`/`setStepsShown` in the context, `useBreakDown` as a request status, the card (working, failed, show/hide steps), the MSW fake; chat breakdowns with "Add to Today".
3. Remove the fake reveal and its fake log entry; tests for each state, axe on the new ones.
4. Evals (prompt change), E2E (the demo flow breaks down a typed task), docs, PR.
