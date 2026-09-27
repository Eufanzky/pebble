import { describe, expect, it, vi } from 'vitest';
import { renderHookWithProviders } from '@/test/render';
import { useResetPreferences } from './useResetPreferences';

describe('useResetPreferences', () => {
  it('clears preferences and the log, keeps tasks, and reloads', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    window.localStorage.setItem('pebble-preferences', '{}');
    window.localStorage.setItem('pebble-activity', '[]');
    window.localStorage.setItem('pebble-tasks', '[]');
    const reload = vi.fn();

    const { result } = renderHookWithProviders(() => useResetPreferences(reload));
    result.current();

    expect(window.localStorage.getItem('pebble-preferences')).toBeNull();
    expect(window.localStorage.getItem('pebble-activity')).toBeNull();
    expect(window.localStorage.getItem('pebble-tasks')).toBe('[]');
    expect(reload).toHaveBeenCalledOnce();
  });

  it('does nothing when the user says no', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    window.localStorage.setItem('pebble-preferences', '{}');
    const reload = vi.fn();

    const { result } = renderHookWithProviders(() => useResetPreferences(reload));
    result.current();

    expect(window.localStorage.getItem('pebble-preferences')).toBe('{}');
    expect(reload).not.toHaveBeenCalled();
  });
});
