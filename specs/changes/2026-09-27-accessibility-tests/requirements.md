# 3.6 Accessibility tests: requirements

Roadmap item: **3.6** (Phase 3). Branch: `test/3.6-accessibility`.

## Goal

Axe finds no violations in each feature's main components, and the keyboard paths work: the skip link, focus on navigation, and the modal focus trap.

## Scope

In scope:
- `src/test/a11y.test.tsx`: axe on `TodayView`, `DocumentsView`, `ActivityView`, `SettingsView`, `FocusView` and `PebbleCharacter`, and on the states behind a click (the chat panel with a reply, a task broken down with its explanation, the document modal in both views with the comprehension check, the built-in reader with its tools on, the activity reasoning).
- `app/_shell/AppShell.test.tsx`: the skip link is the first Tab stop and points at a focusable `main`; the current page has `aria-current`; focus moves to the new `h1` after navigating but not on first load; axe on the shell.
- `features/documents/components/DocumentKeyboard.test.tsx`: the modal opens from the keyboard, focuses its first control, wraps Tab both ways, closes on Escape and gives focus back to the card; the reader on top has its own trap and returns focus to the Reader button.
- A setup test that proves axe reports a real violation.

## Decisions

1. **Component-level axe, page-level later.** jsdom can't check colour contrast or layout. 3.7 adds an axe scan per page in a real browser with Playwright.
2. **The interactive states are tested too.** Most accessibility bugs hide behind a click (modals, expanded panels), not in the first render.
3. **No fixes were needed.** The labels, roles and focus handling added in 3.1 to 3.4 already pass.
