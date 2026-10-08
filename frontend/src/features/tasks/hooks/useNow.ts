'use client';

import { useEffect, useState } from 'react';

/** The time now, refreshed every minute while `enabled` (a task's time-left bar, 8.3). */
export function useNow(enabled: boolean, every = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(new Date()), every);
    return () => clearInterval(id);
  }, [enabled, every]);
  return now;
}
