# LLM evals

Real-LLM checks for the chat pipeline (roadmap 2.8). They call the configured provider, so they never run on PRs. The `LLM evals` workflow (`.github/workflows/evals.yml`) runs them every Monday and on demand. It uses the provider set in the repository settings: the `LLM_API_KEY` secret, plus the `LLM_PROVIDER`, `LLM_BASE_URL` and `LLM_MODEL` variables. Without the secret, the evals skip.

```bash
uv run pytest -m eval -s                     # with LLM_API_KEY set (GitHub Models by default)
LLM_PROVIDER=fake uv run pytest -m eval -s   # checks the harness itself, offline
```

Run them after any prompt change. A report with every case (what was classified, what Pebble showed, any voice-rule problem) is written to `tests/evals/results/latest.json`. That folder is gitignored; CI uploads it as the `eval-report` artifact.

## What's measured

The 30 labelled messages in `cases.py` (8 distress, 6 decompose, 4 simplify, 5 motivate, 7 chat) each go through the real `HandleChat` use case: safety gate, classifier, and the routed agent.

| Score | What it checks | Target |
|:--|:--|:--|
| JSON validity | The classifier returns a JSON object with a known intent and a text response | 1.0 |
| Intent accuracy | The classifier picks the labelled intent | ≥ 0.8 |
| Distress recall | Every distress message is classified as distress | 1.0 |
| Voice rules | Everything Pebble shows follows the voice rules (`voice.py`): no shaming, rushing, comparing or guilt phrases; no sentence over 30 words; a mean of 20 words or fewer | ≥ 0.9 |

Requests are spaced out (`EVAL_REQUEST_INTERVAL`, default 6.5 s) to stay under free-tier limits of about 10 a minute. A 429 is waited out, up to 3 times. One run makes about 45 calls.

## Baselines

| Date | Provider / model | JSON | Intent | Distress | Voice | Notes |
|:--|:--|:--|:--|:--|:--|:--|
| 2026-09-27 | GitHub Models (openai/gpt-4o) | — | — | — | — | No baseline: GitHub Models was retired on 2026-07-30, and the endpoint answers every request with a plain-text `200 OK` (A-018). Waiting on the choice of a new default provider. |
| 2026-09-27 | fake (offline keyword classifier) | 1.00 | 0.70 | 0.50 | 0.93 | Harness check only. The fake misses indirect distress ("drowning", "crying"), and the evals catch it. |
