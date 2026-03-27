'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTasks } from '@/contexts/TasksContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { useToast } from '@/contexts/ToastContext';
import { getTextForLevel } from '@/data/sampleDocuments';
import ComprehensionCheck from './ComprehensionCheck';
import ImmersiveReader from './ImmersiveReader';
import type { DocumentItem } from '@/lib/types';

interface Props {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function DocumentModal({ document: doc, isOpen, onClose }: Props) {
  const router = useRouter();
  const { preferences } = usePreferences();
  const { addTaskFromDocument } = useTasks();
  const { addEntry } = useActivityLog();
  const { showToast } = useToast();
  const noMotion = preferences.reduceAnimations;
  const calm = preferences.calmMode;

  const [level, setLevel] = useState(preferences.readingLevel);
  const [visible, setVisible] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [textKey, setTextKey] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const simplifiedText = getTextForLevel(doc, level);
  const isDefaultLevel = level === preferences.readingLevel;

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => setVisible(true));
      setShowCheck(false);
      setShowOriginal(false);
      setLevel(preferences.readingLevel);
    } else {
      setVisible(false);
    }
  }, [isOpen, preferences.readingLevel]);

  useEffect(() => {
    if (isOpen && visible && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector(FOCUSABLE_SELECTOR) as HTMLElement;
      if (firstFocusable) firstFocusable.focus();
    }
  }, [isOpen, visible]);

  const handleClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => { triggerRef.current?.focus(); });
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleClose(); return; }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    setTextKey((k) => k + 1);
    addEntry('AdaptLens', `Reading level adjusted to ${newLevel} for "${doc.title}"`, `User manually changed reading level from ${level} to ${newLevel}.`);
  };

  const handleTurnIntoTasks = useCallback(() => {
    doc.extractedTasks.forEach((t) => {
      addTaskFromDocument(t.title, doc.title, doc.type === 'meeting' ? 'meeting' : 'academic');
    });
    addEntry('SimplifyCore', `Extracted ${doc.extractedTasks.length} tasks from "${doc.title}" and added to Today`, `Document type: ${doc.type}. Tasks extracted based on action items.`);
    showToast(`Added ${doc.extractedTasks.length} tasks from ${doc.title}`);
    handleClose();
    router.push('/today');
  }, [doc, addTaskFromDocument, addEntry, showToast, handleClose, router]);

  const handleStudyPlan = useCallback(() => {
    doc.extractedTasks.forEach((t, i) => {
      addTaskFromDocument(`Day ${i + 1}: ${t.title}`, doc.title, doc.type === 'meeting' ? 'meeting' : 'academic');
    });
    addEntry('SimplifyCore', `Created study plan from "${doc.title}" — ${doc.extractedTasks.length} reading sessions`, `Sequential study plan generated from document.`);
    showToast(`Created a study plan from ${doc.title}`);
    handleClose();
    router.push('/today');
  }, [doc, addTaskFromDocument, addEntry, showToast, handleClose, router]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(15,13,10,0.85)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          opacity: visible ? 1 : 0,
          transition: noMotion ? 'none' : 'opacity 0.3s ease',
        }}
      />

      {/* Modal — full-height flex layout */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={doc.title}
        ref={modalRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 51,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px 40px',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 940, height: '88vh',
            display: 'flex', flexDirection: 'column',
            background: 'rgba(20,18,14,0.95)', border: '1px solid var(--glass-border)',
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.95)',
            transition: noMotion ? 'none' : 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          {/* ===== STICKY HEADER + CONTROLS ===== */}
          <div style={{ flexShrink: 0, borderBottom: '1px solid rgba(255,248,235,0.06)' }}>
            {/* Title bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 28px 12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: 20, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doc.title}
                </h2>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {doc.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 6, background: 'rgba(196,181,212,0.12)', color: 'var(--accent-lavender)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close document"
                style={{
                  width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border-soft)',
                  background: 'rgba(255,248,235,0.06)', color: 'var(--text-secondary)',
                  fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginLeft: 12,
                }}
              >
                &times;
              </button>
            </div>

            {/* Reading level slider — always visible */}
            <div style={{ padding: '0 28px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <label htmlFor="modal-reading-level" style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Complexity</label>
              <input
                id="modal-reading-level"
                type="range" min={1} max={10} value={level}
                onChange={(e) => handleLevelChange(Number(e.target.value))}
                aria-valuemin={1} aria-valuemax={10} aria-valuenow={level}
                aria-valuetext={`Reading level ${level} of 10`}
                style={{
                  flex: 1, height: 4, appearance: 'none', WebkitAppearance: 'none',
                  background: `linear-gradient(to right, var(--accent-lavender) ${(level - 1) * 11.1}%, var(--border-soft) ${(level - 1) * 11.1}%)`,
                  borderRadius: 2, outline: 'none', cursor: 'pointer', minWidth: 100,
                }}
              />
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--accent-lavender)', minWidth: 16, textAlign: 'center' }}>
                {level}
              </span>

              <div style={{ width: 1, height: 18, background: 'var(--border-soft)', margin: '0 4px' }} />

              {/* Action buttons — inline with slider */}
              <button onClick={handleTurnIntoTasks} style={{
                padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'rgba(196,181,212,0.15)', color: 'var(--accent-lavender)',
                fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                {calm ? 'Tasks' : 'Tasks'}
              </button>
              <button onClick={handleStudyPlan} style={{
                padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                background: 'transparent', border: '1px solid var(--border-soft)',
                color: 'var(--text-muted)', fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                Study Plan
              </button>
              <button onClick={() => { setReaderOpen(true); addEntry('PebbleVoice', `Launched Immersive Reader for "${doc.title}"`, 'Azure AI Immersive Reader launched.'); }} style={{
                padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                background: 'transparent', border: '1px solid var(--border-soft)',
                color: 'var(--text-muted)', fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                {calm ? 'Reader' : 'Reader'}
              </button>
            </div>
          </div>

          {/* ===== SCROLLABLE CONTENT ===== */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px 28px 28px',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(196,181,212,0.2) transparent',
          }}>
            {/* Explainability card */}
            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '10px 14px', background: 'rgba(255,248,235,0.04)',
              borderLeft: '2px solid var(--accent-lavender)', borderRadius: '0 10px 10px 0',
              marginBottom: 20,
            }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--pebble-color)', flexShrink: 0, position: 'relative' }} aria-hidden="true">
                <div style={{ position: 'absolute', width: 3, height: 3, background: '#2A2A2E', borderRadius: '50%', top: 8, left: 5 }} />
                <div style={{ position: 'absolute', width: 3, height: 3, background: '#2A2A2E', borderRadius: '50%', top: 8, right: 5 }} />
              </div>
              <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {isDefaultLevel
                  ? `Simplified to level ${level} (your default). Drag the slider above to adjust.`
                  : `Showing level ${level}. Your default is ${preferences.readingLevel}. Update it in Settings to remember.`}
              </div>
            </div>

            {/* Simplified text (primary) */}
            <div
              key={textKey}
              style={{
                fontFamily: 'var(--font-nunito)', fontSize: 15, color: 'var(--text-primary)',
                lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 20,
                animation: noMotion ? 'none' : 'docFadeIn 0.4s ease',
              }}
            >
              {simplifiedText}
            </div>
            <style>{`@keyframes docFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

            {/* Original text toggle */}
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              aria-expanded={showOriginal}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 10, transition: noMotion ? 'none' : 'transform 0.2s', transform: showOriginal ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>{'\u25B6'}</span>
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

            {/* Comprehension check */}
            {!showCheck && doc.comprehensionQuestion.question && (
              <button onClick={() => setShowCheck(true)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 4, padding: '8px 0',
                minHeight: 44,
              }}>
                <span style={{ fontSize: 14 }} aria-hidden="true">{calm ? '?' : '\uD83D\uDCA1'}</span>
                Check my understanding
              </button>
            )}

            {showCheck && (
              <ComprehensionCheck
                question={doc.comprehensionQuestion.question}
                correctAnswer={doc.comprehensionQuestion.correctAnswer}
                wrongAnswer={doc.comprehensionQuestion.wrongAnswer}
                pebbleCorrect={doc.comprehensionQuestion.pebbleCorrect}
                pebbleWrong={doc.comprehensionQuestion.pebbleWrong}
                docTitle={doc.title}
              />
            )}
          </div>
        </div>
      </div>

      {/* Immersive Reader overlay */}
      <ImmersiveReader text={simplifiedText} title={doc.title} isOpen={readerOpen} onClose={() => setReaderOpen(false)} />
    </>
  );
}
