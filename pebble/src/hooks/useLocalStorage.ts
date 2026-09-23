'use client';

import { useSyncExternalStore, useCallback } from 'react';

// In-memory copy of each key, read from localStorage once and then kept as the
// source of truth, so snapshots stay referentially stable and writes survive
// quota errors.
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function read<T>(key: string, defaultValue: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (item) value = JSON.parse(item);
  } catch {
    // Use default value on error
  }
  cache.set(key, value);
  return value;
}

function subscribeKey(key: string, onChange: () => void) {
  let set = listeners.get(key);
  if (!set) listeners.set(key, (set = new Set()));
  set.add(onChange);
  return () => {
    set.delete(onChange);
  };
}

const noopSubscribe = () => () => {};

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const subscribe = useCallback((onChange: () => void) => subscribeKey(key, onChange), [key]);

  const storedValue = useSyncExternalStore(
    subscribe,
    () => read(key, defaultValue),
    () => defaultValue
  );

  // false during SSR and hydration, true once the client value is in use
  const isHydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      const prev = read(key, defaultValue);
      const valueToStore = value instanceof Function ? value(prev) : value;
      cache.set(key, valueToStore);
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        // Silently fail on quota errors
      }
      listeners.get(key)?.forEach((notify) => notify());
    },
    [key, defaultValue]
  );

  return [storedValue, setValue, isHydrated] as const;
}
