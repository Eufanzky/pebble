# 7.4 WhyBot: requirements

Roadmap item: **7.4** (Phase 7). Branch: `feat/7.4-whybot`.

## Goal

Every agent result has a plain-language "why" from WhyBot. It's stored with the activity entry and shown on the task's "Why?" card, and no "why" text is written in advance.

## What WhyBot is

- **A use case:** `Explain` (`application/agents/whybot.py`) with its own prompt (`WHYBOT_PROMPT`).
- **What it's given:** the agent, what was asked (redacted), a summary of what the agent did, and the settings that shaped it (step size, time of day, reading level, the day's progress, personality).
- **What it answers:** 1–3 short sentences that name the setting that mattered, so the user knows what to change. They use only the facts given, with no praise or technical words.
- **Safety:** its answer is screened like any reply (Content Safety, then PII redaction) and cut at 400 characters.

## Where it runs

- **On every logged result:** each agent's direct call (CalmSense from Today, SimplifyCore from Documents, PebbleVoice) and every chat turn that passed the safety checks. A flagged reply isn't explained; its entry already says why it was held back.
- **In the log:** the entry's new `explanation` holds WhyBot's answer, beside the agent's own `reasoning`. The Activity screen shows "WhyBot: …" under the action, with the reasoning behind "Show reasoning".
- **On tasks:** a breakdown's or simplification's `why` becomes WhyBot's explanation. That's what the task's "Why?" card shows ("WhyBot explains:"), for tasks CalmSense broke down and for action items from an upload.

## It never costs an answer

If WhyBot can't answer (an outage, a rate limit, unusable JSON, a flagged reply), the explanation is the agent's own reasoning, and the user still gets their result.

## No hard-coded "why"

These texts were removed:

- The four example tasks' "why" texts. Examples are content to look around with, not an AI decision, so they have no "Why?" card.
- The "Created from … Pebble extracted this" text on document tasks. They carry WhyBot's explanation of the simplification, or nothing for an example document.
- "Clean slate…" on the breathing task from the distress prompt (the user's choice, not an AI one).

## Decisions

1. **A separate column, not a rewrite of `reasoning`.** The agent's own reasoning stays for whoever wants the detail, and older entries simply have no explanation (migration 0006 adds `explanation`, default empty).
2. **512 output tokens.** With 256 the model, which reasons before it answers, cut its JSON off. The real-model check below found this; the fake LLM wouldn't have.
3. **WhyBot's eval set is 7.9.** No existing prompt changed, so the current evals aren't affected.
