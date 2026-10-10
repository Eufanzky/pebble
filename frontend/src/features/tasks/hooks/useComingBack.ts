'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { isComingBack, LAST_VISIT_KEY } from '../lib/welcome';

function readLastVisit(): string | null {
  try {
    return window.localStorage.getItem(LAST_VISIT_KEY);
  } catch {
    return null;
  }
}

function recordVisit() {
  try {
    window.localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
  } catch {
    // Private mode or blocked storage: Today just never opens "fresh"
  }
}

// Read again when the tab comes back into view, so a tab left open for days opens fresh too
function subscribe(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

const getSnapshot = () => isComingBack(readLastVisit(), new Date());

/**
 * Whether Today should open fresh (8.5): the user is back after time away. The visit is recorded when they
 * leave (the tab is hidden or closed), so the fresh start lasts the whole visit, across screens. Not on
 * unmount: React runs cleanups twice in development, which would end it at once.
 */
export function useComingBack(): boolean {
  const comingBack = useSyncExternalStore(subscribe, getSnapshot, () => false);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') recordVisit();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', recordVisit);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', recordVisit);
    };
  }, []);

  return comingBack;
}
