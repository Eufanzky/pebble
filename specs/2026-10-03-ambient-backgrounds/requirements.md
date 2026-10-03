# 5.2 Ambient backgrounds: requirements

Roadmap item: **5.2** (Phase 5). Branch: `feat/5.2-ambient-backgrounds`.

## Goal

The photo backgrounds rendered poorly (busy behind text, soft on large screens, 1.1 MB to load). Replace them with backgrounds drawn in CSS that feel calm and belong to Pebble.

## Scope

- `AmbientBackground` in `@/shared/ui` with one `mood` per screen; styles in `shared/ui/ambient.css`, tokens only.
- Every page and the sign-in view use it; `ScreenBackground` and `public/backgrounds/` are deleted.
- Tests: the component (decorative, drifting, still); the E2E checks that no page loads a picture, alongside its axe scan.

## Decisions

1. **Three blurred colour fields and a vignette.** Each mood mixes the Pebble colour with tag colours, so changing Pebble's colour in settings changes the room too. The vignette keeps the edges deep and the text area calm.
2. **Motion is slow and transform-only:** 48 to 75 s drifts on the compositor, so it costs nothing to lay out.
3. **Still under reduce motion and calm mode.** Calm mode is about less stimulation, so the drift stops there too (`data-still`), as well as for the OS setting.
4. **It reads preferences, so it lives inside a `PreferencesProvider`.** The sign-in page has no app shell, so `SignInView` renders it inside its own offline provider. The E2E caught the crash when it didn't.
5. **Strength was tuned by eye.** The first pass was too faint to read as anything but black; the fields were raised until the colour shows without touching text contrast (axe passes on every page).
