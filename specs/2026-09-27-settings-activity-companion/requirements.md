# 3.4 Settings, activity, and companion: requirements

Roadmap item: **3.4** (Phase 3). Branch: `refactor/3.4-settings-activity-companion`.

## Goal

Finish the move to the feature layout: every page is thin, and the old `components/`, `contexts/`, `hooks/`, `data/` and `lib/` folders are gone. The settings toggles (calm mode, reduce animations) have tests. A-010 is fixed here.

## Scope

In scope:
- `features/companion`: `PebbleContext`, the character, the speech bubble, the seven models (`models/`), the messages, and `lib/` (`moodForCompletion`, `pebbleMessage`).
- `features/activity`: `ActivityLogContext`, `ActivityFeed`, `ActivityView`, `ActivityStats`, and `lib/` (`feedEntries`, `entryTime`, `showMoreLabel`, `activityStats`).
- `features/settings`: `SettingsView`, split into pickers, settings rows and sections, with hooks for preference changes, connected apps, voice input and reset.
- `features/focus`: `FocusView`, split into the ring, table, controls, room list, loading screen and room overlay, with `useFocusTimer` and `useRoomJoin`, and `lib/timer.ts`.
- `shared/`: `preferences/` (context, types, colors), `hooks/` (`useLocalStorage`, `useTimeOfDay`, `useFocusOnNavigation`), `ui/` (`ScreenBackground`, `ToastContext`).
- `app/_shell/`: `AppShell` and `Sidebar`.
- A-010: `reduceMotion` in `usePreferences()`.
- Tests: the settings toggles and screen, every new hook and `lib/` module, `ActivityView`, `PebbleCharacter`, `FocusView`, and the A-010 regression.

Out of scope:
- The simulated settings content (connected apps, voice input, "Pebble has adapted", "This week"): logged as A-020 for a product decision.
- The fake room presence on the focus page (7.1) and the real focus session (7.2).

## Decisions

1. **Preferences live in `shared/preferences/`, not `features/settings`.** Every feature reads them, and the settings screen shows a Pebble preview. Inside `settings`, preferences would make an import cycle: settings → companion → settings.
2. **The app shell lives in `app/_shell/`.** It composes features, so it can't be in `shared/`, and `_shell` is a private folder, not a route.
3. **Character models move to `features/companion/models/`**, next to `components/`, so the `../../` lint rule stays simple.
4. **A-010: one flag for motion.** `usePreferences()` returns `reduceMotion`, which is true when the user's setting or the OS's reduced-motion preference is on. It drives the `<html>` class, and every component uses it. Only the settings toggle reads the stored setting.
5. **Saved preferences are merged over the defaults.** A saved object missing a key (saved before a setting existed, or damaged) used to crash the app. Found while testing reset.
6. **Timers belong to hooks and are cleared on unmount** (focus timer, room join, app sync, voice demo). The focus timer completes outside a state updater, so `onComplete` runs exactly once.
7. **Small behaviour changes:** the voice-input mic shows whenever voice input is on (it used to show only right after turning it on). The pickers and chunk sizes expose `aria-pressed`, colour swatches have names, and the timer has a `timer` role. The activity page's note no longer credits Microsoft Foundry (A-021).
