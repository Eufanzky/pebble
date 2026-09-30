# 4.5 Preferences and activity from the API: validation

- [x] Preferences load from the account; a change made here wins over an older copy arriving later; only changed fields are sent; a failed save puts the setting back; the sign-in page never calls the API.
- [x] The log loads from the account with real dates; entries show at once and are saved; it reloads after a chat turn instead of posting one.
- [x] Import: tasks (with steps), preferences and the log are sent once and the browser's copy is deleted; kept for a retry when it fails; damaged data dropped; a second tab doesn't send it again. Backend: preferences only fill an empty account; entry times are kept and capped at now.
- [x] E2E: each test on a fresh account; old browser tasks appear in the account after a reload, once. 9/9 locally.
- [x] `npm test` (434, three runs), coverage floor, lint, `tsc --noEmit`, build; backend `pytest` (522), floors, `ruff check`.
