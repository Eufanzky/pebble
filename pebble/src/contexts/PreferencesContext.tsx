'use client';

import { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PEBBLE_COLORS } from '@/lib/constants';
import type { UserPreferences } from '@/lib/types';

const defaultPreferences: UserPreferences = {
  readingLevel: 5,
  chunkSize: 'medium',
  reduceAnimations: false,
  calmMode: false,
  pebbleColor: 'lavender',
  pebblePersonality: 'gentle',
  voiceInput: false,
};

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;

interface PreferencesContextValue {
  preferences: UserPreferences;
  setPreferences: (value: UserPreferences | ((prev: UserPreferences) => UserPreferences)) => void;
  isHydrated: boolean;
  stripEmoji: (text: string) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences, isHydrated] = useLocalStorage<UserPreferences>(
    'pebble-preferences',
    defaultPreferences
  );

  // Sync reduce-animations class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-animations', preferences.reduceAnimations);
  }, [preferences.reduceAnimations]);

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
    <PreferencesContext.Provider value={{ preferences, setPreferences, isHydrated, stripEmoji }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
