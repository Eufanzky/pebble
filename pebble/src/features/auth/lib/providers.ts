/** A way to sign in that this deployment has set up. */
export type ProviderId = 'github' | 'google' | 'dev';

type Env = Record<string, string | undefined>;

/**
 * GitHub and Google are on when their OAuth app is configured. The dev login
 * is on only with AUTH_DEV_LOGIN=true, for local use and E2E; never in production.
 */
export function enabledProviders(env: Env = process.env): ProviderId[] {
  const ids: ProviderId[] = [];
  if (env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET) ids.push('github');
  if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) ids.push('google');
  if (env.AUTH_DEV_LOGIN === 'true') ids.push('dev');
  return ids;
}

/** A dev login name as a stable id part: lowercase letters, digits and dashes. */
export function devUserName(raw: unknown): string {
  const name = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return name || 'dev';
}

/** The user id the backend sees: the provider plus its account id, so two providers never collide. */
export function userIdFor(provider: string, accountId: string): string {
  return `${provider}:${accountId}`;
}

/** Only same-site paths: a sign-in never sends the user somewhere else. */
export function safeCallbackUrl(raw: unknown): string {
  const value = typeof raw === 'string' ? raw : '';
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/today';
}
