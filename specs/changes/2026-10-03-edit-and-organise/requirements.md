# 5.5 Edit and organise tasks: requirements

Roadmap item: **5.5** (Phase 5). Branch: `feat/5.5-edit-and-organise`.

## Goal

Users can fix a task, remove one, put the list in their own order, and find a task in a long list.

## Scope

- Backend: a `position` per task (migration 0003, backfilled in the order tasks were added), new tasks last, the list in position order, `Tasks.reorder` and `PUT /api/tasks/order`.
- Frontend: `editTask`, `deleteTask` and `reorderTasks` in `TasksContext` (optimistic, through the save queue); an edit sheet with a delete confirmation; a move handle (keyboard and drag) and an edit button on each open card; search and a tag filter.
- Tests at every layer, and an E2E step: edit, reorder by keyboard and by drag, reload, filter.

## Decisions

1. **The order covers the whole list.** `PUT /api/tasks/order` takes every task id exactly once, so a stale page can't silently drop or duplicate anything; anything else is a 409 and nothing moves. Someone else's id is treated the same way (no leak).
2. **Only open tasks are dragged;** done tasks keep their order after them.
3. **A filtered list can't be reordered.** Moving within a partial view is ambiguous, so the handles hide while a filter is on.
4. **Keyboard first.** The handle moves with the arrow keys, Home and End, and a live region says where the task went. Dragging uses pointer events (mouse, pen, touch; `touch-action: none` on the handle).
5. **Drags follow the window, not the handle.** Moving the card in the DOM to preview the order makes the browser drop pointer capture (found with the E2E).
6. **Delete asks first.** "Keep it" is the primary button, and the copy says plainly that it can't be undone, with no alarm styling.
7. **Dialogs render on `<body>`.** The edit sheet sat under the phone tab bar because the page wrapper is its own stacking context; a portal fixes it for every dialog.
8. **Delete and edit aren't logged as agent actions.** They're the user's own changes; the activity log is about what the agents did.
