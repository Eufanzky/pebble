# 2.8 LLM eval suite: plan

1. Write the labelled cases and the voice checker, with unit tests for the checker.
2. Write the eval module: paced LLM wrapper, per-case run, scores, report, one test per score.
3. Check the harness with `LLM_PROVIDER=fake`, and check that it skips when no LLM is configured.
4. Add the weekly workflow and the evals README; gitignore the reports.
5. Merge, dispatch the workflow on `main`, and record the baseline in a follow-up PR that ticks 2.8.
