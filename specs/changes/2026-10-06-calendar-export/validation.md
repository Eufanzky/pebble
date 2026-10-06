# 7.7 BridgeBot: calendar export: validation

- [x] The `.ics` output passes a parser (`icalendar`, in the tests): VERSION, PRODID, one VEVENT per step with unique UIDs, DTSTAMP, DTSTART/DTEND in UTC. Titles with commas, semicolons, line breaks and emoji come back unchanged.
- [x] A second, independent parser (`vobject`, run once on a real export) reads it and its `validate()` passes.
- [x] API: the steps back to back from a `+02:00` start, written in UTC; BridgeBot logged; a start without an offset is a 422; another user's task is a 404.
- [x] Frontend: the helpers (next quarter hour, local ISO with offset, file names), the export (file saved, start sent, toast; a gentle failure), and the button only on open tasks with steps. 610 tests, lint, knip, `tsc`.
- [x] Backend: 705 tests with Postgres, coverage 99.6%, ruff, vulture.
- [x] E2E 29/29. The new spec downloads the file through the real backend: `write-the-report.ics`, three VEVENTs.
- [ ] **A manual import into Google Calendar and Outlook.** Not done: it needs a person with those apps. The roadmap box stays unticked until then.
