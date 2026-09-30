import { describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders, waitFor } from '@/test/render';
import { accountStore } from '@/test/msw/account';
import { setTestPreferences } from '@/test/preferences';
import { usePreferences } from '@/shared/preferences';
import { useResetPreferences } from './useResetPreferences';

function renderReset() {
  return renderHookWithProviders(() => ({ reset: useResetPreferences(), ...usePreferences() })).result;
}

describe('useResetPreferences', () => {
  it('puts the preferences back to their defaults, on this device and in the account', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    setTestPreferences({ calmMode: true, readingLevel: 2, pebbleColor: 'sky' });
    const result = renderReset();

    act(() => result.current.reset());

    expect(result.current.preferences).toMatchObject({ calmMode: false, readingLevel: 5, pebbleColor: 'lavender' });
    await waitFor(() =>
      expect(accountStore.preferences()).toMatchObject({ calmMode: false, readingLevel: 5, pebbleColor: 'lavender' }),
    );
  });

  it('does nothing when the user says no', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    setTestPreferences({ calmMode: true });
    const result = renderReset();

    act(() => result.current.reset());

    expect(result.current.preferences.calmMode).toBe(true);
  });
});
