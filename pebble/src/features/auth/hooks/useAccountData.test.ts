import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signOut } from 'next-auth/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { accountHandlers, accountStore } from '@/test/msw/account';
import { server } from '@/test/msw/server';
import { DELETE_CONFIRM, DELETE_FAILED, EXPORT_FAILED, useAccountData } from './useAccountData';

vi.mock('next-auth/react', () => ({ signIn: vi.fn(), signOut: vi.fn() }));

const NOW = new Date('2026-09-29T12:00:00Z');
let clicked: { href: string; download: string }[];
let saved: Blob[];

beforeEach(() => {
  clicked = [];
  saved = [];
  vi.mocked(signOut).mockClear();
  URL.createObjectURL = vi.fn((blob: Blob) => {
    saved.push(blob);
    return 'blob:pebble';
  });
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    clicked.push({ href: this.href, download: this.download });
  });
});

afterEach(() => vi.restoreAllMocks());

const render = () => renderHook(() => useAccountData(() => NOW)).result;

describe('useAccountData', () => {
  it('downloads everything as a dated JSON file', async () => {
    accountStore.setPreferences({ calmMode: true });
    const result = render();

    await act(() => result.current.download());

    expect(clicked).toEqual([{ href: 'blob:pebble', download: 'pebble-data-2026-09-29.json' }]);
    const file = JSON.parse(await saved[0].text());
    expect(file.data.preferences[0].calmMode).toBe(true);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:pebble');
    expect(result.current.busy).toBeNull();
  });

  it('says so gently when the data could not be fetched', async () => {
    server.use(...accountHandlers.status(503));
    const result = render();

    await act(() => result.current.download());

    expect(result.current.error).toBe(EXPORT_FAILED);
    expect(clicked).toEqual([]);
  });

  it('deletes nothing unless the user says yes', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const result = render();

    await act(() => result.current.deleteAccount());

    expect(confirm).toHaveBeenCalledWith(DELETE_CONFIRM);
    expect(accountStore.deleted()).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('deletes the account, then signs out', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const result = render();

    await act(() => result.current.deleteAccount());

    expect(accountStore.deleted()).toBe(true);
    expect(signOut).toHaveBeenCalledWith({ redirectTo: '/signin' });
  });

  it('stays signed in and says nothing was removed when the delete fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    server.use(...accountHandlers.status(503));
    const result = render();

    await act(() => result.current.deleteAccount());

    await waitFor(() => expect(result.current.error).toBe(DELETE_FAILED));
    expect(result.current.busy).toBeNull();
    expect(signOut).not.toHaveBeenCalled();
  });
});
