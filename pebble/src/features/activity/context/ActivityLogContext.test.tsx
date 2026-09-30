import { describe, expect, it } from 'vitest';
import { act, renderHookWithProviders, waitFor } from '@/test/render';
import { accountHandlers, accountStore } from '@/test/msw/account';
import { server } from '@/test/msw/server';
import { useActivityLog } from './ActivityLogContext';

const ENTRY = {
  timestamp: '2026-09-29T09:00:00.000Z',
  agent: 'CalmSense' as const,
  action: 'Broke "Essay" into 3 steps',
  reasoning: 'Small steps first.',
  safetyStatus: 'passed' as const,
};

async function renderLog() {
  const { result } = renderHookWithProviders(() => useActivityLog());
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  return result;
}

describe('ActivityLogProvider', () => {
  it("loads the account's log, with real dates", async () => {
    accountStore.setActivity([ENTRY]);

    const result = await renderLog();

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].timestamp).toEqual(new Date(ENTRY.timestamp));
  });

  it('shows an entry at once and saves it to the account', async () => {
    const result = await renderLog();

    act(() => result.current.addEntry('PebbleVoice', 'You finished "Walk"', 'Task completed by user.'));

    expect(result.current.entries[0]).toMatchObject({ agent: 'PebbleVoice', action: 'You finished "Walk"' });
    await waitFor(() => expect(accountStore.activity()[0]).toMatchObject({ action: 'You finished "Walk"' }));
    await waitFor(() => expect(result.current.entries[0].id).toBe(accountStore.activity()[0].id));
  });

  it('reloads to show what the backend logged itself', async () => {
    const result = await renderLog();
    accountStore.setActivity([ENTRY]);

    act(() => result.current.refresh());

    await waitFor(() => expect(result.current.entries.map((e) => e.action)).toEqual([ENTRY.action]));
  });

  it('says so when the log could not load', async () => {
    server.use(...accountHandlers.status(503));
    const { result } = renderHookWithProviders(() => useActivityLog());

    await waitFor(() => expect(result.current.loadFailed).toBe(true));
    expect(result.current.entries).toEqual([]);
  });

  it('goes back to what the account has when an entry could not be saved', async () => {
    const result = await renderLog();
    server.use(...accountHandlers.status(503));

    act(() => result.current.addEntry('PebbleVoice', 'Unsaved', 'x'));
    expect(result.current.entries).toHaveLength(1);

    await waitFor(() => expect(result.current.loadFailed).toBe(true));
  });
});
