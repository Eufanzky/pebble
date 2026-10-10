# 9.2 Focus session: plan

1. `useFocusTimer`: `stop()` resets and returns the seconds focused; fake-timer tests.
2. `lib/timer.ts`: `minutesFocused` and the stop message; tests.
3. `FocusView` takes `taskId` and `stepId` (from the page's `searchParams`), shows the step, Pebble in the card, Stop, and "Mark this step done"; component tests for stopping early and for the step.
4. `StepList`: the "Focus" link on open steps; tests.
5. E2E (`focus.spec.ts`): start focus from a step, stop early, mark it done. Axe on Focus with a step; docs, PR.
