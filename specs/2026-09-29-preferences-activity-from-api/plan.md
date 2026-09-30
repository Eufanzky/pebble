# 4.5 Preferences and activity from the API: plan

1. Backend: `ImportLocalData`, `POST /api/import`, step completion on create; tests.
2. `PreferencesProvider` with the device copy and change tracking; `ActivityLogProvider` on the API; chat stops logging.
3. The import (pure reader + hook in the shell).
4. MSW account fakes and helpers; move existing tests; new tests for sync rules, the log and the import.
5. E2E: fresh account per test, preferences through the API, an import test. Docs; roadmap tick.
