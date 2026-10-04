# 5.4 Today, redesigned: validation

- [x] The existing Today, TaskCard, page and E2E tests pass on the new layout (names updated where the copy changed).
- [x] New `TaskList` tests: the two groups with their counts, "Done today" only when something is done, the add field between the groups, the example tasks on an empty list.
- [x] Today fits 360, 768 and 1280px with no overflow and no axe violations (E2E).
- [x] Screenshots checked on a phone, a tablet and a 1440px screen.
- [x] `npm test` with the coverage floor, lint, `tsc`, build; E2E 21/21.
