# 8.5 Welcome back: requirements

Roadmap item: **8.5** (Phase 8). Branch: `feat/8.5-welcome-back`.

## Goal

After time away, Today opens fresh with "Want to pick one small thing?" and never mentions how long the user was gone (principle 1: "Coming back is a fresh start").

## Behaviour

- **Time away:** the last visit ended before yesterday, in the user's calendar (`isComingBack`, counted between local midnights). A first visit, or yesterday, greets as usual.
- **Opening fresh:** the greeting keeps its time of day ("Good morning"), and its line becomes "Want to pick one small thing?", whatever is done or open. The nudge beside Pebble says "Start wherever you like. One small thing is enough." instead of counting what's open.
- **Nothing says how long:** only a yes or no ever comes out of `isComingBack`, so no copy can name the gap. The guilt scan also catches "after 6 days" and "3 weeks ago".

## The visit

- It's kept on this device (`pebble-last-visit`): it's a greeting, not account data.
- It's written when the tab is hidden or closed, so the fresh start lasts the whole visit, across screens. A tab left open for days opens fresh when it comes back into view.
- It isn't written on unmount, because React runs cleanups twice in development and the fresh start would end at once.
- If storage is blocked, Today just greets as usual.
