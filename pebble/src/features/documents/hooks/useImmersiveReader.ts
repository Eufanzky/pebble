'use client';

import { useEffect, useState } from 'react';
import { launchImmersiveReader } from '../api/immersiveReader';

type ReaderStatus = 'loading' | 'azure' | 'built-in';

/**
 * Tries Azure Immersive Reader when mounted, and falls back to the built-in
 * reader when it isn't available.
 */
export function useImmersiveReader(text: string, title: string, lang: string, onExit: () => void) {
  const [status, setStatus] = useState<ReaderStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    launchImmersiveReader(text, title, lang, onExit).then((launched) => {
      if (!cancelled) setStatus(launched ? 'azure' : 'built-in');
    });
    return () => {
      cancelled = true;
    };
  }, [text, title, lang, onExit]);

  return status;
}
