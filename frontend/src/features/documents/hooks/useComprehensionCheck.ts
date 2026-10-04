'use client';

import { useState } from 'react';
import { useActivityLog } from '@/features/activity';
import type { ComprehensionQuestion } from '../types';

type Answer = 'correct' | 'wrong' | null;

/**
 * A two-choice question after reading. The order of the choices is random per
 * mount; only the first answer counts, and it's logged either way.
 */
export function useComprehensionCheck(question: ComprehensionQuestion, docTitle: string) {
  const { addEntry } = useActivityLog();
  const [answered, setAnswered] = useState<Answer>(null);
  const [correctFirst] = useState(() => Math.random() > 0.5);

  const options = correctFirst
    ? [question.correctAnswer, question.wrongAnswer]
    : [question.wrongAnswer, question.correctAnswer];

  const answer = (choice: string) => {
    if (answered) return;
    const isCorrect = choice === question.correctAnswer;
    setAnswered(isCorrect ? 'correct' : 'wrong');
    addEntry(
      'PebbleVoice',
      isCorrect
        ? `Comprehension check passed for "${docTitle}"`
        : `Comprehension check for "${docTitle}" — offered to simplify further`,
      isCorrect
        ? 'User demonstrated understanding of key concept.'
        : 'User selected alternative answer. Offered re-reading at simpler level.',
    );
  };

  const feedback = answered === 'correct' ? question.pebbleCorrect : answered === 'wrong' ? question.pebbleWrong : null;

  return { options, answered, answer, feedback };
}
