import { describe, expect, it } from 'vitest';
import { act, renderHookWithProviders } from '@/test/render';
import { usePreferences } from './PreferencesContext';

function renderPreferences({ calmMode }: { calmMode: boolean }) {
  const { result } = renderHookWithProviders(() => usePreferences());
  act(() => result.current.setPreferences((prev) => ({ ...prev, calmMode })));
  return result;
}

describe('stripEmoji', () => {
  it('returns text unchanged when calm mode is off', () => {
    const result = renderPreferences({ calmMode: false });

    expect(result.current.stripEmoji('📚 Study  ✨')).toBe('📚 Study  ✨');
  });

  it('removes emoji and tidies the spacing left behind when calm mode is on', () => {
    const result = renderPreferences({ calmMode: true });

    expect(result.current.stripEmoji('📚 Study')).toBe('Study');
    expect(result.current.stripEmoji('You finished 3 things ✨ nice')).toBe('You finished 3 things nice');
    expect(result.current.stripEmoji('Take a break 🌿')).toBe('Take a break');
  });

  it('removes emoji built from several code points', () => {
    const result = renderPreferences({ calmMode: true });

    expect(result.current.stripEmoji('⚙️ Settings')).toBe('Settings'); // variation selector
    expect(result.current.stripEmoji('👩‍💻 Coding')).toBe('Coding'); // zero-width joiner
    expect(result.current.stripEmoji('Step 1️⃣')).toBe('Step 1'); // keycap keeps the digit
  });

  it('leaves plain text and punctuation alone when calm mode is on', () => {
    const result = renderPreferences({ calmMode: true });

    expect(result.current.stripEmoji('Read chapter 3 — then rest → done.')).toBe(
      'Read chapter 3 — then rest → done.'
    );
  });

  it('follows calm mode when it is toggled', () => {
    const result = renderPreferences({ calmMode: true });
    expect(result.current.stripEmoji('💬 Comms')).toBe('Comms');

    act(() => result.current.setPreferences((prev) => ({ ...prev, calmMode: false })));

    expect(result.current.stripEmoji('💬 Comms')).toBe('💬 Comms');
  });
});
