# 4.5 Preferences and activity from the API: requirements

Roadmap item: **4.5** (Phase 4). Branch: `feat/4.5-preferences-activity-from-api`.

## Goal

Preferences and the activity log come from the account, like tasks. Whatever a browser kept before accounts existed is moved into the account once.

## Scope

- `PreferencesProvider` on `/api/preferences`, with a device copy for the first paint; `ActivityLogProvider` on `/api/activity`.
- Chat no longer writes its own log entries (the backend does, 4.2); the log reloads after each turn.
- `POST /api/import` (backend) and `useImportLocalData` (app shell) for the one-time move.
- The settings reset writes the defaults to the account. The activity page copy says where the log lives.
- MSW fakes for the account, test helpers, and an E2E for the import.

## Decisions

1. **A device copy of the preferences.** Colour and reduce-motion apply before the server answers (no flash). The account's copy wins when it arrives, except for settings changed on this device since the page loaded.
2. **Only changed fields are saved.** Two devices changing different settings don't undo each other.
3. **The backend logs the agents; the browser logs the user.** Chat turns aren't posted from the browser any more, so the log can't hold an entry the backend didn't see (or hold one twice).
4. **Import through one endpoint, once.** The browser sends everything usable in one request and deletes its copy only after the account has it; a failed import is retried on the next visit. A mark in localStorage stops a second tab sending the same data. Damaged entries are dropped, not fatal.
5. **The account's preferences win over imported ones.** An import only fills an account that never saved any.
6. **Imported log entries keep their times**, capped at now; tasks keep their steps and what was done.
7. **Reset means defaults, not deletion.** The log is the record of what the agents did; deleting data is 4.6.
8. **Changes before the first load are saved, then reloaded,** instead of shown at once, so the first load can't overwrite them (found by a test).
