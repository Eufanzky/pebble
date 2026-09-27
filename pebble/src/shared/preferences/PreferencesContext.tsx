'use client';

import { createContext, useContext, useEffect, useCallback, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { PEBBLE_COLORS } from '@/shared/preferences';
import type { UserPreferences } from '@/shared/preferences';

const defaultPreferences: UserPreferences = {
  readingLevel: 5,
  chunkSize: 'medium',
  reduceAnimations: false,
  calmMode: false,
  pebbleColor: 'lavender',
  pebblePersonality: 'gentle',
  pebbleModel: 'chonky-plus',
  voiceInput: false,
};

// Emoji shown as pictures: anything with emoji presentation by default, a
// pictograph followed by the emoji variation selector (⬆️), flag halves, the
// old hand-listed blocks, and the joiners, selectors and keycap marks that
// hold sequences together. Symbols shown as text (©, ↔, #) are kept.
const emojiRegex =
  /\p{Emoji_Presentation}|\p{Extended_Pictographic}(?=\u{FE0F})|\p{Regional_Indicator}|[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const osPrefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION).matches;

interface PreferencesContextValue {
  preferences: UserPreferences;
  /** Reduce animations: the user's setting, or the OS asking for reduced motion. */
  reduceMotion: boolean;
  setPreferences: (value: UserPreferences | ((prev: UserPreferences) => UserPreferences)) => void;
  isHydrated: boolean;
  stripEmoji: (text: string) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [stored, setPreferences, isHydrated] = useLocalStorage<UserPreferences>(
    'pebble-preferences',
    defaultPreferences
  );
  // Saved preferences may predate a setting, or be damaged: fill the gaps
  const preferences = useMemo(() => ({ ...defaultPreferences, ...stored }), [stored]);

  const osReducedMotion = useSyncExternalStore(subscribeToReducedMotion, osPrefersReducedMotion, () => false);
  const reduceMotion = preferences.reduceAnimations || osReducedMotion;

  // Sync reduce-animations class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-animations', reduceMotion);
  }, [reduceMotion]);

  // Sync --pebble-color and --pebble-dark CSS variables on :root
  useEffect(() => {
    const colors = PEBBLE_COLORS[preferences.pebbleColor];
    document.documentElement.style.setProperty('--pebble-color', colors.hex);
    document.documentElement.style.setProperty('--pebble-dark', colors.dark);
  }, [preferences.pebbleColor]);

  const stripEmoji = useCallback(
    (text: string): string => {
      if (!preferences.calmMode) return text;
      return text.replace(emojiRegex, '').replace(/\s{2,}/g, ' ').trim();
    },
    [preferences.calmMode]
  );

  return (
    <PreferencesContext.Provider value={{ preferences, reduceMotion, setPreferences, isHydrated, stripEmoji }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
