'use client';

import { useRef, useState } from 'react';
import { usePreferences } from '@/shared/preferences';
import { useFadeIn } from '@/shared/hooks/useFadeIn';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useReadAloud } from '../hooks/useReadAloud';
import { DEFAULT_FONT_SIZE, displayText, focusPosition, stepFontSize, wordCount } from '../lib/reader';
import LanguageMenu from './LanguageMenu';
import LineFocusOverlay from './LineFocusOverlay';
import { PartsOfSpeechLegend, ReadAloudBanner, TranslationBanner } from './ReaderBanners';
import ReaderText from './ReaderText';
import ToolButton from './ToolButton';

const fontButton = {
  width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
  background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontWeight: 700,
} as const;

/** The reader Pebble ships with, for when Azure Immersive Reader isn't set up. */
export default function BuiltInReader({ text, onClose }: { text: string; onClose: () => void }) {
  const { preferences, reduceMotion } = usePreferences();
  const noMotion = reduceMotion;
  const calm = preferences.calmMode;
  const visible = useFadeIn();
  const ref = useRef<HTMLDivElement>(null);
  const readAloud = useReadAloud(text);

  const [syllables, setSyllables] = useState(false);
  const [partsOn, setPartsOn] = useState(false);
  const [lineFocus, setLineFocus] = useState(false);
  const [focusY, setFocusY] = useState(50);
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  const close = () => {
    readAloud.stop();
    onClose();
  };
  useFocusTrap(ref, true, close);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Reader"
      style={{
        position: 'fixed', inset: 0, zIndex: 60, background: '#1a1a2e',
        opacity: visible ? 1 : 0, transition: noMotion ? 'none' : 'opacity 0.3s ease',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,248,235,0.06)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', position: 'relative', alignItems: 'center' }}>
          <ToolButton active={readAloud.reading} noMotion={noMotion} onClick={readAloud.toggle}>
            {readAloud.reading ? '■ Stop' : '▶ Read Aloud'}
          </ToolButton>
          <ToolButton active={syllables} noMotion={noMotion} onClick={() => setSyllables(!syllables)}>Syllables</ToolButton>
          <ToolButton active={partsOn} noMotion={noMotion} onClick={() => setPartsOn(!partsOn)}>Parts of Speech</ToolButton>
          <ToolButton active={lineFocus} noMotion={noMotion} onClick={() => setLineFocus(!lineFocus)}>Line Focus</ToolButton>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
            <button onClick={() => setFontSize((s) => stepFontSize(s, -1))} aria-label="Smaller text" style={{ ...fontButton, fontSize: 14 }}>A-</button>
            <button onClick={() => setFontSize((s) => stepFontSize(s, 1))} aria-label="Bigger text" style={{ ...fontButton, fontSize: 16 }}>A+</button>
          </div>

          <LanguageMenu selected={language} onSelect={setLanguage} calm={calm} noMotion={noMotion} />
        </div>
        <button onClick={close} style={{
          background: 'none', border: '1px solid rgba(255,248,235,0.1)', borderRadius: 8,
          padding: '6px 14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-nunito)',
          fontSize: 12, cursor: 'pointer',
        }}>
          Exit Reader
        </button>
      </div>

      {language !== 'English' && <TranslationBanner language={language} calm={calm} />}
      {readAloud.reading && (
        <ReadAloudBanner word={readAloud.wordIndex + 1} total={wordCount(text)} noMotion={noMotion} />
      )}
      {partsOn && <PartsOfSpeechLegend />}

      <div
        style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}
        onMouseMove={(e) => {
          if (!lineFocus) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setFocusY(focusPosition(e.clientY, rect.top, rect.height));
        }}
      >
        <div
          data-testid="reader-text"
          style={{
            maxWidth: 600, width: '100%',
            fontFamily: 'var(--font-nunito)', fontSize, lineHeight: 1.8,
            color: 'var(--text-primary)', letterSpacing: '0.02em',
            whiteSpace: 'pre-wrap',
          }}
        >
          <ReaderText
            text={displayText(text, language, syllables)}
            highlightWord={readAloud.reading ? readAloud.wordIndex : null}
            partsOfSpeech={partsOn}
            noMotion={noMotion}
          />
        </div>
        {lineFocus && <LineFocusOverlay focusY={focusY} noMotion={noMotion} />}
      </div>

      <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,248,235,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Pebble&apos;s built-in reader — designed for dyslexia, ADHD, and emerging readers
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {fontSize}px
        </span>
      </div>
    </div>
  );
}
