# 10.4 Rate limits: plan

1. Domain: `RateLimit` and `wait_before_next_call` (sliding windows); tests.
2. Application: `AgentCallLimit` (in memory, clock injected) and `AgentCallsLimitedError`; tests.
3. Settings, the container, the `limit_agent_calls` dependency on the five routes, the 429 handler; API tests.
4. Frontend: `RESTING_TEXT`, `isResting`, and the resting note in chat, breakdowns and SimplifyCore; an MSW `resting()` helper and component tests for both kinds; the guilt-scan check.
5. Docs, `.env.example`, roadmap, PR.
