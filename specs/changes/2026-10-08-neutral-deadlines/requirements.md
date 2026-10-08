# 8.3 Neutral deadlines: requirements

Roadmap item: **8.3** (Phase 8). Branch: `feat/8.3-neutral-deadlines`.

## Goal

A task can have a due day. Time left shows as a calm bar, and near the day Pebble offers to make the task smaller with CalmSense. Nothing about it is red or alarming (principle 1: "visible time, shown neutrally"; "near a deadline, an offer to make the task smaller").

## The due day

- Optional, a calendar day (`due`, YYYY-MM-DD), set or cleared in the edit dialog ("Due day", "Optional. Leave it empty for no due day.").
- The backend also keeps `dueSetAt`, when the day was chosen, so the bar has a start. A new day restarts it; saving the same day changes nothing; clearing the day clears both. `{"due": null}` in a PATCH clears it. Migration 0008 adds the two columns.

## The bar (`lib/deadline.ts`)

- It runs from `dueSetAt` to the end of the due day, in the user's calendar, and starts full. It empties evenly, one quiet tone the whole way, and refreshes every minute.
- The label counts calendar days between local midnights, so a clock change doesn't shift them: "5 days left", "Due tomorrow", "Due today".
- Once the day is over there is no bar, only "Still open". It never counts days since. 8.4 adds the choices.
- It's a `meter` named "Time left", with the label as its value text.
- A finished task, or one without a due day, shows nothing.

## The offer

- Due today or tomorrow, an open task without steps shows "Want CalmSense to make this one smaller?" with "Make it smaller" and "Not now". It replaces "Break it down" while it's shown; "Not now" brings that button back.
- A task CalmSense already broke down gets no offer.

## Out of scope

- What happens after the day ("move it, make it smaller, or let it go") is 8.4.
- Setting a due day when adding a task: it's in the edit dialog only.
