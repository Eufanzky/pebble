# 3.2 Tasks: validation

- [x] `app/today/page.tsx` is 13 lines. The largest component in the feature is 162 lines.
- [x] The 1.4 Today and TasksContext tests pass (moved, imports updated only).
- [x] Every hook has unit tests: `useTaskActions`, `useAddTask`, `useBreakDown`, `useRipple` (fake timers), `useTodayClock` (fixed clock).
- [x] `TaskCard`, `WhyCard` and `TodayView` have component tests.
- [x] `npm test` (186 passed), lint, `tsc --noEmit` and `npm run build` pass.
- [x] `next start` serves `/today` with the heading, "up next" and the task field.
