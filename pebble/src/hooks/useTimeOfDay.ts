'use client';

import { useSyncExternalStore } from 'react';
import type { TimeOfDay } from '@/lib/types';

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 11) return 'morning';
  if (hour < 19) return 'day';
  return 'evening';
}

function subscribe(onChange: () => void) {
  const interval = setInterval(onChange, 60_000);
  return () => clearInterval(interval);
}

export function useTimeOfDay(): TimeOfDay {
  return useSyncExternalStore(subscribe, getTimeOfDay, () => 'day');
}
