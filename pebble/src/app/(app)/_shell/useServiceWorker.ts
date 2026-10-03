'use client';

import { useEffect } from 'react';

/**
 * Registers /sw.js (roadmap 5.8), which shows the offline page when there's no
 * connection. Production builds only: in development it would get in the way
 * of hot reloading.
 */
export function useServiceWorker(enabled = process.env.NODE_ENV === 'production') {
  useEffect(() => {
    if (!enabled || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, [enabled]);
}
