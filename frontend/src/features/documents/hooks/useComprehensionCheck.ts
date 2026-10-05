'use client';

import { useState } from 'react';
import type { ComprehensionQuestion } from '../types';

type Answer = 'correct' | 'wrong' | null;

/**
 * A two-choice question after reading. The order of the choices is random per
 * mount; only the first answer counts.
 */
export function useComprehensionCheck(question: ComprehensionQuestion) {
  const [answered, setAnswered] = useState<Answer>(null);
  const [correctFirst] = useState(() => Math.random() > 0.5);

  const options = correctFirst
    ? [question.correctAnswer, question.wrongAnswer]
    : [question.wrongAnswer, question.correctAnswer];

  const answer = (choice: string) => {
    if (answered) return;
    const isCorrect = choice === question.correctAnswer;
    setAnswered(isCorrect ? 'correct' : 'wrong');
  };

  const feedback = answered === 'correct' ? question.pebbleCorrect : answered === 'wrong' ? question.pebbleWrong : null;

  return { options, answered, answer, feedback };
}
