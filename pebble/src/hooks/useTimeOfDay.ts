'use client';

import { useState, useEffect } from 'react';
import type { TimeOfDay } from '@/lib/types';

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 5) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 19) return 'day';
  if (hour < 22) return 'evening';
  return 'night';
}

export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return timeOfDay;
}
