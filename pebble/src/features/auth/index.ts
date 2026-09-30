// Public API of the auth feature for client code. Server code (route handlers,
// proxy.ts, server pages) imports '@/features/auth/server'.
export { SignInView } from './components/SignInView';
export { AccountSection } from './components/AccountSection';
export type { ProviderId } from './lib/providers';
