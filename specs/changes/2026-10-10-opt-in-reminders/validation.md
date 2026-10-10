# 8.6 Opt-in reminders: validation

- [x] Nothing notifies unless turned on: `useReminder.test.tsx` lets a whole day pass with the defaults (no toast, no notification, no permission asked); with a time but no notifications there's a toast only; with notifications allowed there's one notification; with the browser saying no, none; opening Pebble late shows nothing; two tabs show it once.
- [x] `schedule.test.ts` (fixed clock: the window, once a day, no time, a bad time).
- [x] `ReminderSettings.test.tsx`: off by default with no permission asked; a time saves; emptying it turns both off; permission is asked only on the switch; the browser saying no leaves it off, with a gentle note.
- [x] Backend: defaults, HH:MM only (422 otherwise), damaged saved values fall back to off.
- [x] Guilt scan with its two justified exceptions; axe on Settings with a reminder set.
- [x] Frontend lint, knip, `tsc --noEmit`, `npm test` (761); backend ruff, vulture, pytest; E2E 31 of 31.
