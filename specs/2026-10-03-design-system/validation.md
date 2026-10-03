# 5.1 Design system: validation

- [x] Component tests for each primitive: button type and busy state, icon button label, card element and tone, field labelling, hint and note, chip label vs toggle, dialog naming, focus, Escape, close button, outside click and focus return.
- [x] axe finds nothing in the primitives or the preview page.
- [x] No colour literals in `shared/ui` outside `tokens.css` (scan test).
- [x] `/design-system` checked at 1280 and 390 px; the sheet rises from the bottom on a phone; it is a 404 in production builds.
- [x] `npm test` (463) with the coverage floor, lint, `tsc --noEmit`, build.
