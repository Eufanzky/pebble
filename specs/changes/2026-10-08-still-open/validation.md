# 8.4 "Still open" flow: validation

- [x] Domain: let go and take back; a finished task isn't let go.
- [x] Use case: all three choices with a fixed clock (`test_the_three_still_open_choices`); a finished task is `TaskFinishedError`.
- [x] API: let go, keep, reorder without it, take back where it was; 409 for a finished task; 404 for an unknown one; another user gets a 404 for both endpoints. Postgres and the fake agree on list, reorder and take-back (`tests/integration`).
- [x] Components, fixed clock: the choices and their wording, two for a task with steps, focus on "Move it"; on Today: tomorrow, next week, no due day, make it smaller, let it go and undo, against the fake server.
- [x] axe: the bar, the offer and the choices open.
- [x] E2E (`deadlines.spec.ts`): moved to next week; let go, still gone after a reload. The full suite passed 31 of 31.
- [x] Frontend lint, knip, `tsc --noEmit`, `npm test` (716); backend ruff, vulture, pytest with Postgres (745).
