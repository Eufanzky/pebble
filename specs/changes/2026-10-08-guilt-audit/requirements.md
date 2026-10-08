# 8.1 Guilt audit: requirements

Roadmap item: **8.1** (Phase 8). Branch: `test/8.1-guilt-audit`.

## Goal

UI copy, sample data and prompts follow principle 1 (`specs/mission.md`), and the guilt scan (1.5) covers every rule in it.

## What the audit found

Read by hand: Today's greeting and nudge, Pebble's rotating messages, the focus view, the stats copy, the sample tasks and documents, the offline page, every agent prompt and the fake LLM's replies.

- **Praise for nothing (A-023).** "You finished 0 things already. That's really good." Lines that name a count now show only when it's above zero, and say "1 thing", not "1 things". Lines that claimed progress with none ("You're making steady progress", "You did good today") and "You've earned some rest" (rest isn't earned) are rewritten.
- **The clock against what's left.** The afternoon nudge said "It's 3pm and you have 4 tasks left." Time may be visible, but set against a count it reads as pressure. It now says "4 still open. Want to start with …?"
- **Zero counts on Today.** A new account read "You have 0 things today" and "0 tasks waiting". It now reads "Nothing on the list yet. Add one thing whenever you like."
- **Rush in sample data.** A sample document's simplified text ended "— and do it quickly". It now says "in a set amount of time", as the original does.
- **Prompts.** The voice rules forbade "you're behind" and comparisons but not the rest of principle 1. They now name streaks, missed days, time away, "overdue" ("still open"), letting go as a fine outcome, and loss framing, and give the sentence length the voice eval checks (under 20 words, A-028). WhyBot is told to repeat progress as given (A-033), and to put one fact in each sentence and split a long one in two.

## The evals

WhyBot's voice score on `main` was 0.7 and 0.8 in two runs on 2026-10-08 (7.9's 1.00 was a good day): each miss was one 23–25-word sentence. With "one fact per sentence, so split a long one in two" it scored 1.00 on every score in three runs.

A first run made with the local `.env`'s `LLM_PROVIDER=openai` and Groq's URL failed JSON validity: that provider doesn't send `reasoning_effort`, so Groq reasons at its default effort and the reasoning can use up the classifier's 512 tokens. Every baseline is recorded with `LLM_PROVIDER=groq` (effort low), and the evals README now says to set `LLM_REASONING_EFFORT=low` when pointing another provider at Groq.

The sample tasks, the focus view ("Stop whenever you need to"), the stats copy and the offline page already follow it.

## The scan

One pattern per rule of principle 1:

| Rule | Pattern |
|:--|:--|
| Streaks, or anything that resets to zero | `streak`: also "back to zero" (not "Nothing goes back to zero"), "start over from scratch", "break the chain", "consecutive days" |
| Counting missed days or time away | `missed-days`: also "it's been a while", "long time no see", "where have you been", "6 days without", "inactive for" |
| Red or alarm styling | `alarm-styling`: also alarm emoji (🚨 ⚠ ❗ ‼ ⛔ 🔴); `red-colour`: any hex or rgb() literal within 12° of red, saturated, neither near-black nor pastel (the coral tag colour is 13°) |
| Loss framing | `loss-framing`: also "before it's too late", "you'll lose", "don't let it slip", "wasted" |
| Nudges nobody asked for | `unasked-nudge`: any `Notification`, `showNotification` or `vibrate` call needs an exception pointing to a reminder the user set (8.6) |
| Late tasks are "still open" | `overdue`: also "past due", "late tasks", "the deadline has passed" |
| Stopping a focus session early is fine | `stopping-early`: "gave up on the session", "abandoned sessions", "penalty", "you only lasted" |

The scan also reads `frontend/public` (the offline page and the service worker). The eval's voice checker (`tests/evals/voice.py`) gains the same phrases, so real replies are checked against them too.

What a line pattern can't see is tested where it lives: counts that never go down (8.2), the deadline bar (8.3), the "still open" choices (8.4), coming back (8.5) and reminders off by default (8.6).

## Out of scope

- "Want to start with …?" offers the estimate that sorts first as text, not the shortest (A-034).
