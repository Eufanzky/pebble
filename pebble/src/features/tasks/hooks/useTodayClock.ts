'use client';

import { useSyncExternalStore } from 'react';

// Read once per render on the client; the server renders placeholders.
const subscribeNoop = () => () => {};
const getFormattedDate = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const getHour = () => new Date().getHours();

/** Today's date as "Sunday, September 27", and the current hour. */
export function useTodayClock() {
  const formattedDate = useSyncExternalStore(subscribeNoop, getFormattedDate, () => '');
  const hour = useSyncExternalStore(subscribeNoop, getHour, () => 12);
  return { formattedDate, hour };
}
