import { expect } from 'vitest';
import { waitFor } from './render';
import { accountStore } from './msw/account';

/** Waits until the newest entry of the account's activity log (the fake server) matches. */
export async function expectLogged(match: Record<string, unknown>) {
  await waitFor(() => expect(accountStore.activity()[0]).toMatchObject(match));
}
