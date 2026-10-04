// @vitest-environment node
import { decodeProtectedHeader, jwtVerify } from 'jose';
import { describe, expect, it } from 'vitest';
import { signBackendToken, TOKEN_AUDIENCE, TOKEN_ISSUER, TOKEN_LIFETIME_SECONDS } from './backendToken';

const SECRET = 'a-shared-secret-that-is-32-bytes-long';
const NOW = new Date('2026-09-29T09:30:00Z');

describe('signBackendToken', () => {
  it('signs the user id for the backend, for five minutes', async () => {
    const token = await signBackendToken('github:42', SECRET, NOW);

    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      currentDate: NOW,
    });
    expect(decodeProtectedHeader(token).alg).toBe('HS256');
    expect(payload.sub).toBe('github:42');
    expect(payload.exp! - payload.iat!).toBe(TOKEN_LIFETIME_SECONDS);
    expect(payload.iat).toBe(NOW.getTime() / 1000);
  });

  it('is useless with another secret', async () => {
    const token = await signBackendToken('github:42', SECRET, NOW);

    await expect(
      jwtVerify(token, new TextEncoder().encode('another-secret-that-is-32-bytes!!'), { currentDate: NOW }),
    ).rejects.toThrow();
  });
});
