# 3.4 Settings, activity, and companion: validation

- [x] Every page in `src/app/*/page.tsx` is 13 lines. `src/components`, `contexts`, `hooks`, `data` and `lib` are gone.
- [x] Settings toggles: reduce animations sets `aria-checked`, the `<html>` class and a log entry, both ways; calm mode removes emoji from the screen; voice input shows the mic.
- [x] A-010: `reduceMotion` follows the OS setting, the user's setting, both off, and a browser without `matchMedia`.
- [x] Every new hook has tests: `usePreferenceActions`, `useConnectedApps`, `useVoiceInputDemo`, `useResetPreferences`, `useFocusTimer`, `useRoomJoin` (fake timers where they wait).
- [x] `npm test` (356 passed), lint, `tsc --noEmit` and `npm run build` pass.
- [x] `next start` serves `/today`, `/documents`, `/activity`, `/focus` and `/settings`.
