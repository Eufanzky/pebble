# 5.7 The other screens: requirements

Roadmap item: **5.7** (Phase 5). Branch: `feat/5.7-other-screens`.

## Goal

Documents, Activity, Focus, Settings and sign-in look like the redesigned Today: on the design system and the new backgrounds, comfortable at every width.

## Scope

- `Screen` and `ScreenHeader` in `@/shared/ui`: a content column, a sentence-case title, one lead line, a small Pebble beside it (its speech bubble hides on phones). Route wrappers lose their own padding.
- The older `glass-card` becomes the same surface as `Card` (tone and hairline, no blur or shadow), which moves every remaining card over at once.
- Documents: cards and the upload zone on tokens; the CSS-drawn page icon (until now calm mode only) for everyone; tags as chips.
- Activity: an honest summary sentence instead of the three tiles; one Pebble, not two; filters on tokens.
- Focus: the time once, inside a larger ring, in the display font; buttons are primitives ("Start focus session").
- Settings: the header; the reset as a ghost `Button`; the account section inside the same column.
- Everywhere: no monospace (JetBrains Mono no longer loads; numbers use tabular figures) and no forced capitals.

## Decisions

1. **The Activity tiles were wrong, so they go.** "Decisions made… today" counted every entry ever, and "Safety checks… all passed" showed even when some were held back. A sentence says what's true: "10 entries from 2 agents. 9 passed the safety checks, and 1 was held back."
2. **One Pebble per screen.** The empty activity log no longer adds a second one.
3. **The upload zone is reachable by keyboard.** Its file input was `display: none`; it's now visually hidden but focusable, with a focus ring on the zone.
4. **Pebble's words stay on wide screens and hide on phones**, so the content starts near the top.
5. **The reader's inner layout isn't redesigned here.** It's a full-screen tool with its own toolbar; it gets the token surfaces through `glass-card` and loses monospace and capitals, but a reader redesign would be its own item.
