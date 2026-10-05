import { levelNote } from '../lib/readingLevel';
import type { DocumentText } from '../hooks/useDocumentText';
import type { DocumentItem } from '../types';
import ComprehensionPrompt from './ComprehensionPrompt';
import LevelNote from './LevelNote';
import SimplifiedText from './SimplifiedText';

interface SplitViewProps {
  doc: DocumentItem;
  simplified: DocumentText;
  textVersion: number;
  level: number;
  defaultLevel: number;
  calm: boolean;
  noMotion: boolean;
}

const heading = {
  fontFamily: 'var(--font-baloo)', fontSize: 13, marginBottom: 12, paddingBottom: 8,
  borderBottom: '1px solid var(--color-line)',
} as const;

const scrollColumn = { overflowY: 'auto', scrollbarWidth: 'thin' } as const;

/** The original on the left, Pebble's version on the right. */
export default function SplitView({ doc, simplified, textVersion, level, defaultLevel, calm, noMotion }: SplitViewProps) {
  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '45% 55%', minHeight: 0 }}>
      <div style={{
        ...scrollColumn, padding: '20px 20px 20px 28px',
        borderRight: '1px solid rgba(255,248,235,0.06)', scrollbarColor: 'rgba(196,181,212,0.1) transparent',
      }}>
        <h3 style={{ ...heading, color: 'var(--color-text-3)' }}>Original</h3>
        <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {doc.original}
        </div>
      </div>

      <div style={{ ...scrollColumn, padding: '20px 28px 20px 20px', scrollbarColor: 'rgba(196,181,212,0.2) transparent' }}>
        <h3 style={{ ...heading, color: 'var(--color-accent)' }}>
          {calm ? "Pebble's version" : "Pebble's version ✦"} — Level {level}
        </h3>
        <SimplifiedText simplified={simplified} level={level} textVersion={textVersion} noMotion={noMotion} />

        <LevelNote text={levelNote(level, defaultLevel, false)} compact />

        <div style={{ marginTop: 16 }}>
          <ComprehensionPrompt doc={doc} calm={calm} />
        </div>
      </div>
    </div>
  );
}
