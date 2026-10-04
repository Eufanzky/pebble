'use client';

import { createContext, useContext, useEffect, useCallback, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { PEBBLE_COLORS } from '@/shared/preferences';
import type { UserPreferences } from '@/shared/preferences';
import { getPreferences, patchPreferences } from './api';

const PREFERENCES_KEY = ['preferences'] as const;
/** This device's copy of the account's preferences, so they apply before the server answers. */
const PREFERENCES_CACHE = 'pebble-preferences-cache';

export const defaultPreferences: UserPreferences = {
  readingLevel: 5,
  chunkSize: 'medium',
  reduceAnimations: false,
  calmMode: false,
  pebbleColor: 'lavender',
  pebblePersonality: 'gentle',
  pebbleModel: 'chonky-plus',
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

interface PreferencesProviderProps {
  children: ReactNode;
  /** Only this device's copy, never the account's (the sign-in page, before anyone is signed in). */
  offline?: boolean;
}

/**
 * The account's preferences (`/api/preferences`), with a copy on this device
 * so colour and motion apply on the first paint. A change applies at once and
 * is saved in the background; what the server sends on load never undoes a
 * change made on this device since.
 */
export function PreferencesProvider({ children, offline = false }: PreferencesProviderProps) {
  const [stored, setStored, isHydrated] = useLocalStorage<UserPreferences>(PREFERENCES_CACHE, defaultPreferences);
  // Saved preferences may predate a setting, or be damaged: fill the gaps
  const preferences = useMemo(() => ({ ...defaultPreferences, ...stored }), [stored]);

  const client = useQueryClient();
  const server = useQuery({ queryKey: PREFERENCES_KEY, queryFn: getPreferences, staleTime: Infinity, enabled: !offline });
  const changedHere = useRef(new Set<keyof UserPreferences>());
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    if (!server.data) return;
    const fromServer = server.data;
    setStored((prev) => {
      const next = { ...defaultPreferences, ...prev, ...fromServer };
      for (const key of changedHere.current) (next as Record<string, unknown>)[key] = prev[key];
      return next;
    });
  }, [server.data, setStored]);

  const setPreferences = useCallback(
    (value: UserPreferences | ((prev: UserPreferences) => UserPreferences)) => {
      const current = { ...defaultPreferences, ...stored };
      const next = { ...defaultPreferences, ...(value instanceof Function ? value(current) : value) };
      const changes = Object.fromEntries(
        (Object.keys(next) as (keyof UserPreferences)[])
          .filter((key) => next[key] !== current[key])
          .map((key) => [key, next[key]]),
      ) as Partial<UserPreferences>;
      setStored(next);
      if (offline || Object.keys(changes).length === 0) return;
      for (const key of Object.keys(changes)) changedHere.current.add(key as keyof UserPreferences);
      queue.current = queue.current
        .then(() => patchPreferences(changes))
        .catch(() => {
          // Not saved: the account's copy of these settings wins again
          const known = client.getQueryData<UserPreferences>(PREFERENCES_KEY);
          const keys = Object.keys(changes) as (keyof UserPreferences)[];
          for (const key of keys) changedHere.current.delete(key);
          if (known) setStored((prev) => ({ ...prev, ...Object.fromEntries(keys.map((key) => [key, known[key]])) }));
          void client.invalidateQueries({ queryKey: PREFERENCES_KEY });
        });
    },
    [stored, setStored, offline, client],
  );

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
