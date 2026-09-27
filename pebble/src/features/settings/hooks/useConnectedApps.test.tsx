import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders } from '@/test/render';
import { useActivityLog } from '@/features/activity';
import { useTasks } from '@/features/tasks';
import { SYNC_MS, useConnectedApps } from './useConnectedApps';

afterEach(() => vi.useRealTimers());

function renderApps() {
  const { result } = renderHookWithProviders(() => ({ ...useConnectedApps(), tasks: useTasks(), log: useActivityLog() }));
  act(() => result.current.tasks.clearAll());
  return result;
}

describe('useConnectedApps', () => {
  it('starts with the default connections', () => {
    const result = renderApps();

    expect(result.current.connected).toMatchObject({ 'Microsoft Teams': true, Slack: false });
  });

  it('connects an app: syncing, then its tasks are added', () => {
    vi.useFakeTimers();
    const result = renderApps();

    act(() => result.current.toggle('Slack'));
    expect(result.current.syncing).toBe('Slack');
    expect(result.current.tasks.tasks).toHaveLength(0);

    act(() => vi.advanceTimersByTime(SYNC_MS));
    expect(result.current.syncing).toBeNull();
    expect(result.current.connected.Slack).toBe(true);
    expect(result.current.tasks.tasks.map((t) => t.title)).toEqual(['Follow up on feedback from #design channel']);
    expect(result.current.log.entries[0]).toMatchObject({ agent: 'BridgeBot', action: 'Slack connected — synced 1 items' });
  });

  it('disconnects an app', () => {
    const result = renderApps();

    act(() => result.current.toggle('Microsoft Teams'));

    expect(result.current.connected['Microsoft Teams']).toBe(false);
    expect(result.current.log.entries[0]).toMatchObject({ action: 'Microsoft Teams disconnected' });
  });

  it('adds nothing if the page goes away mid-sync', () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHookWithProviders(() => useConnectedApps());

    act(() => result.current.toggle('Slack'));
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    unmount();

    expect(clear).toHaveBeenCalled();
  });
});
