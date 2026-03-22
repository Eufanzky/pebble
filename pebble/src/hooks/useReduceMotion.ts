'use client';

import { useState, useEffect } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';

export function useReduceMotion(): boolean {
  const { preferences } = usePreferences();
  const [osPreference, setOsPreference] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOsPreference(mq.matches);
    const handler = (e: MediaQueryListEvent) => setOsPreference(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return preferences.reduceAnimations || osPreference;
}
