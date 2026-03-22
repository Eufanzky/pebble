'use client';

import { useState, useMemo } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';

interface Props {
  question: string;
  correctAnswer: string;
  wrongAnswer: string;
  pebbleCorrect: string;
  pebbleWrong: string;
  docTitle: string;
}

function MiniPebble() {
  return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--pebble-color)', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', width: 4, height: 4, background: '#2A2A2E', borderRadius: '50%', top: 9, left: 6 }}>
        <div style={{ position: 'absolute', width: 1.5, height: 1.5, background: 'white', borderRadius: '50%', top: 0.5, right: 0.5 }} />
      </div>
      <div style={{ position: 'absolute', width: 4, height: 4, background: '#2A2A2E', borderRadius: '50%', top: 9, right: 6 }}>
        <div style={{ position: 'absolute', width: 1.5, height: 1.5, background: 'white', borderRadius: '50%', top: 0.5, right: 0.5 }} />
      </div>
    </div>
  );
}

export default function ComprehensionCheck({ question, correctAnswer, wrongAnswer, pebbleCorrect, pebbleWrong, docTitle }: Props) {
  const { preferences } = usePreferences();
  const { addEntry } = useActivityLog();
  const noMotion = preferences.reduceAnimations;
  const [answered, setAnswered] = useState<'correct' | 'wrong' | null>(null);

  // Randomize button order once per mount
  const correctFirst = useMemo(() => Math.random() > 0.5, []);
  const optionA = correctFirst ? correctAnswer : wrongAnswer;
  const optionB = correctFirst ? wrongAnswer : correctAnswer;

  const handleAnswer = (choice: string) => {
    if (answered) return;
    const isCorrect = choice === correctAnswer;
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

  const btnStyle = (option: string): React.CSSProperties => {
    const isCorrect = option === correctAnswer;
    let bg = 'var(--glass-bg)';
    let border = '1px solid var(--glass-border)';
    if (answered) {
      if (isCorrect && answered === 'correct') { bg = 'rgba(143,175,138,0.2)'; border = '1px solid var(--accent-sage)'; }
      if (!isCorrect && answered === 'wrong') { bg = 'rgba(232,133,106,0.15)'; border = '1px solid var(--accent-coral)'; }
    }
    return {
      flex: 1, padding: '10px 14px', borderRadius: 10, background: bg, border,
      cursor: answered ? 'default' : 'pointer', fontFamily: 'var(--font-nunito)',
      fontSize: 13, color: 'var(--text-primary)', textAlign: 'left' as const, lineHeight: 1.4,
      transition: noMotion ? 'none' : 'all 0.2s ease',
    };
  };

  return (
    <div style={{
      padding: '16px 18px', background: 'rgba(255,248,235,0.05)',
      borderRadius: 12, marginTop: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <MiniPebble />
        <span style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--text-secondary)' }}>
          Let&apos;s see how that landed:
        </span>
      </div>

      <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.4 }}>
        {question}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: answered ? 14 : 0 }}>
        <button style={btnStyle(optionA)} onClick={() => handleAnswer(optionA)}>{optionA}</button>
        <button style={btnStyle(optionB)} onClick={() => handleAnswer(optionB)}>{optionB}</button>
      </div>

      {answered && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 12 }}>
          <MiniPebble />
          <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {answered === 'correct' ? pebbleCorrect : pebbleWrong}
          </div>
        </div>
      )}
    </div>
  );
}
