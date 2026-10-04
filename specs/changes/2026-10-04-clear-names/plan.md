# 6.4 Clear names: plan

1. Find every name that says something other than what it is (folders, packages, prompts, the route group, test folders, the Compose script).
2. `git mv` each; replace references in code, CI, configs and current docs (not history); refresh both lockfiles.
3. Rename in the prompts; run the evals; record the baseline.
4. Add the path and names checks; prove each catches a stale name.
5. Full checks, E2E; roadmap 6.4, audit (A-024 fixed, A-027 logged), PR.
