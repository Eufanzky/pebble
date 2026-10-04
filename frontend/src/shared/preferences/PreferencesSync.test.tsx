import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { act, renderHook, renderHookWithProviders, waitFor } from '@/test/render';
import { accountHandlers, accountStore } from '@/test/msw/account';
import { server } from '@/test/msw/server';
import { setTestPreferences } from '@/test/preferences';
import { QueryProvider } from '@/shared/lib/query';
import { PreferencesProvider, usePreferences } from './PreferencesContext';

describe('preferences and the account', () => {
  it("takes the account's preferences when they arrive", async () => {
    setTestPreferences({ calmMode: false, pebbleColor: 'lavender' });
    accountStore.setPreferences({ calmMode: true, pebbleColor: 'sky' });

    const { result } = renderHookWithProviders(() => usePreferences());

    await waitFor(() => expect(result.current.preferences).toMatchObject({ calmMode: true, pebbleColor: 'sky' }));
  });

  it("keeps a change made here over the account's older copy arriving later", async () => {
    setTestPreferences({ calmMode: false, readingLevel: 5 });
    let answer!: () => void;
    server.use(
      http.get('/api/preferences', async () => {
        await new Promise<void>((resolve) => (answer = resolve));
        return HttpResponse.json({ ...accountStore.preferences(), calmMode: false, readingLevel: 9 });
      }),
    );
    const { result } = renderHookWithProviders(() => usePreferences());

    act(() => result.current.setPreferences((prev) => ({ ...prev, calmMode: true })));
    await waitFor(() => expect(answer).toBeDefined());
    act(() => answer());

    await waitFor(() => expect(result.current.preferences.readingLevel).toBe(9));
    expect(result.current.preferences.calmMode).toBe(true);
  });

  it('saves only what changed', async () => {
    setTestPreferences({ readingLevel: 5 });
    const sent: unknown[] = [];
    server.use(
      http.patch('/api/preferences', async ({ request }) => {
        sent.push(await request.json());
        return HttpResponse.json(accountStore.preferences());
      }),
    );
    const { result } = renderHookWithProviders(() => usePreferences());

    act(() => result.current.setPreferences((prev) => ({ ...prev, readingLevel: 3 })));

    // Only the setting that changed (the setup's own save may land here first)
    await waitFor(() => expect(sent.at(-1)).toEqual({ readingLevel: 3 }));
  });

  it("goes back to the account's copy when a change can't be saved", async () => {
    setTestPreferences({ calmMode: false });
    const { result } = renderHookWithProviders(() => usePreferences());
    await waitFor(() => expect(result.current.preferences.calmMode).toBe(false));
    server.use(http.patch('/api/preferences', () => HttpResponse.json({ detail: 'down' }, { status: 503 })));

    act(() => result.current.setPreferences((prev) => ({ ...prev, calmMode: true })));
    expect(result.current.preferences.calmMode).toBe(true);

    await waitFor(() => expect(result.current.preferences.calmMode).toBe(false));
  });

  it('works offline on the sign-in page, without asking the account', async () => {
    server.use(...accountHandlers.status(500));
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryProvider retry={false}>
        <PreferencesProvider offline>{children}</PreferencesProvider>
      </QueryProvider>
    );
    const { result } = renderHook(() => usePreferences(), { wrapper });

    act(() => result.current.setPreferences((prev) => ({ ...prev, calmMode: true })));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(result.current.preferences.calmMode).toBe(true);
    expect(accountStore.preferences().calmMode).toBe(false);
  });
});
