# 5.6 Stats: validation

- [x] Domain: per-day and per-tag counts, the user's time zone, every day present (a quiet day is zero), and all-time totals that never go down across gaps of 0 to 400 days.
- [x] Application: a task counts once even if unticked and ticked again; steps then the task; edits that finish nothing count nothing; a failed note doesn't stop the change; focus is 1 to 180 minutes.
- [x] API: shape, adding up across tasks, steps and focus, unticking and deleting take nothing back, isolation, range and zone validation, 401, 503.
- [x] Repository contract on Postgres and the fake (oldest first, the same item kept once); account export and deletion include the new table; migration drift-free.
- [x] Frontend: sentences (specific, never counting what didn't happen), axis maths, labels, the view (range, measure, table, keyboard reading, tag rows, retry, time zone, axe), focus minutes reported.
- [x] E2E: `/stats` fits 360, 768 and 1280px with axe; a finished step and task show up and unticking takes nothing back. 26/26.
- [x] Backend 604 passed with floors; frontend 527 passed with the coverage floor; lint, `tsc`, build, guilt scan.
