# 8.4 "Still open" flow: requirements

Roadmap item: **8.4** (Phase 8). Branch: `feat/8.4-still-open`.

## Goal

A task whose due day is over is "still open", never late, and offers three choices: move it, make it smaller, or let it go. Letting go is a fine outcome (principle 1).

## The choices

Once the due day is over, the card shows a "Still open" group in place of the time-left bar:

> Still open. Move it, make it smaller, or let it go?

- **Move it:** "Tomorrow", "Next week", "No due day" (and "Back"). A new day restarts the bar (8.3). Focus moves to the days, and back to "Move it" on "Back".
- **Make it smaller:** CalmSense's breakdown, as "Break it down" does. It's only offered for a task without steps. A task with steps reads "Move it, or let it go?".
- **Let it go:** the task leaves the list, and a toast says "You let "Essay" go. Letting go is fine." with "Undo", which puts it back where it was.

Nothing on the card counts days since the due day.

## Letting go, and "logs it neutrally"

The activity log holds only what an agent did (7.3), so letting go isn't an activity entry. The record is the task itself. It's kept with `letGoAt` (when), it's in the account's data download, and it's deleted with the account. Nothing shows it as a loss.

- `POST /api/tasks/{id}/let-go` sets `letGoAt`. A finished task is a 409, because it's done rather than let go.
- `DELETE /api/tasks/{id}/let-go` takes it back.
- The list and reorder skip a task that was let go. It keeps its position, so one taken back returns where it was. Migration 0009 adds `let_go_at`.

## Out of scope

- A place to see tasks that were let go, besides the data download.
