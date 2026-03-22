'use client';

import { useState, useEffect } from 'react';

export function useReduceMotion(userPreference: boolean): boolean {
  const [osPreference, setOsPreference] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOsPreference(mq.matches);
    const handler = (e: MediaQueryListEvent) => setOsPreference(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return userPreference || osPreference;
}
