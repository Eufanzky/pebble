import { SignJWT } from 'jose';

/** Must match `ISSUER`, `AUDIENCE` and `ALGORITHM` in backend/app/api/auth.py. */
export const TOKEN_ISSUER = 'pebble-web';
export const TOKEN_AUDIENCE = 'pebble-api';
export const TOKEN_LIFETIME_SECONDS = 300;

/**
 * The access token the Next.js server attaches to every proxied API call.
 * Short-lived and signed with the secret it shares with the backend; the
 * browser never sees it.
 */
export async function signBackendToken(userId: string, secret: string, now: Date = new Date()): Promise<string> {
  const issuedAt = Math.floor(now.getTime() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + TOKEN_LIFETIME_SECONDS)
    .sign(new TextEncoder().encode(secret));
}
