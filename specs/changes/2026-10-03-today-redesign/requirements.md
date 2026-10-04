# 5.4 Today, redesigned: requirements

Roadmap item: **5.4** (Phase 5). Branch: `feat/5.4-today-redesign`.

## Goal

A clearer, calmer Today on the design system (5.1) that works as well on a phone as on a laptop.

## Scope

- Greeting with Pebble beside it; Pebble, its speech bubble and the nudge get their own column from 1240px.
- "Up next" is the screen's one primary action: a raised card with "Mark as done" (named after the task for screen readers).
- `TaskList` groups "To do" and "Done today" as labelled regions with counts; the add field sits between them.
- Task cards on tokens: a 44px check around a 24px circle, a tag `Chip` (no emoji, no capitals), the estimate, the step count once broken down, and the priority as screen-reader text plus a small dot. "Break it down" moves under the meta on cards narrower than 520px (container query).
- Calm motion when finishing: the check fills, the title is struck through, the card settles. None with reduced motion.
- The old Today layout CSS and the route's extra padding are removed.

## Decisions

1. **"Start this one" becomes "Mark as done".** The button always ticked the task off; the label now says so. A real "start" (a focus session on the task) is 8.2.
2. **Tags lose their emoji in the list.** The colour dot carries the tag at a glance, and calm mode no longer changes how tags look. The roadmap view keeps its labels for now (5.7).
3. **Sentence case.** "Up next" and "Done today" instead of capitals.
4. **The priority isn't only a colour.** The dot is decorative; "Medium priority" is read out.
5. **Each card is an `article` named by its title**, so screen-reader users can move from task to task.
6. **Copy found along the way goes to the audit** (A-023, the "0 things" message), not into this item.
