# 4.2 Preferences and activity: plan

1. Domain `Preferences` and `ActivityEntry`, with tests.
2. Ports, `UserPreferences` and `ActivityLog` with `note`/`watch`; unit tests.
3. Pipeline: pass `ActivityLog` and `user_id` into the four agent use cases; API tests parametrized over every agent and route.
4. Tables, repositories, migration `0002`; contract tests on Postgres and the fakes; an unreachable-database test.
5. Routers and schemas; API tests including isolation; regenerate API types; docs; roadmap tick.
