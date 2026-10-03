# 5.3 Responsive shell and mobile navigation: requirements

Roadmap item: **5.3** (Phase 5). Branch: `feat/5.3-responsive-shell`.

## Goal

The app is comfortable on a phone, a tablet and a laptop. Phones had no visible navigation (a hamburger menu over a sliding drawer).

## Scope

- One navigation, three layouts (`_shell/shell.css`): a sidebar from 1100px that collapses to an icon rail (remembered per device), the rail from 768 to 1099px, and a bottom tab bar on phones.
- Safe-area insets (`viewport-fit=cover`), 44px targets for nav links and tabs, the chat button and panel clear of the tab bar and within a 360px screen.
- Page transitions on the motion tokens; an instant swap with reduced motion.
- The shell moves onto the 5.1 tokens; the old layout CSS and the hamburger and overlay are removed.
- E2E at 360, 768 and 1280px for every page: nothing past the right edge, no page-level horizontal scroll, axe at each width. A tab bar test checks position, navigation and target size.

## Decisions

1. **One nav element, laid out by CSS.** Rendering a second nav for phones would duplicate every link for screen readers and tests. Labels are visually hidden on the rail but stay in the accessibility tree.
2. **No View Transitions API.** React's `<ViewTransition>` is still experimental in Next 16, so the existing fade stays, rebuilt on the motion tokens. The roadmap text is updated to match.
3. **Tablets always get the rail.** Content needs the width there; the collapse toggle is for wide screens.
4. **`--app-bottom-inset`** is the one value fixed elements use to keep clear of the tab bar, so later screens don't hard-code it.
5. **Feature layouts stay for 5.4 and 5.7.** This item fixes only what made the shell fail on small screens (the chat panel's fixed 380px width).
