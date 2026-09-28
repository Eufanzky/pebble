# 7.1 Remove rooms: requirements

Roadmap item: **7.1** (Phase 7), done early at the user's request ("remove fake things"). Branch: `refactor/7.1-remove-rooms`.

## Goal

No fake presence: the focus page loses the multi-user rooms, the made-up people and the participant counts (principle 6, and "never with fake numbers" in `mission.md`).

## Scope

- Removed: the four sample rooms with named people, the "cozy library" table with "3 people focusing", the join loading screen, the room overlay, `useRoomJoin`, the room CSS, and `seatPosition`.
- The focus page is the 25-minute timer with Pebble. Its copy no longer mentions a room or others.
- README and CLAUDE.md describe the page as it is.

## Decisions

1. **The timer stays as is.** 7.2 ties it to a task step and adds its own tests.
2. **The sample meeting document keeps its "Study Room" line.** It's the content of a sample transcript, not a claim about the app.
