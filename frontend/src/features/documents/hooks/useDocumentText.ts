'use client';

import { useCallback, useEffect, useState } from 'react';
import { useActivityLog } from '@/features/activity';
import { simplifyText, type Simplification } from '../api/simplify';
import { getTextForLevel, MAX_LEVEL } from '../lib/readingLevel';
import { excerptForSimplifying } from '../lib/simplify';
import type { DocumentItem, ExtractedTask } from '../types';

/** How long the slider has to rest on a level before SimplifyCore is asked for it. */
const ASK_AFTER_MS = 300;

export interface DocumentText {
  /** `working` while SimplifyCore is asked; `failed` if it couldn't answer (then `retry`). */
  status: 'ready' | 'working' | 'failed';
  /** The text at this level: SimplifyCore's, the example's, or the original. */
  text: string;
  /** Action items that can go on Today. */
  tasks: ExtractedTask[];
  /** WhyBot's explanation of SimplifyCore's version, for the tasks it becomes (none for an example). */
  why: string;
  /** Only the first part of a long upload was simplified. */
  partial: boolean;
  /** SimplifyCore's version may say things the original doesn't. */
  ungrounded: boolean;
  retry: () => void;
}

/**
 * The text a document shows at a reading level. An example has its levels written in advance. An upload asks
 * SimplifyCore for each level once, when the slider rests on it, and keeps the answers while it's open. The
 * original (level 10) needs no asking.
 */
export function useDocumentText(doc: DocumentItem, level: number): DocumentText {
  const [results, setResults] = useState<Record<number, Simplification>>({});
  const [failed, setFailed] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const { refresh: refreshLog } = useActivityLog();
  const asks = doc.source === 'upload' && level < MAX_LEVEL;
  const excerpt = excerptForSimplifying(doc.original);

  useEffect(() => {
    if (!asks || results[level]) return;
    let current = true;
    const timer = setTimeout(() => {
      simplifyText(excerpt.text, level)
        .then(
          (result) => current && setResults((prev) => ({ ...prev, [level]: result })),
          () => current && setFailed(level),
        )
        // The backend logs what SimplifyCore did (or held back): show it
        .finally(refreshLog);
    }, ASK_AFTER_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [asks, level, results, attempt, excerpt.text, refreshLog]);

  const retry = useCallback(() => {
    setFailed(null);
    setAttempt((n) => n + 1);
  }, []);

  if (doc.source !== 'upload') {
    return {
      status: 'ready',
      text: getTextForLevel(doc, level),
      tasks: doc.extractedTasks,
      why: '',
      partial: false,
      ungrounded: false,
      retry,
    };
  }
  // The newest action items SimplifyCore found, at any level
  const known = Object.values(results);
  const latest = known.length > 0 ? known[known.length - 1] : undefined;
  const tasks = latest?.extractedTasks ?? [];
  const why = latest?.whyExplanation ?? '';
  if (!asks) return { status: 'ready', text: doc.original, tasks, why, partial: false, ungrounded: false, retry };
  const result = results[level];
  if (result) {
    return {
      status: 'ready',
      text: result.simplified,
      tasks: result.extractedTasks,
      why: result.whyExplanation,
      partial: excerpt.partial,
      ungrounded: !result.groundedness.grounded,
      retry,
    };
  }
  return {
    status: failed === level ? 'failed' : 'working',
    text: '',
    tasks,
    why,
    partial: excerpt.partial,
    ungrounded: false,
    retry,
  };
}
