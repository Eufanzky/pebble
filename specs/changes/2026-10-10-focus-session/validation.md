# 9.2 Focus session: validation

- [x] Timer hook with fake timers (`useFocusTimer.test.ts`): `stop()` returns the seconds focused, resets, and never calls `onComplete`, while running or paused.
- [x] `timer.test.ts`: `minutesFocused`, and `stoppedMessage` never compares with 25 minutes.
- [x] Stopping early with no penalty (`FocusView.test.tsx`): the whole minutes count towards stats, under a minute saves nothing and says so kindly, no chime, and no "only", "gave up" or "of 25" in the card.
- [x] A session on one step: the step and task are shown; "Mark this step done" appears only after a finished or stopped session and ticks the step only when pressed; a missing step is a gentle note and the timer still works.
- [x] `TaskCard.test.tsx`: open steps link to `/focus?task=…&step=…`; done steps and unsaved (`temp-`) ones don't.
- [x] Reduce-animations: Pebble in the card uses the character's `no-motion`, and the ring's transition is off (unchanged from 5.7).
- [x] Axe on Focus with a step after stopping; E2E `focus.spec.ts` starts focus from a step, stops early and marks the step done.
- [x] Frontend lint, knip, `tsc --noEmit`, `npm test` (780); E2E 32 of 32 (with `next build`).
