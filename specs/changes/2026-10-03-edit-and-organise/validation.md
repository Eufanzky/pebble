# 5.5 Edit and organise tasks: validation

- [x] API: reorder, new tasks last after a reorder, a mismatched order is a 409 and moves nothing, another user's task can't be put in an order.
- [x] Repository contract (Postgres and the fake): reorder, and refusal of missing, unknown, malformed or someone else's ids. Migration 0003 numbers existing tasks per user in the order they were added; `alembic check` is clean.
- [x] Context: edit, delete and reorder reach the server, including tasks the server hasn't answered for yet.
- [x] Reorder hook: arrow keys, Home and End, edges, announcements; drag preview, drop, cancel, wrong button, and unmount mid-drag.
- [x] Edit dialog: prefilled, saves trimmed values, asks for a title, delete only after confirming, axe.
- [x] Today: edit through the dialog, search and tag filter with the count and "Show all tasks", keyboard reorder saved and announced.
- [x] E2E: edit, keyboard and drag reorder kept after a reload, filter (passed 3 runs in a row); 22/22 overall.
- [x] Backend 563 passed with floors; frontend 500 passed with the coverage floor; lint, `tsc`, build.
