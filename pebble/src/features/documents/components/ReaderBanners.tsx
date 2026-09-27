import { POS_COLORS, POS_LABELS, type POS } from '../lib/partsOfSpeech';
import { LANGUAGES } from '../lib/translation';

export function TranslationBanner({ language, calm }: { language: string; calm: boolean }) {
  return (
    <div style={{ padding: '8px 24px', background: 'rgba(196,181,212,0.08)', fontSize: 12, color: 'var(--accent-lavender)', display: 'flex', alignItems: 'center', gap: 8 }}>
      {!calm && <span aria-hidden="true">{LANGUAGES.find((l) => l.name === language)?.flag}</span>}
      Translated to {language} via Azure AI Translator. 100+ languages supported.
    </div>
  );
}

export function ReadAloudBanner({ word, total, noMotion }: { word: number; total: number; noMotion: boolean }) {
  return (
    <div role="status" style={{ padding: '8px 24px', background: 'rgba(143,175,138,0.08)', fontSize: 12, color: 'var(--accent-sage)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-sage)', animation: noMotion ? 'none' : 'irPulse 1.5s ease-in-out infinite' }} />
      Reading aloud — powered by Azure AI Speech. Word {word} of {total}
      <style>{`@keyframes irPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

export function PartsOfSpeechLegend() {
  return (
    <div style={{ padding: '6px 24px', display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
      {(Object.entries(POS_LABELS) as [POS, string][]).map(([key, label]) => (
        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 3, borderRadius: 1, background: POS_COLORS[key], display: 'inline-block' }} />
          {label}
        </span>
      ))}
    </div>
  );
}
