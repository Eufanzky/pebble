# 4.4 Tasks from the API: validation

- [x] The list loads from the server in order; a failed load offers to try again.
- [x] Adding, ticking, stepping, breaking down, clearing and document tasks show at once and reach the server; ids become the server's.
- [x] Changes made before the server answered are saved against the right ids; clear-then-add keeps the new task.
- [x] A failed save shows a calm note and the list goes back to what's saved.
- [x] An empty list offers the example tasks.
- [x] E2E (Postgres): the flow adds the example tasks, finishes a step, and after a reload the step is still done. 8/8 locally.
- [x] `npm test` (412), coverage floor, lint, `tsc --noEmit`, `npm run build`.
