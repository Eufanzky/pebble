'use client';

import { useState } from 'react';
import { levelNote } from '../lib/readingLevel';
import type { DocumentItem } from '../types';
import ComprehensionPrompt from './ComprehensionPrompt';
import LevelNote from './LevelNote';

interface ReaderViewProps {
  doc: DocumentItem;
  text: string;
  textVersion: number;
  level: number;
  defaultLevel: number;
  calm: boolean;
  noMotion: boolean;
}

/** One column: Pebble's version, with the original folded away. */
export default function ReaderView({ doc, text, textVersion, level, defaultLevel, calm, noMotion }: ReaderViewProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div style={{ padding: '20px 28px 28px' }}>
      <LevelNote text={levelNote(level, defaultLevel, true)} compact={false} />

      <div
        key={textVersion}
        data-testid="simplified-text"
        style={{
          fontFamily: 'var(--font-nunito)', fontSize: 15, color: 'var(--text-primary)',
          lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 20,
          animation: noMotion ? 'none' : 'docFadeIn 0.4s ease',
        }}
      >
        {text}
      </div>

      <button
        onClick={() => setShowOriginal(!showOriginal)}
        aria-expanded={showOriginal}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', marginBottom: 8,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 10, transition: noMotion ? 'none' : 'transform 0.2s', transform: showOriginal ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>{'▶'}</span>
        {showOriginal ? 'Hide original text' : 'Show original text'}
      </button>

      {showOriginal && (
        <div style={{
          fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--text-muted)',
          lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 20,
          padding: '16px 18px', background: 'rgba(255,248,235,0.03)', borderRadius: 12,
          borderLeft: '2px solid var(--border-soft)',
        }}>
          {doc.original}
        </div>
      )}

      <ComprehensionPrompt doc={doc} calm={calm} />
    </div>
  );
}
