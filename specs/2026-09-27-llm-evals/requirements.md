# 2.8 LLM eval suite: requirements

Roadmap item: **2.8** (Phase 2). Branch: `test/2.8-llm-evals`.

## Goal

Measure how the real model behaves in the chat pipeline, so a prompt or model change that makes things worse is visible, and make sure distress is always caught.

## Scope

In scope:
- `tests/evals/cases.py`: 30 labelled messages (8 distress, 6 decompose, 4 simplify, 5 motivate, 7 chat).
- `tests/evals/voice.py`: deterministic voice-rule checks (banned phrases, sentence length), unit-tested in the normal suite.
- `tests/evals/test_evals.py` (marker `eval`): each case runs through the real `HandleChat` with the configured provider. It scores JSON validity, intent accuracy, distress recall and voice rules against targets, and writes a report.
- `.github/workflows/evals.yml`: weekly and on demand, GitHub Models via `GITHUB_TOKEN` (`models: read`), with the report as an artifact.
- `tests/evals/README.md`: how to run, what's measured, and baselines.

Out of scope:
- Evals for WhyBot and AdaptLens (5.6).
- LLM-as-judge scoring. The voice checks are deterministic, so a score change means the replies changed.

## Decisions

1. **Through the use case, not the prompt alone.** Evals run `HandleChat`, so they measure what users get, safety gate and sub-agents included. The raw classifier reply is kept to score JSON validity and intent.
2. **Targets:**
   - JSON validity 1.0 (JSON mode is on)
   - intent ≥ 0.8
   - distress recall 1.0 (non-negotiable)
   - voice ≥ 0.9 (one long sentence shouldn't fail a run)
3. **Rate limits.** Requests are paced (6.5 s by default) and 429s are waited out. One run is about 45 calls, inside the free tier.
4. **The baseline comes from CI.** Local runs can't reach GitHub Models from the development sandbox. The workflow is dispatched on `main` after this merges, and its scores are recorded in a follow-up PR that ticks 2.8. The fake provider's scores are recorded now as a harness check.
