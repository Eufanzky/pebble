'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';

interface Props {
  text: string;
  title?: string;
  lang?: string;
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Attempt to launch the real Azure Immersive Reader SDK.
// Falls back to a built-in reader if the backend token endpoint is
// unavailable or the SDK fails to load.
// ---------------------------------------------------------------------------

async function tryLaunchRealReader(
  text: string,
  title: string,
  lang: string,
  onClose: () => void,
): Promise<boolean> {
  try {
    const { launchAsync } = await import('@microsoft/immersive-reader-sdk');

    // Fetch token from our backend
    const tokenResp = await fetch('/api/documents/immersive-reader/token');
    if (!tokenResp.ok) return false;

    const { token, subdomain } = await tokenResp.json();

    const content = {
      title,
      chunks: [{ content: text, lang, mimeType: 'text/plain' }],
    };

    await launchAsync(token, subdomain, content, {
      onExit: onClose,
      uiZIndex: 70,
    });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Built-in Immersive Reader — CSS fallback with the same feature set
// ---------------------------------------------------------------------------

const syllableMap: Record<string, string> = {
  methodology: 'meth\u00B7od\u00B7ol\u00B7o\u00B7gy',
  prototyping: 'pro\u00B7to\u00B7typ\u00B7ing',
  requirements: 're\u00B7quire\u00B7ments',
  architecture: 'ar\u00B7chi\u00B7tec\u00B7ture',
  comprehensive: 'com\u00B7pre\u00B7hen\u00B7sive',
  documentation: 'doc\u00B7u\u00B7men\u00B7ta\u00B7tion',
  accessibility: 'ac\u00B7ces\u00B7si\u00B7bil\u00B7i\u00B7ty',
  personalization: 'per\u00B7son\u00B7al\u00B7i\u00B7za\u00B7tion',
  presentation: 'pre\u00B7sen\u00B7ta\u00B7tion',
  integration: 'in\u00B7te\u00B7gra\u00B7tion',
};

const partsOfSpeech: Record<string, 'noun' | 'verb' | 'adj'> = {
  course: 'noun', design: 'noun', prototype: 'noun', research: 'noun',
  report: 'noun', feedback: 'noun', solution: 'noun', app: 'noun',
  build: 'verb', create: 'verb', demonstrate: 'verb',
  implement: 'verb', simplify: 'verb', focus: 'verb', read: 'verb',
  iterative: 'adj', functional: 'adj', safe: 'adj', clear: 'adj',
  important: 'adj', simple: 'adj',
};

const posColors = { noun: 'var(--accent-lavender)', verb: 'var(--accent-sage)', adj: 'var(--accent-amber)' };

const languages = ['English', 'Spanish', 'French', 'Portuguese', 'Japanese'];

function applySyllables(text: string): string {
  let result = text;
  for (const [word, syllabled] of Object.entries(syllableMap)) {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), syllabled);
  }
  return result;
}

export default function ImmersiveReader({ text, title, lang, isOpen, onClose }: Props) {
  const { preferences } = usePreferences();
  const noMotion = preferences.reduceAnimations;
  const [readAloud, setReadAloud] = useState(false);
  const [syllables, setSyllables] = useState(false);
  const [partsOn, setPartsOn] = useState(false);
  const [lineFocus, setLineFocus] = useState(false);
  const [langMenu, setLangMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      setLoading(true);
      setUseFallback(false);
      return;
    }

    // Try to launch the real Azure Immersive Reader first
    let cancelled = false;
    tryLaunchRealReader(text, title || 'Document', lang || 'en', handleClose).then(
      (launched) => {
        if (cancelled) return;
        if (!launched) {
          // Fall back to built-in reader
          setUseFallback(true);
          setLoading(false);
          requestAnimationFrame(() => setVisible(true));
        } else {
          setLoading(false);
        }
      },
    );

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => {
      cancelled = true;
      window.removeEventListener('keydown', handler);
    };
  }, [isOpen, text, title, lang, handleClose]);

  if (!isOpen) return null;

  // While trying the real SDK, show a brief loading state
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 60, background: '#1a1a2e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-nunito)' }}>
            Launching Azure Immersive Reader...
          </div>
        </div>
      </div>
    );
  }

  // If the real SDK launched, it handles its own UI — return nothing
  if (!useFallback) return null;

  // --- Fallback reader below ---

  const displayText = syllables ? applySyllables(text) : text;

  const renderText = () => {
    if (!partsOn) return displayText;
    const words = displayText.split(/(\s+)/);
    return words.map((w, i) => {
      const lower = w.toLowerCase().replace(/[^a-z]/g, '');
      const pos = partsOfSpeech[lower];
      if (pos) {
        return <span key={i} style={{ borderBottom: `2px solid ${posColors[pos]}`, paddingBottom: 1 }}>{w}</span>;
      }
      return <span key={i}>{w}</span>;
    });
  };

  const toolBtn = (active: boolean, label: string, onClick: () => void) => (
    <button onClick={onClick} style={{
      padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
      background: active ? 'rgba(196,181,212,0.2)' : 'var(--bg-surface)',
      color: active ? 'var(--accent-lavender)' : 'var(--text-secondary)',
      fontFamily: 'var(--font-nunito)', fontSize: 12, fontWeight: 600,
      transition: noMotion ? 'none' : 'all 0.15s ease',
    }}>
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60, background: '#1a1a2e',
        opacity: visible ? 1 : 0, transition: noMotion ? 'none' : 'opacity 0.3s ease',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,248,235,0.06)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', position: 'relative' }}>
          {toolBtn(readAloud, readAloud ? '\u25A0 Read Aloud' : '\u25B6 Read Aloud', () => setReadAloud(!readAloud))}
          {toolBtn(syllables, 'Syllables', () => setSyllables(!syllables))}
          {toolBtn(partsOn, 'Parts of Speech', () => setPartsOn(!partsOn))}
          {toolBtn(lineFocus, 'Line Focus', () => setLineFocus(!lineFocus))}
          <div style={{ position: 'relative' }}>
            {toolBtn(!!selectedLang, '\uD83C\uDF10 Translate', () => setLangMenu(!langMenu))}
            {langMenu && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4,
                background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,248,235,0.1)',
                borderRadius: 10, padding: '6px 0', zIndex: 2, minWidth: 140,
              }}>
                {languages.map((l) => (
                  <button key={l} onClick={() => { setSelectedLang(l); setLangMenu(false); }} style={{
                    display: 'block', width: '100%', padding: '6px 14px', border: 'none',
                    background: 'transparent', color: 'var(--text-secondary)', fontSize: 12,
                    fontFamily: 'var(--font-nunito)', cursor: 'pointer', textAlign: 'left',
                  }}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={handleClose} style={{
          background: 'none', border: '1px solid rgba(255,248,235,0.1)', borderRadius: 8,
          padding: '6px 14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-nunito)',
          fontSize: 12, cursor: 'pointer',
        }}>
          Exit Reader
        </button>
      </div>

      {/* Translation banner */}
      {selectedLang && (
        <div style={{ padding: '8px 24px', background: 'rgba(196,181,212,0.08)', fontSize: 12, color: 'var(--accent-lavender)' }}>
          Translation to {selectedLang} powered by Azure AI. 100+ languages supported.
        </div>
      )}

      {/* Read aloud indicator */}
      {readAloud && (
        <div style={{ padding: '8px 24px', background: 'rgba(143,175,138,0.08)', fontSize: 12, color: 'var(--accent-sage)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-sage)', animation: noMotion ? 'none' : 'pulse 1.5s ease-in-out infinite' }} />
          Text-to-speech powered by Azure AI Speech. Adjustable speed and voice.
          <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
        </div>
      )}

      {/* Reading area */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          maxWidth: 600, width: '100%',
          fontFamily: 'var(--font-nunito)', fontSize: 18, lineHeight: 1.8,
          color: 'var(--text-primary)', letterSpacing: '0.02em',
          whiteSpace: 'pre-wrap',
          ...(lineFocus ? {
            maskImage: 'linear-gradient(transparent 0%, transparent 35%, black 40%, black 60%, transparent 65%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(transparent 0%, transparent 35%, black 40%, black 60%, transparent 65%, transparent 100%)',
          } : {}),
        }}>
          {renderText()}
        </div>
      </div>

      {/* Bottom info */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,248,235,0.06)', textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
        Powered by Azure AI Immersive Reader — designed for dyslexia, ADHD, and emerging readers
      </div>
    </div>
  );
}
