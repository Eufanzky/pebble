# 1.4 Frontend characterization tests: requirements

Roadmap item: **1.4 Frontend characterization tests** (Phase 1). Branch: `test/1.4-frontend-characterization`.

## Goal

Pin how the frontend behaves today, so phase 3 can move the contexts, the chat and the Today page into `features/` without changing what the user sees.

## Scope

In scope:
- `TasksContext` and `PebbleContext`: mood derived from the completion percentage (every threshold, the empty list), the 2-second excited flash on completing a task, its restart, and no flash on uncheck.
- `PreferencesContext` DOM effects: the `reduce-animations` class on `<html>`, the `--pebble-color` / `--pebble-dark` variables for every colour, and saving to localStorage.
- `PebbleChat`: the reply with its agent name, the request body, the activity log entry, the loading state, and the error state for a 500 and for an unreachable backend (MSW).
- Toggling a task step: in `TasksContext`, and on the rendered Today page (break down, check, uncheck, last step completes the task).
- Shared MSW chat handlers in `src/test/msw/handlers.ts`.

Out of scope:
- Changing app code. The item is done when the tests pass on the current, untouched code.
- The guilt scan (1.5), CI (1.6), fixing the bugs the tests find (1.7), accessibility tests (3.6).

## Decisions

1. **Test through the public hooks and rendered pages**, not internal helpers, so the tests survive phase 3. The step-toggle test renders the whole Today page, which 3.2 splits up.
2. **Each test sets the state it depends on.** `useLocalStorage` caches values at module level, so tests replace the task list (`clearAll` + `addTask`) and set the preferences they need instead of relying on sample data.
3. **Bugs are pinned, not fixed.** The chat shows the raw error text (`Chat request failed (500): {"detail":…}`, `Failed to fetch`) instead of a gentle message. It's logged as A-014 for 1.7, and the test says so.
4. **Setup additions.** `Element.prototype.scrollIntoView` is stubbed in `src/test/setup.ts` because jsdom has no layout. `chatHandlers` (`reply`, `status`, `networkError`) and `chatReply()` are shared, and a successful chat reply is a default handler.
