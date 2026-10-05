# 7.3 An honest activity log: requirements

Roadmap item: **7.3** (Phase 7), the last item fixing A-029. Branch: `fix/7.3-honest-activity-log`.

## Before

The browser wrote about 20 kinds of entries in agents' names for things no agent did. For example:

- **WhyBot** "showed an explanation" when the user opened a "Why?" card.
- **AdaptLens** "changed" the colour, a toggle, the reading level or the step size when the user did.
- **CalmSense** "added a task", "detected distress" (a phrase match in the browser), and "opened a document".
- **PebbleVoice** "completed a focus session" and "passed a comprehension check".
- **SimplifyCore** "uploaded a file" and "extracted tasks".

`POST /api/activity` let any client write an entry in any agent's name.

## Now

- **Only agents write the log, on the server.** The use cases log their own results, as they did, and nothing else writes it.
- **The browser only reads it.** `ActivityLogProvider` has `entries`, `isLoading`, `loadFailed` and `refresh`, and callers refresh after an agent call. `addEntry`, `postActivity` and the "why opened" handler chain are gone.
- **The API only reads it.** `POST /api/activity` is removed, so a POST is a 405. The import of what a browser kept before accounts still brings that old history in, once.
- **The tests enforce it.** The MSW fake has no POST handler, so any future browser write fails the tests: the test server rejects requests it doesn't handle.

## Decisions

1. **The user's own actions aren't logged anywhere for now.** They were only ever logged in an agent's name. AdaptLens (7.6) needs usage signals (reading-level and step-size changes, skipped steps), and it will collect them as signals of its own, not as log entries that claim an agent acted.
2. **Old imported entries stay.** They are the user's history from before accounts, and some were written that way back then. Rewriting history isn't this item's job.
3. **The distress prompt on Today stays.** It's a phrase match in the browser, not an agent, so it no longer claims to be CalmSense.
