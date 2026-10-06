# 7.7 BridgeBot: calendar export: requirements

Roadmap item: **7.7** (Phase 7). Branch: `feat/7.7-calendar-export`.

## Goal

A task's plan can go into any calendar app as an `.ics` file.

## What it does

- **"Add to calendar"** on an open task with steps saves `<task-title>.ics`. It holds the open steps one after another, from the next quarter hour, each as long as its estimate ("~25 min", "1 h"; 15 minutes without a number). A toast says when it starts.
- **On the backend,** `GET /api/tasks/{id}/calendar.ics?start=` builds it:
  - `plan()` in the domain does the timing.
  - `ExportPlan` logs it as BridgeBot.
  - `IcsCalendarWriter` writes RFC 5545 with the `icalendar` library: times in UTC, a unique UID and a DTSTAMP per event, and a PRODID.
  - The start must carry its UTC offset (422 otherwise). The browser sends its local time, so the log says the time the user's way.
- **The browser saves the file itself** (`getBlob` and `saveFile`), as "Download my data" does, since the proxy doesn't forward `Content-Disposition`.

## Decisions

1. **Back to back from the next quarter hour, no time picker.** It's one tap, and the user can move the events in their calendar. A picker can come later if it's missed.
2. **Times in UTC.** Every calendar app converts UTC, while time-zone definitions inside the file are a common source of import trouble.
3. **Done steps are left out.** A task with none open is one event of its own.
4. **The manual import into Google Calendar and Outlook is left to a person.** The roadmap asks for it, and I can't use those apps, so the roadmap box stays unticked until someone tries it.
