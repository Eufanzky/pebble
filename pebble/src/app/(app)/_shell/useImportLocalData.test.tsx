import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTasks } from '@/features/tasks';
import { taskStore } from '@/test/msw/tasks';
import { renderHookWithProviders, waitFor } from '@/test/render';
import { accountHandlers, accountStore } from '@/test/msw/account';
import { server } from '@/test/msw/server';
import { IMPORT_MARK } from './importLocalData';
import { useImportLocalData } from './useImportLocalData';

const put = (key: string, value: unknown) => window.localStorage.setItem(key, JSON.stringify(value));

beforeEach(() => window.localStorage.clear());

describe('useImportLocalData', () => {
  it('moves what the browser kept into the account, once, and forgets its copy', async () => {
    put('pebble-tasks', [{ title: 'Read Chapter 4', tag: 'study', priority: 'medium', completed: false }]);
    put('pebble-preferences', { calmMode: true });

    renderHookWithProviders(() => useImportLocalData());

    await waitFor(() => expect(window.localStorage.getItem('pebble-tasks')).toBeNull());
    expect(accountStore.imports()).toEqual([
      expect.objectContaining({
        tasks: [expect.objectContaining({ title: 'Read Chapter 4' })],
        preferences: { calmMode: true },
        activity: [],
      }),
    ]);
    expect(window.localStorage.getItem('pebble-preferences')).toBeNull();
    expect(window.localStorage.getItem(IMPORT_MARK)).toBeNull();

    renderHookWithProviders(() => useImportLocalData());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(accountStore.imports()).toHaveLength(1);
  });

  it('keeps the copy to try again when the import fails', async () => {
    server.use(...accountHandlers.status(503));
    put('pebble-tasks', [{ title: 'Read' }]);

    renderHookWithProviders(() => useImportLocalData());

    await waitFor(() => expect(window.localStorage.getItem(IMPORT_MARK)).toBeNull());
    expect(window.localStorage.getItem('pebble-tasks')).not.toBeNull();
  });

  it('sends nothing when there is nothing to move', async () => {
    renderHookWithProviders(() => useImportLocalData());
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(accountStore.imports()).toEqual([]);
  });

  it('forgets damaged data without sending it', async () => {
    window.localStorage.setItem('pebble-activity', '{not json');

    renderHookWithProviders(() => useImportLocalData());

    await waitFor(() => expect(window.localStorage.getItem('pebble-activity')).toBeNull());
    expect(accountStore.imports()).toEqual([]);
  });

  it('leaves the import to a tab that already started it', async () => {
    put('pebble-tasks', [{ title: 'Read' }]);
    window.localStorage.setItem(IMPORT_MARK, String(Date.now()));

    renderHookWithProviders(() => useImportLocalData());
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(accountStore.imports()).toEqual([]);
    expect(window.localStorage.getItem('pebble-tasks')).not.toBeNull();
  });
});

describe('useImportLocalData and a first load under way', () => {
  it('shows the imported tasks even when the list was already loading', async () => {
    // The first load of the list is answered only after the import is done,
    // with what the server had before the import (the race seen in E2E)
    let releaseLoad!: () => void;
    const loadHeld = new Promise<void>((resolve) => (releaseLoad = resolve));
    let loads = 0;
    server.use(
      http.get('/api/tasks', async () => {
        loads += 1;
        if (loads === 1) {
          const before = taskStore.all();
          await loadHeld;
          return HttpResponse.json(before);
        }
        return HttpResponse.json(taskStore.all());
      }),
    );
    window.localStorage.setItem('pebble-tasks', JSON.stringify([{ title: 'Water the plants' }]));

    const { result } = renderHookWithProviders(() => {
      useImportLocalData();
      return useTasks();
    });
    await waitFor(() => expect(accountStore.imports()).toHaveLength(1));
    await waitFor(() => expect(window.localStorage.getItem('pebble-tasks')).toBeNull());
    releaseLoad();

    await waitFor(() => expect(result.current.tasks.map((t) => t.title)).toEqual(['Water the plants']));
  });
});
