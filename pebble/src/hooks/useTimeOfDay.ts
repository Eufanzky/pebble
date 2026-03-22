'use client';

import { useState, useEffect } from 'react';
import type { TimeOfDay } from '@/lib/types';

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 11) return 'morning';
  if (hour < 19) return 'day';
  return 'evening';
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
