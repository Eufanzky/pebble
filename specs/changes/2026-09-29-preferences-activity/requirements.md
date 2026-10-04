# 4.2 Preferences and activity: requirements

Roadmap item: **4.2** (Phase 4). Branch: `feat/4.2-preferences-activity`.

## Goal

Preferences and the activity log get repositories and endpoints, and the agent pipeline writes its own activity entries server-side, so every AI action is explainable without trusting the browser.

## Scope

- Domain: `Preferences` (defaults as in the frontend, tolerant `from_saved`), `ActivityEntry`, `SafetyStatus`; `ChatReply.safety`.
- Ports and use cases: `PreferencesRepository` + `UserPreferences`; `ActivityRepository` + `ActivityLog` (`record`, `note`, `recent`); `PersistenceError` moves to `ports/persistence.py`.
- Postgres: `preferences` (one JSONB row per user) and `activity_entries`, migration `0002`.
- API: `GET/PATCH /api/preferences`, `GET/POST /api/activity`.
- Pipeline: `HandleChat`, `DecomposeTask`, `SimplifyDocument` and `Encourage` write an entry per result for the calling user, and a `flagged` entry when input or a reply is held back.

## Decisions

1. **Preferences are JSON, not columns.** Only saved values are stored and `from_saved` merges them over the defaults (the frontend already does this), so adding a preference needs no migration and a damaged value can't break an account.
2. **The log never costs the user an answer.** The pipeline uses `note`, which skips (with a warning) when the database is down or not configured. `POST /api/activity` uses `record` and reports a 503.
3. **Held-back text is never logged.** A flagged entry says what was held back and which check did it, not the text. Other entries hold redacted text, shortened to 50 characters.
4. **A chat message held back before classification is logged under PebbleVoice.** No route exists yet; that's the agent that answers.
5. **The server sets the time** of every entry, including those posted by the frontend.
6. **The frontend can post entries** for the user's own actions (finishing a task, changing a setting), which the frontend already logs. Once 4.5 moves the log to the API, the frontend stops logging chat turns itself.
7. **WhyBot explanations are 5.1.** The reasoning today is the agent's own `whyExplanation` or a short route description.
