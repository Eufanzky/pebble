'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const RIPPLE_MS = 400;

/** A short ripple on the checkbox, skipped when animations are reduced. */
export function useRipple(noMotion: boolean) {
  const [ripple, setRipple] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const trigger = useCallback(() => {
    if (noMotion) return;
    setRipple(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setRipple(false), RIPPLE_MS);
  }, [noMotion]);

  return { ripple, trigger };
}
