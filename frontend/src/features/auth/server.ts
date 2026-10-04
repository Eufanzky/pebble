// Server-only entry point of the auth feature (route handlers, proxy.ts, server pages).
// Client components import '@/features/auth' instead.
export { auth, handlers } from './config';
export { errorResponse, forwardToBackend } from './lib/forward';
export { enabledProviders, safeCallbackUrl } from './lib/providers';
