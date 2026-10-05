'use client';

import { useCallback, useState } from 'react';
import { useActivityLog } from '@/features/activity';
import { usePreferences } from '@/shared/preferences';
import { useDocumentText } from './useDocumentText';
import type { DocumentItem } from '../types';

/**
 * The reading level shown for a document. It starts at the user's default;
 * each change is logged as AdaptLens, since it's a signal about the user.
 */
export function useReadingLevel(doc: DocumentItem) {
  const { preferences } = usePreferences();
  const { addEntry } = useActivityLog();
  const [level, setLevelState] = useState(preferences.readingLevel);
  const simplified = useDocumentText(doc, level);
  // Bumped on every change so the text fades in again
  const [version, setVersion] = useState(0);

  const setLevel = useCallback(
    (next: number) => {
      addEntry('AdaptLens', `Reading level adjusted to ${next} for "${doc.title}"`, `User manually changed reading level from ${level} to ${next}.`);
      setLevelState(next);
      setVersion((v) => v + 1);
    },
    [addEntry, doc.title, level],
  );

  return {
    level,
    setLevel,
    version,
    defaultLevel: preferences.readingLevel,
    simplified,
  };
}
