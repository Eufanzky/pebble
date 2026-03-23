'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Moves focus to the page's <h1> on route change for keyboard/screen reader users.
 * Next.js announces page titles but does NOT move focus automatically.
 */
export function useFocusOnNavigation() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Don't steal focus on initial page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Wait for the page transition to complete before moving focus
    const timeout = setTimeout(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: false });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname]);
}
