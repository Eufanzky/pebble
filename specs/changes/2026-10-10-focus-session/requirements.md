# 9.2 Focus session: requirements

Roadmap item: **9.2** (Phase 9). Branch: `feat/9.2-focus-session`.

## Goal

A 25-minute focus session can be tied to one step of a task, with Pebble working beside you. Stopping early is fine and is never held against the user (principle 1).

## Starting from a step

- On Today, each open step of a shown breakdown has a "Focus" link (named `Focus on "<step>"`), which opens `/focus?task=<id>&step=<id>`. A step still being saved (a `temp-` id) has none yet.
- `/focus` without a step is the plain timer, as before.
- With a step, the focus card says what it's for: "Working on: <step>" and, below, the task's title. If that step isn't there any more (deleted, or a stale link), Focus says so gently and works as the plain timer.

## Pebble beside you

- Pebble sits in the focus card next to the timer, happy while the timer runs. It follows reduce-animations (the character's `no-motion`), and the ring doesn't animate either.

## Stopping early

- While running or paused there's a "Stop" button next to Pause or Resume.
- Stopping ends the session and resets the timer. The whole minutes focused (at least 1) count towards progress like a finished session (`POST /api/stats/focus`), and Pebble says "You focused for N minutes. That counts." Under a minute, it says "Stopped. Come back whenever you like." Nothing compares it with 25 minutes, and nothing is called given up or incomplete (the guilt scan's `stopping-early` rule).

## After a session

- After a finished or stopped session tied to a step that is still open, Focus offers "Mark this step done" (never automatic) and a link back to Today. Marking it ticks the step the same way Today does (the last step finishes the task).

## Out of scope

- Breaks, custom lengths and sessions that run while Pebble is closed.
