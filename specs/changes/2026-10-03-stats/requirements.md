# 5.6 Stats: requirements

Roadmap item: **5.6** (Phase 5). Branch: `feat/5.6-stats`.

## Goal

A stats page with progress that only adds up: steps and tasks finished, focus minutes, and finished tasks per tag, over a week and a month. No streaks, no "missed" days, no comparisons (principle 1).

## Scope

- Backend: `ProgressEvent` (domain), `summarize` per local day and tag with all-time totals; `ProgressLog` (`Tasks` notes finishes; focus sessions), `ProgressStats`; `progress_events` table (migration 0004); `GET /api/stats` and `POST /api/stats/focus`.
- Frontend: the `stats` feature (`/stats`, a nav item), the focus page reporting its minutes.
- Tests at every layer, including "counts never go down across gaps of days", and E2E.

## Decisions

1. **Events, not a count over tasks.** Tasks have no completion time, and counting `completed` would drop when a task is unticked or deleted. A progress event is written the first time each task or step is finished, and for each focus session, and is never removed. Unique per user, kind and item, so unticking and ticking again doesn't count twice.
2. **Days are the user's.** The frontend sends its IANA time zone; the server buckets events by local date. An unknown zone is a 422.
3. **Rolling ranges** (the last 7 or 30 days, today included), not calendar weeks, so "this week" never starts empty on a Monday.
4. **The headline is a sentence, not stat tiles.** "In the last 7 days you finished 12 steps and 4 tasks, and focused for 1 hour 15 minutes." A quiet range doesn't show zeros: "What you finish will add up here. One small step is enough to start."
5. **Charts follow the dataviz rules.** One measure at a time (no dual axis), one hue (the Pebble colour), columns at most 24px with 4px rounded ends, recessive gridlines, a hover and keyboard tooltip, a table view. Quiet days are empty slots, never marked.
6. **Tags are named, not coloured, in the chart.** The validator fails the four tag colours as a categorical palette (coral and amber ΔE 11 for normal vision; sage and coral ΔE 4.9 for deuteranopes). Bars share one hue and each row carries the tag chip and the count.
7. **A progress note that can't be saved never costs the change itself** (logged as a warning, like the activity log).
8. **Account export and deletion cover the new table automatically** (4.6's metadata walk); the integration test now fills it too.
