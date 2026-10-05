'use client';

import { useCallback, useState } from 'react';
import { usePreferences } from '@/shared/preferences';
import { useDocumentText } from './useDocumentText';
import type { DocumentItem } from '../types';

/**
 * The reading level shown for a document. It starts at the user's default.
 */
export function useReadingLevel(doc: DocumentItem) {
  const { preferences } = usePreferences();
  const [level, setLevelState] = useState(preferences.readingLevel);
  const simplified = useDocumentText(doc, level);
  // Bumped on every change so the text fades in again
  const [version, setVersion] = useState(0);

  const setLevel = useCallback(
    (next: number) => {
      setLevelState(next);
      setVersion((v) => v + 1);
    },
    [],
  );

  return {
    level,
    setLevel,
    version,
    defaultLevel: preferences.readingLevel,
    simplified,
  };
}
