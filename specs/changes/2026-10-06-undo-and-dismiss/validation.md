# 7.5 Undo and dismiss: validation

- [x] API: removing a breakdown keeps the rest of the task; another user's task is a 404. Unit: the same at the use-case level, and an unknown task.
- [x] Components:
  - Today: undo after a breakdown, and "Remove the steps".
  - Chat: undo after "Add to Today", which can then be added again.
  - Documents: undo after "Tasks".
  - Context: undo by an id from before the server named the task (fails without the fix), and removing a breakdown.
  - Axe passes with the undo toast showing.
- [x] Frontend: 590 tests, lint, knip, `tsc`. Backend: 648 tests with Postgres, ruff, vulture.
- [x] E2E 27/27 after making the toast let clicks through (it had blocked "Show reasoning" in the demo flow). One sign-out failure in that same run couldn't be reproduced (10/10 since); logged as A-032.
