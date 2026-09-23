'use client';

import { useSyncExternalStore } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

export function useReduceMotion(): boolean {
  const { preferences } = usePreferences();
  const osPreference = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );

  return preferences.reduceAnimations || osPreference;
}
