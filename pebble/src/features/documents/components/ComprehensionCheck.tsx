'use client';

import type { CSSProperties } from 'react';
import { usePreferences } from '@/shared/preferences';
import { useComprehensionCheck } from '../hooks/useComprehensionCheck';
import type { ComprehensionQuestion } from '../types';
import MiniPebble from './MiniPebble';

interface Props {
  question: ComprehensionQuestion;
  docTitle: string;
}

export default function ComprehensionCheck({ question, docTitle }: Props) {
  const { reduceMotion } = usePreferences();
  const noMotion = reduceMotion;
  const { options, answered, answer, feedback } = useComprehensionCheck(question, docTitle);

  const optionStyle = (option: string): CSSProperties => {
    const isCorrect = option === question.correctAnswer;
    let bg = 'var(--glass-bg)';
    let border = '1px solid var(--glass-border)';
    if (isCorrect && answered === 'correct') { bg = 'rgba(143,175,138,0.2)'; border = '1px solid var(--accent-sage)'; }
    if (!isCorrect && answered === 'wrong') { bg = 'rgba(232,133,106,0.15)'; border = '1px solid var(--accent-coral)'; }
    return {
      flex: 1, padding: '10px 14px', borderRadius: 10, background: bg, border,
      cursor: answered ? 'default' : 'pointer', fontFamily: 'var(--font-nunito)',
      fontSize: 13, color: 'var(--text-primary)', textAlign: 'left', lineHeight: 1.4,
      transition: noMotion ? 'none' : 'all 0.2s ease',
    };
  };

  return (
    <div style={{ padding: '16px 18px', background: 'rgba(255,248,235,0.05)', borderRadius: 12, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <MiniPebble />
        <span style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--text-secondary)' }}>
          Let&apos;s see how that landed:
        </span>
      </div>

      <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.4 }}>
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
          <MiniPebble />
          <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}
