# 7.1 CalmSense on Today: requirements

Roadmap item: **7.1** (Phase 7), the first of three items that wire the working agents into the screens that credit them (A-029). Branch: `feat/7.1-calmsense-on-today`.

## Before

- "Break it down" appeared only on tasks that already had steps, which meant the example tasks. It played a 1.5 s animation and revealed those steps, then logged "SimplifyCore: Broke down…" from the browser. A task the user typed could never be broken down.
- Chat showed CalmSense's reply text, but dropped its steps.

## Now

- **Today:** an open task without steps offers "Break it down". It asks CalmSense through `POST /api/tasks/{id}/breakdown`. While the request runs, and only then, the card says "CalmSense is breaking it down…" (with moving bars unless motion is reduced). The steps and CalmSense's "why" are saved and shown. If CalmSense can't answer, the card says so gently and nothing changes.
- **Steps:** a task that already has steps (an example, or one broken down earlier) has a plain "Show steps / Hide steps" toggle.
- **Chat:** a CalmSense reply lists its steps and offers "Add to Today". The task is named by CalmSense's new short `title`, or by the question if there is none, and can be added once.
- **The activity log:** the backend logs the breakdown as CalmSense, with its reasoning. The browser's fake entry is gone.

## Decisions

1. **The server picks the step size.** `BreakDownTask` reads the saved preferences, so the browser can't send a stale one; the browser sends only its time of day.
2. **Nothing is saved unless CalmSense answers.** Screening, the LLM call and parsing all happen before the save. A held-back title is a 422, and an outage or an unusable reply is a 503.
3. **A breakdown waits for earlier saves**, so a task added a moment ago is broken down by its server id. A failed breakdown is the card's own gentle note, not the list's "couldn't save" banner.
4. **CalmSense returns a `title`** for chat, where the message ("Help me break down writing my essay") isn't a task name. It's safety-checked and redacted like the steps. The prompt changed, so the evals ran.
5. **The examples keep their steps and hard-coded "why".** 7.4 (WhyBot) replaces the hard-coded texts.
