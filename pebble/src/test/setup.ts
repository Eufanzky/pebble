import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { notifyManager } from '@tanstack/react-query';
import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import { server } from './msw/server';
import { taskStore } from './msw/tasks';

expect.extend(axeMatchers);

// Server code (the auth proxy, token signing) runs its tests with
// `// @vitest-environment node`: no DOM there.
const dom = typeof window !== 'undefined';

if (dom) {
  // jsdom has no canvas. axe probes it and jsdom logs "Not implemented" on every
  // run, so report "no 2D context" the way a browser without canvas would.
  HTMLCanvasElement.prototype.getContext = () => null;

  // jsdom has no layout, so it doesn't implement scrolling. The chat scrolls its
  // newest message into view.
  Element.prototype.scrollIntoView = () => {};
}

// TanStack Query tells components about a cache change on the next tick
// (setTimeout 0). In tests it tells them at once, inside `act`, so an
// optimistic change is visible right after the call that made it.
notifyManager.setScheduler((callback) => callback());

// No real network in tests: a request without a handler fails the test.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  taskStore.reset();
  if (!dom) return;
  cleanup();
  window.localStorage.clear();
});

afterAll(() => server.close());
