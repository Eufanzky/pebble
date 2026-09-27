# 1.7 Runtime bugs: requirements

Roadmap item: **1.7 Runtime bugs** (Phase 1). Branch: `fix/1.7-runtime-bugs`.

## Goal

Fix the broken flows from the audit that later phases won't rewrite, each with a regression test that failed first. At the end, every open audit item is linked to the phase that fixes or removes it.

## Scope

In scope:
- **A-011:** in calm mode, `stripEmoji` misses emoji outside its hand-listed ranges (⭐, ⏰, ⌛, ⬆️, flags).
- **A-014:** the chat shows the raw error (`Chat request failed (500): {...}`, `Failed to fetch`) instead of a gentle message.
- **A-016** (found here): calm mode doesn't apply to chat replies.
- Logging **A-017** (cosmetic, the chat button's mouth) for 3.1.

Out of scope:
- Audit items that are already linked to a later phase: A-002 (3.3), A-008 (2.7), A-010 (3.4), A-012 and A-013 (2.4), A-015 (6.1).
- The deferred manual page walkthrough from 0.1. `npm run build` prerenders every route, and the 1.4 tests cover the core flows.

## Decisions

1. **`stripEmoji` matches by Unicode property.** It matches `\p{Emoji_Presentation}`, `\p{Extended_Pictographic}` followed by U+FE0F, and `\p{Regional_Indicator}`, and it keeps the old ranges so nothing it stripped before comes back. Symbols that show as text (©, ↔, #, *) are kept, and a test pins that.
2. **One gentle error message.** "Pebble couldn't answer just now. Try again whenever you're ready." It follows the voice rules: short and plain, with no pressure and no technical detail. The rate-limit message ("Pebble is resting") is 8.4.
3. **Calm mode strips emoji when the reply is rendered**, not when it arrives. Turning calm mode on or off therefore applies to replies already shown. The user's own messages are left as typed.
