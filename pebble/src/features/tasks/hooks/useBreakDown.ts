'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** How long the "breaking it down" shimmer shows before the steps appear. */
export const BREAK_DOWN_MS = 1500;

/**
 * Showing a task's steps. With animations on, a shimmer plays first; with
 * reduce-animations on, the steps appear at once.
 */
export function useBreakDown(initiallyShown: boolean, noMotion: boolean, onShown: () => void) {
  const [showSteps, setShowSteps] = useState(initiallyShown);
  const [breaking, setBreaking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const breakDown = useCallback(() => {
    if (noMotion) {
      setShowSteps(true);
      onShown();
      return;
    }
    setBreaking(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setBreaking(false);
      setShowSteps(true);
      onShown();
    }, BREAK_DOWN_MS);
  }, [noMotion, onShown]);

  return { showSteps, breaking, breakDown };
}
