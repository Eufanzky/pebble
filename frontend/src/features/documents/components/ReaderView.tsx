'use client';

import { useState } from 'react';
import { levelNote } from '../lib/readingLevel';
import type { DocumentText } from '../hooks/useDocumentText';
import type { DocumentItem } from '../types';
import ComprehensionPrompt from './ComprehensionPrompt';
import LevelNote from './LevelNote';
import SimplifiedText from './SimplifiedText';

interface ReaderViewProps {
  doc: DocumentItem;
  simplified: DocumentText;
  textVersion: number;
  level: number;
  defaultLevel: number;
  calm: boolean;
  noMotion: boolean;
}

/** One column: Pebble's version, with the original folded away. */
export default function ReaderView({ doc, simplified, textVersion, level, defaultLevel, calm, noMotion }: ReaderViewProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div style={{ padding: '20px 28px 28px' }}>
      <LevelNote text={levelNote(level, defaultLevel, true)} compact={false} />

      <SimplifiedText simplified={simplified} level={level} textVersion={textVersion} noMotion={noMotion} marginBottom={20} />

      <button
        onClick={() => setShowOriginal(!showOriginal)}
        aria-expanded={showOriginal}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--color-text-3)',
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', marginBottom: 8,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 10, transition: noMotion ? 'none' : 'transform 0.2s', transform: showOriginal ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>{'▶'}</span>
        {showOriginal ? 'Hide original text' : 'Show original text'}
      </button>

      {showOriginal && (
        <div style={{
          fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--color-text-3)',
          lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 20,
          padding: '16px 18px', background: 'rgba(255,248,235,0.03)', borderRadius: 12,
          borderLeft: '2px solid var(--color-line)',
        }}>
          {doc.original}
        </div>
      )}

      <ComprehensionPrompt doc={doc} calm={calm} />
    </div>
  );
}
