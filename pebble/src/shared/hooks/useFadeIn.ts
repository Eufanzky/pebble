'use client';

import { useEffect, useState } from 'react';

/** False on the first frame, then true: lets a CSS transition fade content in. */
export function useFadeIn(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return visible;
}
