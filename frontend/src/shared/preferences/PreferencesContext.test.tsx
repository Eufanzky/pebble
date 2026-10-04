import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders, waitFor } from '@/test/render';
import { accountStore } from '@/test/msw/account';
import { devicePreferences } from '@/test/preferences';
import type { UserPreferences } from '@/shared/preferences';
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

  // A-011: emoji outside the old hand-listed code-point ranges.
  it.each([
    ['⭐ Star', 'Star'], // U+2B50
    ['⏰ Alarm set', 'Alarm set'], // U+23F0
    ['⌛ Waiting', 'Waiting'], // U+231B
    ['⬆️ Up next', 'Up next'], // U+2B06 with a variation selector
    ['🇪🇸 Spanish', 'Spanish'], // flag: two regional indicators
    ['👋🏽 Hi', 'Hi'], // skin-tone modifier
    ['🫠 Melting', 'Melting'], // Unicode 14
  ])('removes %j', (text, expected) => {
    const result = renderPreferences({ calmMode: true });

    expect(result.current.stripEmoji(text)).toBe(expected);
  });

  it('keeps symbols that show as text, not emoji, when calm mode is on', () => {
    const result = renderPreferences({ calmMode: true });

    expect(result.current.stripEmoji('Step #1 * note © 2026 ↔ ok')).toBe('Step #1 * note © 2026 ↔ ok');
  });

  it('follows calm mode when it is toggled', () => {
    const result = renderPreferences({ calmMode: true });
    expect(result.current.stripEmoji('💬 Comms')).toBe('Comms');

    act(() => result.current.setPreferences((prev) => ({ ...prev, calmMode: false })));

    expect(result.current.stripEmoji('💬 Comms')).toBe('💬 Comms');
  });
});

describe('DOM effects', () => {
  const html = document.documentElement;

  // useLocalStorage caches preferences at module level, so each test sets the
  // values it depends on.
  function renderWith(prefs: Partial<UserPreferences>) {
    const { result } = renderHookWithProviders(() => usePreferences());
    act(() => result.current.setPreferences((prev) => ({ ...prev, ...prefs })));
    return result;
  }

  it('adds the reduce-animations class to <html> when reduce animations is on', () => {
    renderWith({ reduceAnimations: true });

    expect(html).toHaveClass('reduce-animations');
  });

  it('removes the reduce-animations class when it is turned off', () => {
    const result = renderWith({ reduceAnimations: true });

    act(() => result.current.setPreferences((prev) => ({ ...prev, reduceAnimations: false })));

    expect(html).not.toHaveClass('reduce-animations');
  });

  it.each([
    { pebbleColor: 'lavender', hex: '#C4B5D4', dark: '#A89ABC' },
    { pebbleColor: 'sage', hex: '#8FAF8A', dark: '#7A9E76' },
    { pebbleColor: 'coral', hex: '#E8856A', dark: '#D07050' },
    { pebbleColor: 'amber', hex: '#D4A843', dark: '#B89030' },
    { pebbleColor: 'sky', hex: '#87CEEB', dark: '#6098B5' },
  ] as const)('sets the Pebble colour variables for $pebbleColor', ({ pebbleColor, hex, dark }) => {
    renderWith({ pebbleColor });

    expect(html.style.getPropertyValue('--pebble-color')).toBe(hex);
    expect(html.style.getPropertyValue('--pebble-dark')).toBe(dark);
  });

  it('keeps a copy on this device and saves the change to the account', async () => {
    renderWith({ calmMode: true, pebbleColor: 'sage' });

    expect(devicePreferences()).toMatchObject({ calmMode: true, pebbleColor: 'sage' });
    await waitFor(() => expect(accountStore.preferences()).toMatchObject({ calmMode: true, pebbleColor: 'sage' }));
  });
});

// A-010: the OS "reduce motion" setting was ignored by everything drawn in JS.
describe('reduceMotion', () => {
  function mockOsReducedMotion(matches: boolean) {
    const query = { matches, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal('matchMedia', vi.fn(() => query));
    return query;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.classList.remove('reduce-animations');
  });

  function renderWith(reduceAnimations: boolean) {
    const { result } = renderHookWithProviders(() => usePreferences());
    act(() => result.current.setPreferences((prev) => ({ ...prev, reduceAnimations })));
    return result;
  }

  it('follows the OS setting when the user has not turned it on', () => {
    mockOsReducedMotion(true);

    const result = renderWith(false);

    expect(result.current.reduceMotion).toBe(true);
    expect(result.current.preferences.reduceAnimations).toBe(false);
    expect(document.documentElement).toHaveClass('reduce-animations');
  });

  it('is on when the user turns it on, whatever the OS says', () => {
    mockOsReducedMotion(false);

    expect(renderWith(true).current.reduceMotion).toBe(true);
  });

  it('is off when neither asks for it', () => {
    mockOsReducedMotion(false);

    const result = renderWith(false);

    expect(result.current.reduceMotion).toBe(false);
    expect(document.documentElement).not.toHaveClass('reduce-animations');
  });

  it('works where matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(renderWith(false).current.reduceMotion).toBe(false);
  });
});

describe('stored preferences', () => {
  it('fills in settings missing from what was saved', () => {
    const { result } = renderHookWithProviders(() => usePreferences());

    act(() => result.current.setPreferences({ calmMode: true } as UserPreferences));

    expect(result.current.preferences).toMatchObject({ calmMode: true, pebbleColor: 'lavender', readingLevel: 5 });
  });
});
