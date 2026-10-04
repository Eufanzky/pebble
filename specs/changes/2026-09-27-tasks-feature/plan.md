# 3.2 Tasks: plan

1. Move `TasksContext`, the sample tasks, the Today components and the task types into `features/tasks`; move `audio.ts` to `shared/lib`.
2. Pull the greeting, nudge, distress check and tag labels into `lib/`; the page's handlers into `useTaskActions` and `useAddTask`; the card's timers into `useBreakDown` and `useRipple`; the clock into `useTodayClock`.
3. Split the page into `TodayView` and its pieces; split `RoadmapView`; make the page thin.
4. Point every import at `@/features/tasks`; update the guilt-scan file list.
5. Add unit tests for `lib/` and every hook, and component tests for `TaskCard`, `WhyCard` and `TodayView`.
6. Run lint, typecheck, tests and the build; load `/today` from `next start`.
7. Update CLAUDE.md and the README; tick 3.2.
