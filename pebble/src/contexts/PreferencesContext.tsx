'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { UserPreferences } from '@/lib/types';

const defaultPreferences: UserPreferences = {
  personality: 'gentle',
  pebbleColor: '#C4B5D4',
  pebbleDark: '#A89ABC',
  readingLevel: 5,
  chunkSize: 'medium',
  reduceAnimations: false,
  calmMode: false,
};

interface PreferencesContextValue {
  preferences: UserPreferences;
  setPreferences: (value: UserPreferences | ((prev: UserPreferences) => UserPreferences)) => void;
  isHydrated: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences, isHydrated] = useLocalStorage<UserPreferences>(
    'pebble_preferences',
    defaultPreferences
  );

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences, isHydrated }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
