# 3.2 Tasks: requirements

Roadmap item: **3.2** (Phase 3). Branch: `refactor/3.2-tasks-feature`.

## Goal

Split the 540-line `today/page.tsx` into `features/tasks`, so the page only composes, the logic sits in `lib/` and hooks, and each piece is tested.

## Scope

In scope:
- `features/tasks/`:
  - `types.ts`: `Task`, `Subtask`, `TaskTag`, `TaskPriority`, `NewTask` (moved out of `lib/types.ts`)
  - `context/TasksContext.tsx` (moved from `contexts/`) and `data/sampleTasks.ts` (moved from `data/`)
  - `lib/`: `today.ts` (greeting, nudge, hour label, shortest task, split), `distress.ts`, `tags.ts` (`TAG_CONFIG`, `PRIORITY_CONFIG`, `tagLabel`)
  - `hooks/`: `useTaskActions`, `useAddTask`, `useBreakDown`, `useRipple`, `useTodayClock`
  - `components/`: `TodayView`, `TaskList`, `TaskCard`, `SubtaskList`, `WhyCard`, `RoadmapView`, `RoadmapNode`, `ProgressPath`, `TodayGreeting`, `ViewToggle`, `AddTaskForm`, `DistressPrompt`, `UpNextCard`
  - `testing.ts`: `seed()` and `newTask()` for tests
  - `index.ts`: `TasksProvider`, `useTasks`, `TodayView`, the tag config and the types
- `lib/audio.ts` moves to `shared/lib/audio.ts` (Today and Focus both use it).
- `app/today/page.tsx` renders the background and `TodayView`.

Out of scope:
- Changing the copy or behaviour. The 1.4 Today test stays where it was and passes.
- The hard-coded "Adapted for you" ids and sample "why" text (5.1, 5.3).

## Decisions

1. **The context is part of the feature.** `TasksProvider` and `useTasks` are exported from `@/features/tasks`; `AppShell`, the sidebar, settings, documents and chat use that.
2. **Timers live in hooks.** The break-down shimmer and checkbox ripple used bare `setTimeout`s in the component; the hooks now clear them on unmount.
3. **The shimmer is announced.** It's a `role="status"` region labelled "Breaking it down", which also gives tests an accessible handle.
4. **The 1.4 page test stays at `app/today/page.test.tsx`** and renders the real page, so it still pins what the user sees.
