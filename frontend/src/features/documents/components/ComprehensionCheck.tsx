'use client';

import type { CSSProperties } from 'react';
import { usePreferences } from '@/shared/preferences';
import { useComprehensionCheck } from '../hooks/useComprehensionCheck';
import type { ComprehensionQuestion } from '../types';
import { PebbleFace } from '@/features/companion';

interface Props {
  question: ComprehensionQuestion;
}

export default function ComprehensionCheck({ question }: Props) {
  const { reduceMotion } = usePreferences();
  const noMotion = reduceMotion;
  const { options, answered, answer, feedback } = useComprehensionCheck(question);

  const optionStyle = (option: string): CSSProperties => {
    const isCorrect = option === question.correctAnswer;
    let bg = 'var(--color-surface-2)';
    let border = '1px solid var(--color-line)';
    if (isCorrect && answered === 'correct') { bg = 'rgba(143,175,138,0.2)'; border = '1px solid var(--color-tag-wellbeing)'; }
    if (!isCorrect && answered === 'wrong') { bg = 'rgba(232,133,106,0.15)'; border = '1px solid var(--color-tag-project)'; }
    return {
      flex: 1, padding: '10px 14px', borderRadius: 10, background: bg, border,
      cursor: answered ? 'default' : 'pointer', fontFamily: 'var(--font-nunito)',
      fontSize: 13, color: 'var(--color-text)', textAlign: 'left', lineHeight: 1.4,
      transition: noMotion ? 'none' : 'all 0.2s ease',
    };
  };

  return (
    <div style={{ padding: '16px 18px', background: 'rgba(255,248,235,0.05)', borderRadius: 12, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <PebbleFace />
        <span style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--color-text-2)' }}>
          Let&apos;s see how that landed:
        </span>
      </div>

      <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 14, lineHeight: 1.4 }}>
        {question.question}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: answered ? 14 : 0 }}>
        {options.map((option) => (
          <button key={option} style={optionStyle(option)} onClick={() => answer(option)} aria-disabled={answered !== null}>
            {option}
          </button>
        ))}
      </div>

      {feedback !== null && (
        <div role="status" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 12 }}>
          <PebbleFace />
          <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.6 }}>
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}
