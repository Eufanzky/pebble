import { describe, expect, it } from 'vitest';
import { devUserName, enabledProviders, safeCallbackUrl, userIdFor } from './providers';

describe('enabledProviders', () => {
  it('turns on each OAuth provider only with both its id and secret', () => {
    expect(enabledProviders({})).toEqual([]);
    expect(enabledProviders({ AUTH_GITHUB_ID: 'id' })).toEqual([]);
    expect(
      enabledProviders({
        AUTH_GITHUB_ID: 'id',
        AUTH_GITHUB_SECRET: 's',
        AUTH_GOOGLE_ID: 'id',
        AUTH_GOOGLE_SECRET: 's',
      }),
    ).toEqual(['github', 'google']);
  });

  it('turns on the dev login only with AUTH_DEV_LOGIN=true', () => {
    expect(enabledProviders({ AUTH_DEV_LOGIN: 'true' })).toEqual(['dev']);
    expect(enabledProviders({ AUTH_DEV_LOGIN: '1' })).toEqual([]);
  });
});

describe('devUserName', () => {
  it.each([
    ['Sam', 'sam'],
    ['  Ana María ', 'ana-mar-a'],
    ['e2e', 'e2e'],
    ['', 'dev'],
    ['!!!', 'dev'],
    [undefined, 'dev'],
    ['x'.repeat(40), 'x'.repeat(32)],
  ])('%j becomes %j', (raw, name) => {
    expect(devUserName(raw)).toBe(name);
  });
});

describe('userIdFor', () => {
  it('keeps providers apart', () => {
    expect(userIdFor('github', '42')).toBe('github:42');
    expect(userIdFor('google', '42')).not.toBe(userIdFor('github', '42'));
  });
});

describe('safeCallbackUrl', () => {
  it.each([
    ['/documents?x=1', '/documents?x=1'],
    ['https://evil.example', '/today'],
    ['//evil.example', '/today'],
    ['/\\evil.example', '/today'],
    [undefined, '/today'],
    [['/a'], '/today'],
  ])('%j goes to %j', (raw, target) => {
    expect(safeCallbackUrl(raw)).toBe(target);
  });
});
