import type { RequestHandler } from 'msw';

// Default handlers shared by every test. Tests add their own per case with
// `server.use(...)`. Empty for now: 1.4 adds the chat handlers.
export const handlers: RequestHandler[] = [];
