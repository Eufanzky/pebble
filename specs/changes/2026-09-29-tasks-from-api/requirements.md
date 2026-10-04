# 4.4 Tasks from the API: requirements

Roadmap item: **4.4** (Phase 4). Branch: `feat/4.4-tasks-from-api`.

## Goal

The tasks feature reads and saves the user's list through `/api/tasks` with TanStack Query, instead of `localStorage`.

## Scope

- `@tanstack/react-query`, a `QueryProvider` in `AppShell` and in the test providers.
- `features/tasks/api/tasks.ts`; `patchJson`, `putJson` and `deleteRequest` in the shared client (a 204 has no body).
- `TasksProvider` on `useQuery` with optimistic, ordered saves; the `useTasks()` API is unchanged apart from new states.
- Today: loading, a failed load (try again), a failed save (the list goes back to what's saved), and an empty list that offers the example tasks.
- Tests: a stateful MSW fake of `/api/tasks`; E2E against Postgres.

## Decisions

1. **Optimistic, one save at a time.** A tick shows at once. Saves go to the server one after another, in the user's order, so "clear and start fresh" (clear, then add) can't be reordered into losing the new task.
2. **Temporary ids.** A new task or step has a `temp-` id until the server answers; later saves use the server's id, and the local task keeps any change made meanwhile. Server replies to toggles aren't applied, because the client uses the same rule as the backend (the last open step finishes a task; unticking never reopens it).
3. **On a failed save, trust the server.** The list reloads and a calm note says the last change wasn't saved. There are no silent retries.
4. **New accounts start empty.** Seeding made-up tasks into a real account isn't honest (principle 6). The empty state offers "Add example tasks", which the user chooses; the E2E flow uses it.
5. **Expanded steps are UI state.** `showSubtasks` isn't saved.
6. **The old `pebble-tasks` key is left alone.** 4.5 imports existing localStorage data into the account once.
7. **The list is fetched once per session** (`staleTime: Infinity`), so a background refetch can't overwrite changes that haven't been saved yet. Reloading the page gets the latest.
