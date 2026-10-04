# 5.1 Design system: requirements

Roadmap item: **5.1** (Phase 5, the redesign). Branch: `feat/5.1-design-system`.

## Goal

One set of tokens and primitives that every redesigned screen (5.2 to 5.8) is built from, so the app looks like one thing and stays accessible.

## Scope

- `shared/ui/tokens.css`: colour, type, space, radius, elevation, motion, touch target.
- `shared/ui/primitives.css` and the primitives in `@/shared/ui`: `Button`, `IconButton`, `Card`, `Field`, `Chip`, `Dialog` (with a bottom-sheet variant).
- A dev-only `/design-system` page showing all of them.
- Tests: behaviour and axe for each primitive, and a scan that keeps colour literals out of `shared/ui`.

## Design direction

The product rules fix a lot: dark only on `#0F0D0A`, the user's Pebble colour as the accent, Baloo 2 and Nunito, calm motion, no red. Within that:

- **Colour:** warm cream at three strengths (4%, 7%, 11%) for surfaces, a hairline for edges, cream text at three strengths, the Pebble colour as the only accent, and the four tag colours.
- **Type:** Baloo 2 700 for headings only, Nunito for everything else, on a 1.25 scale from 16px. Body line height 1.55, headings 1.15.
- **Layout:** a 4px space grid. The radius grows with the size of the thing (8 chips, 14 fields, 22 cards, 28 sheets; buttons are pills).
- **Principles:** surfaces are separated by tone and a hairline, not drop shadows (only floating dialogs get one); one easing, `--ease-settle`, for everything, and every duration is 0 under reduced motion; 44px touch targets; no monospace or all-caps labels, so tags become sentence-case chips with a colour dot.

Reviewed against the usual defaults: a uniform card kit with grey shadows and caps eyebrows is what the current screens drift towards, so the plan drops all three. The memorable element is left to Pebble and the ambient background (5.2), so the primitives stay quiet.

## Decisions

1. **Plain CSS with custom properties**, like the rest of the app (`TaskCard.css`), loaded once from `globals.css`. Tailwind stays for layout utilities.
2. **Old tokens stay for now.** `--bg-surface`, `--accent-*` and friends keep working until 5.4 and 5.7 move their screens over. `ScreenBackground` and `ToastContext` are listed as legacy in the colour scan.
3. **`Dialog` renders only while open**, so `useFocusTrap` gives focus back on unmount, as the existing modals do.
4. **Field notes guide, never blame** ("Give it a few words."), and use the amber tag colour for the edge, never red.
