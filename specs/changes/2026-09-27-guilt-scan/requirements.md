# 1.5 Guilt scan: requirements

Roadmap item: **1.5 Guilt scan** (Phase 1). Branch: `test/1.5-guilt-scan`.

## Goal

Make principle 1 of `mission.md` ("structure without guilt") a test, not a memory. A test in `npm test` fails when UI copy, sample data or agent prompts use a banned pattern.

## Scope

In scope:
- `pebble/src/test/guilt-scan.test.ts`, which scans:
  - `pebble/src/**/*.{ts,tsx,css}`: UI copy, styles and sample data (tests and `src/test/` are skipped)
  - `backend/app/agents/**/*.py`: prompts and fixed agent replies (the distress reply)
- Patterns, one per banned item of principle 1:
  - `streak`: streaks, "in a row", "resets to zero"
  - `overdue`: "overdue", also inside identifiers
  - `missed-days`: "missed", "N days away", "been away", "since you last", "haven't seen you", "last seen"
  - `loss-framing`: "don't lose / break / miss", "lose your progress", "falling behind", "you're behind", "last chance"
  - `alarm-styling`: Tailwind red/rose classes, named reds as CSS values, `#f00`/`#ff0000`, and `alarm` / `danger` / `urgent`
- An exceptions list. Each entry names the file, the pattern, a substring of the line, and a written reason. A stale exception fails the test.

Out of scope:
- "Nudges nobody asked for": it's a behaviour, not a word, and 6.6 tests it.
- Voice-rule words (rushing, shaming): the LLM evals in 2.8 check replies.
- A full review of today's copy, which is 6.1. Two borderline lines found here are logged as A-015.

## Decisions

1. **One Vitest file, no new tooling.** It runs in `npm test`, so CI (1.6) gets it for free. It reads files with `node:fs`; it runs in the jsdom environment because the shared setup file needs it.
2. **Every pattern checks its own reach.** Each has `banned` and `allowed` examples, tested against the regex. This caught `\boverdue\b` missing `isOverdue`.
3. **Line-based, with readable failures.** A failure lists `file:line [pattern] rule` and the line.
4. **One exception today:** `prompts.py` quotes "you're behind" in the voice rules to forbid it.
