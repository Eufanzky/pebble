# 7.7 BridgeBot: calendar export: plan

1. Domain: `minutes_of`, `plan`; the `CalendarWriter` port; `ExportPlan`; `IcsCalendarWriter`; the route.
2. Tests: estimates and planning; the file parsed back (structure, UTC, awkward titles); the API (times from an offset, BridgeBot logged, 422, 404).
3. Frontend: `getBlob`, `saveFile` (shared with the data download), `nextQuarterHour`, `localIso`, `calendarFileName`, `useCalendarExport`, the button; the MSW fake; tests; an E2E download.
4. A second parser on a real export; docs; PR.
