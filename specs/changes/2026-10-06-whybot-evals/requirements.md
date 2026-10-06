# 7.9 Evals for new agents: requirements

Roadmap item: **7.9** (Phase 7). Branch: `test/7.9-whybot-evals`.

## Goal

The new agents are checked against the real model, and the scores are recorded.

## WhyBot

There are 10 labelled cases (`tests/evals/whybot_cases.py`): CalmSense at three step sizes, SimplifyCore at two reading levels, PebbleVoice (encouragement and distress) and AdaptLens (both rules). Each goes straight to `Explain` and is scored four ways:

- **Answered:** no fallback to the agent's own reasoning (target 1.0).
- **Voice rules:** `voice.py` (target ≥ 0.9).
- **Names the setting** that mattered, so the user knows what to change (target ≥ 0.8).
- **No invented numbers:** every number in the explanation was in its input (target 1.0).

## AdaptLens

AdaptLens's suggestions come from rules (7.6), not the model, so "sensible suggestions" are the rules' unit tests (`tests/unit/domain/test_adaptation.py`). WhyBot's explanation of an accepted AdaptLens change is in the WhyBot set.

## A correction

7.4's spec said the existing evals weren't affected. They are: since 7.4 every chat turn is explained by WhyBot, so a run makes more calls, and WhyBot's "why" is part of what the chat set's voice score reads. The evals README now says so.

## What the scores miss

A model can misread real numbers without inventing any ("0 of 6 done" as "no tasks yet"). The scores can't tell, so the README says to read the report too, and the first run's misreads are logged as A-033.
