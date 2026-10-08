# 8.2 Cumulative progress: requirements

Roadmap item: **8.2** (Phase 8). Branch: `feat/8.2-cumulative-progress`.

## Goal

Today and Activity show what the user has finished, from the 5.6 stats, and the number never goes down.

## Which count

The roadmap's example is "14 steps finished this month". A month, or the last 30 days, drops old days: the number would go down after a quiet stretch, or reset on the 1st. That is the "anything that resets" principle 1 bans. So these screens show the **all-time** totals, the ones `/stats` already shows as "Since you started", and only those:

> Since you started: 14 steps, 3 tasks and 50 minutes of focus.

`/stats` keeps its labelled ranges ("In the last 7 days"), where a range is what the user picked.

## Behaviour

- `ProgressSoFar` (stats feature) reads `GET /api/stats` (`allTime`) and writes the sentence with `allTimeSentence`.
- It shows nothing until something is finished, and nothing if the stats can't load. It never shows a zero, and it never shows an error on a screen that isn't about stats.
- Today shows it under the greeting; Activity under the log's summary.
- Ticking a task or a step refreshes it as soon as the save is through. Unticking doesn't, since it can't change the count.

## Structure

The stats feature imports tasks (tag colours), so tasks can't import stats. The routes pass `<ProgressSoFar />` into `TodayView` and `ActivityView` as a `progress` slot, and `STATS_KEY` moves to `shared/lib/query.tsx` so the tasks context can refresh it.

## Tests

- Domain: a year of visits with gaps from 0 to 120 days, some finishing nothing. The all-time totals never go down at any visit, even as finished work leaves the range.
- Component: the sentence, nothing before the first finished thing, nothing on a load failure; Today refreshes it after a tick; Activity shows it.
