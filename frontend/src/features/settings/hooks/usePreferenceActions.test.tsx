import { describe, expect, it } from 'vitest';
import { act, renderLoadedHook } from '@/test/render';
import { useActivityLog } from '@/features/activity';
import { usePreferences } from '@/shared/preferences';
import { setPreferences } from '../testing';
import { usePreferenceActions } from './usePreferenceActions';

async function renderActions() {
  setPreferences({});
  return (await renderLoadedHook(() => ({ ...usePreferenceActions(), ...usePreferences(), log: useActivityLog() }))).result;
}

describe('usePreferenceActions', () => {
  it('changes the model without logging it', async () => {
    const result = await renderActions();
    const before = result.current.log.entries.length;

    act(() => result.current.selectModel('minimal'));

    expect(result.current.preferences.pebbleModel).toBe('minimal');
    expect(result.current.log.entries).toHaveLength(before);
  });

  it('logs each other change as AdaptLens', async () => {
    const result = await renderActions();

    act(() => result.current.setReadingLevel(7));
    expect(result.current.log.entries[0]).toMatchObject({ agent: 'AdaptLens', action: 'Default reading level changed to 7' });

    act(() => result.current.toggleCalmMode());
    expect(result.current.preferences.calmMode).toBe(true);
    expect(result.current.log.entries[0]).toMatchObject({ reasoning: 'User toggled calm mode to true.' });
  });
});
