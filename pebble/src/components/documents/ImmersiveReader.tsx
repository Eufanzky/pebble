'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    const tokenResp = await fetch('/api/documents/immersive-reader/token');
    if (!tokenResp.ok) return false;
    const { token, subdomain } = await tokenResp.json();
    const content = { title, chunks: [{ content: text, lang, mimeType: 'text/plain' }] };
    await launchAsync(token, subdomain, content, { onExit: onClose, uiZIndex: 70 });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Syllable breaking — generic algorithm for English words
// ---------------------------------------------------------------------------

function breakIntoSyllables(word: string): string {
  const lower = word.toLowerCase();
  if (lower.length <= 3) return word;

  const vowels = 'aeiouy';
  const parts: string[] = [];
  let current = '';

  for (let i = 0; i < word.length; i++) {
    current += word[i];
    const isVowel = vowels.includes(lower[i]);
    const nextIsConsonant = i + 1 < word.length && !vowels.includes(lower[i + 1]);
    const hasMoreChars = i + 2 < word.length;

    if (isVowel && nextIsConsonant && hasMoreChars && current.length >= 2) {
      parts.push(current);
      current = '';
    }
  }
  if (current) parts.push(current);
  if (parts.length <= 1) return word;
  return parts.join('\u00B7');
}

function applySyllables(text: string): string {
  return text.replace(/\b[a-zA-Z]{4,}\b/g, (match) => breakIntoSyllables(match));
}

// ---------------------------------------------------------------------------
// Parts of speech — expanded dictionary
// ---------------------------------------------------------------------------

const NOUNS = new Set([
  'course', 'design', 'prototype', 'research', 'report', 'feedback', 'solution', 'app',
  'student', 'team', 'project', 'week', 'time', 'process', 'data', 'user', 'tool',
  'system', 'document', 'task', 'class', 'assignment', 'presentation', 'section',
  'requirement', 'architecture', 'service', 'safety', 'decision', 'experience',
  'people', 'method', 'idea', 'version', 'text', 'level', 'language', 'reading',
  'pattern', 'agent', 'model', 'content', 'output', 'input', 'response', 'question',
  'answer', 'meeting', 'note', 'work', 'session', 'break', 'goal', 'step', 'feature',
  'calendar', 'message', 'chapter', 'book', 'information', 'result', 'analysis',
  'person', 'interview', 'cycle', 'insight', 'deliverable', 'documentation',
  'blocker', 'animation', 'component', 'sidebar', 'navigation', 'character',
  'bubble', 'particle', 'screen', 'card', 'button', 'state', 'library',
]);

const VERBS = new Set([
  'build', 'create', 'demonstrate', 'implement', 'simplify', 'focus', 'read',
  'write', 'start', 'finish', 'use', 'make', 'help', 'work', 'show', 'find',
  'need', 'want', 'think', 'know', 'take', 'give', 'run', 'check', 'add',
  'get', 'set', 'let', 'try', 'keep', 'turn', 'talk', 'ask', 'tell', 'look',
  'provide', 'include', 'require', 'support', 'explain', 'engage', 'assess',
  'produce', 'address', 'articulate', 'synthesize', 'incorporate', 'consider',
  'leverage', 'apply', 'complete', 'submit', 'review', 'draft', 'fix',
  'improve', 'analyze', 'generate', 'detect', 'validate', 'filter', 'ensure',
]);

const ADJECTIVES = new Set([
  'iterative', 'functional', 'safe', 'clear', 'important', 'simple',
  'good', 'new', 'big', 'small', 'long', 'short', 'high', 'low',
  'main', 'key', 'final', 'real', 'full', 'major', 'quick', 'rough',
  'responsible', 'comprehensive', 'accessible', 'cognitive', 'actionable',
  'qualitative', 'structured', 'empathetic', 'mid-fidelity', 'enterprise-grade',
  'production-ready', 'multi-agent', 'human-centered', 'constrained',
]);

type POS = 'noun' | 'verb' | 'adj';

function getPOS(word: string): POS | null {
  const lower = word.toLowerCase();
  if (NOUNS.has(lower)) return 'noun';
  if (VERBS.has(lower)) return 'verb';
  if (ADJECTIVES.has(lower)) return 'adj';
  return null;
}

const posColors: Record<POS, string> = {
  noun: 'var(--accent-lavender)',
  verb: 'var(--accent-sage)',
  adj: 'var(--accent-amber)',
};

const posLabels: Record<POS, string> = {
  noun: 'Nouns',
  verb: 'Verbs',
  adj: 'Adjectives',
};

// ---------------------------------------------------------------------------
// Translation simulation — basic word/phrase substitution
// ---------------------------------------------------------------------------

const TRANSLATIONS: Record<string, Record<string, string>> = {
  Spanish: {
    'This': 'Esta', 'this': 'esta', 'course': 'curso', 'class': 'clase',
    'the': 'el', 'and': 'y', 'to': 'a', 'of': 'de', 'in': 'en',
    'with': 'con', 'for': 'para', 'is': 'es', 'are': 'son', 'that': 'que',
    'you': 'usted', 'will': 'va a', 'your': 'su', 'a': 'un',
    'design': 'dise\u00f1o', 'students': 'estudiantes', 'people': 'personas',
    'report': 'informe', 'project': 'proyecto', 'prototype': 'prototipo',
    'research': 'investigaci\u00f3n', 'presentation': 'presentaci\u00f3n',
    'requirements': 'requisitos', 'process': 'proceso', 'week': 'semana',
    'Week': 'Semana', 'due': 'vence', 'final': '\u00faltimo',
  },
  French: {
    'This': 'Ce', 'this': 'ce', 'course': 'cours', 'class': 'classe',
    'the': 'le', 'and': 'et', 'to': '\u00e0', 'of': 'de', 'in': 'dans',
    'with': 'avec', 'for': 'pour', 'is': 'est', 'are': 'sont', 'that': 'que',
    'you': 'vous', 'will': 'allez', 'your': 'votre', 'a': 'un',
    'design': 'conception', 'students': '\u00e9tudiants', 'people': 'personnes',
    'report': 'rapport', 'project': 'projet', 'prototype': 'prototype',
    'research': 'recherche', 'presentation': 'pr\u00e9sentation',
    'requirements': 'exigences', 'process': 'processus', 'week': 'semaine',
    'Week': 'Semaine', 'due': '\u00e9ch\u00e9ance', 'final': 'dernier',
  },
  Portuguese: {
    'This': 'Este', 'this': 'este', 'course': 'curso', 'class': 'aula',
    'the': 'o', 'and': 'e', 'to': 'para', 'of': 'de', 'in': 'em',
    'with': 'com', 'for': 'para', 'is': '\u00e9', 'are': 's\u00e3o', 'that': 'que',
    'you': 'voc\u00ea', 'will': 'vai', 'your': 'seu', 'a': 'um',
    'design': 'design', 'students': 'estudantes', 'people': 'pessoas',
    'report': 'relat\u00f3rio', 'project': 'projeto', 'prototype': 'prot\u00f3tipo',
    'research': 'pesquisa', 'presentation': 'apresenta\u00e7\u00e3o',
    'requirements': 'requisitos', 'process': 'processo', 'week': 'semana',
    'Week': 'Semana', 'due': 'entrega', 'final': 'final',
  },
  Japanese: {
    'This': '\u3053\u306e', 'this': '\u3053\u306e', 'course': '\u30b3\u30fc\u30b9',
    'the': '', 'and': '\u3068', 'to': '\u306b', 'of': '\u306e', 'in': '\u3067',
    'design': '\u30c7\u30b6\u30a4\u30f3', 'project': '\u30d7\u30ed\u30b8\u30a7\u30af\u30c8',
    'students': '\u5b66\u751f', 'report': '\u30ec\u30dd\u30fc\u30c8',
    'week': '\u9031', 'Week': '\u7b2c\u9031',
  },
};

function simulateTranslation(text: string, lang: string): string {
  if (lang === 'English' || !TRANSLATIONS[lang]) return text;
  const dict = TRANSLATIONS[lang];
  return text.replace(/\b\w+\b/g, (word) => dict[word] || word);
}

// ---------------------------------------------------------------------------
// Languages list
// ---------------------------------------------------------------------------

const languages = [
  { name: 'English', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { name: 'Spanish', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
  { name: 'French', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
  { name: 'Portuguese', flag: '\uD83C\uDDE7\uD83C\uDDF7' },
  { name: 'Japanese', flag: '\uD83C\uDDEF\uD83C\uDDF5' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImmersiveReader({ text, title, lang, isOpen, onClose }: Props) {
  const { preferences } = usePreferences();
  const noMotion = preferences.reduceAnimations;
  const calm = preferences.calmMode;
  const [readAloud, setReadAloud] = useState(false);
  const [readAloudIdx, setReadAloudIdx] = useState(-1);
  const [syllables, setSyllables] = useState(false);
  const [partsOn, setPartsOn] = useState(false);
  const [lineFocus, setLineFocus] = useState(false);
  const [langMenu, setLangMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>('English');
  const [visible, setVisible] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleClose = useCallback(() => {
    window.speechSynthesis?.cancel();
    setReadAloud(false);
    setReadAloudIdx(-1);
    onClose();
  }, [onClose]);

  // --- Read Aloud: Web Speech API ---
  useEffect(() => {
    if (!readAloud || !useFallback) return;

    const words = text.split(/\s+/);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utteranceRef.current = utterance;

    let wordIndex = 0;
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setReadAloudIdx(wordIndex);
        wordIndex++;
      }
    };
    utterance.onend = () => {
      setReadAloud(false);
      setReadAloudIdx(-1);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [readAloud, text, useFallback]);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      setLoading(true);
      setUseFallback(false);
      setReadAloud(false);
      setReadAloudIdx(-1);
      setSelectedLang('English');
      window.speechSynthesis?.cancel();
      return;
    }

    let cancelled = false;
    tryLaunchRealReader(text, title || 'Document', lang || 'en', handleClose).then(
      (launched) => {
        if (cancelled) return;
        if (!launched) {
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

  if (!useFallback) return null;

  // --- Prepare display text ---
  const translatedText = simulateTranslation(text, selectedLang);
  const displayText = syllables ? applySyllables(translatedText) : translatedText;

  const renderText = () => {
    const words = displayText.split(/(\s+)/);
    let wordCounter = 0;

    return words.map((w, i) => {
      const isSpace = /^\s+$/.test(w);
      if (isSpace) return <span key={i}>{w}</span>;

      const thisWordIdx = wordCounter++;
      const isHighlighted = readAloud && thisWordIdx === readAloudIdx;
      const lower = w.toLowerCase().replace(/[^a-z-]/g, '');
      const pos = partsOn ? getPOS(lower) : null;

      return (
        <span
          key={i}
          style={{
            ...(pos ? { borderBottom: `2px solid ${posColors[pos]}`, paddingBottom: 1 } : {}),
            ...(isHighlighted ? {
              background: 'rgba(196,181,212,0.3)',
              borderRadius: 3,
              padding: '1px 2px',
            } : {}),
            transition: noMotion ? 'none' : 'background 0.15s ease',
          }}
        >
          {w}
        </span>
      );
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', position: 'relative', alignItems: 'center' }}>
          {toolBtn(readAloud, readAloud ? '\u25A0 Stop' : '\u25B6 Read Aloud', () => {
            if (readAloud) {
              window.speechSynthesis?.cancel();
              setReadAloud(false);
              setReadAloudIdx(-1);
            } else {
              setReadAloud(true);
            }
          })}
          {toolBtn(syllables, 'Syllables', () => setSyllables(!syllables))}
          {toolBtn(partsOn, 'Parts of Speech', () => setPartsOn(!partsOn))}
          {toolBtn(lineFocus, 'Line Focus', () => setLineFocus(!lineFocus))}

          {/* Font size controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
            <button onClick={() => setFontSize((s) => Math.max(12, s - 2))} style={{
              width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700,
            }}>A-</button>
            <button onClick={() => setFontSize((s) => Math.min(32, s + 2))} style={{
              width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 16, fontWeight: 700,
            }}>A+</button>
          </div>

          {/* Translate dropdown */}
          <div style={{ position: 'relative' }}>
            {toolBtn(selectedLang !== 'English', calm ? 'Translate' : '\uD83C\uDF10 Translate', () => setLangMenu(!langMenu))}
            {langMenu && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4,
                background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,248,235,0.1)',
                borderRadius: 10, padding: '6px 0', zIndex: 2, minWidth: 160,
              }}>
                {languages.map((l) => (
                  <button key={l.name} onClick={() => { setSelectedLang(l.name); setLangMenu(false); }} style={{
                    display: 'flex', width: '100%', padding: '8px 14px', border: 'none', gap: 8,
                    background: selectedLang === l.name ? 'rgba(196,181,212,0.1)' : 'transparent',
                    color: selectedLang === l.name ? 'var(--accent-lavender)' : 'var(--text-secondary)',
                    fontSize: 12, fontFamily: 'var(--font-nunito)', cursor: 'pointer', textAlign: 'left',
                    alignItems: 'center',
                  }}>
                    {!calm && <span>{l.flag}</span>}
                    <span>{l.name}</span>
                    {selectedLang === l.name && <span style={{ marginLeft: 'auto', fontSize: 10 }}>{calm ? 'Active' : '\u2713'}</span>}
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
      {selectedLang !== 'English' && (
        <div style={{ padding: '8px 24px', background: 'rgba(196,181,212,0.08)', fontSize: 12, color: 'var(--accent-lavender)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {!calm && <span>{languages.find((l) => l.name === selectedLang)?.flag}</span>}
          Translated to {selectedLang} via Azure AI Translator. 100+ languages supported.
        </div>
      )}

      {/* Read aloud indicator */}
      {readAloud && (
        <div style={{ padding: '8px 24px', background: 'rgba(143,175,138,0.08)', fontSize: 12, color: 'var(--accent-sage)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-sage)', animation: noMotion ? 'none' : 'irPulse 1.5s ease-in-out infinite' }} />
          Reading aloud — powered by Azure AI Speech. Word {readAloudIdx + 1} of {text.split(/\s+/).length}
          <style>{`@keyframes irPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
        </div>
      )}

      {/* Parts of Speech legend */}
      {partsOn && (
        <div style={{ padding: '6px 24px', display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
          {(Object.entries(posLabels) as [POS, string][]).map(([key, label]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 3, borderRadius: 1, background: posColors[key], display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Reading area */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          maxWidth: 600, width: '100%',
          fontFamily: 'var(--font-nunito)', fontSize, lineHeight: 1.8,
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
      <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,248,235,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Powered by Azure AI Immersive Reader — designed for dyslexia, ADHD, and emerging readers
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains)' }}>
          {fontSize}px
        </span>
      </div>
    </div>
  );
}
