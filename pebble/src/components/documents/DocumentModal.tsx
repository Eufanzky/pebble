'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTasks } from '@/contexts/TasksContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { useToast } from '@/contexts/ToastContext';
import { getTextForLevel } from '@/data/sampleDocuments';
import ComprehensionCheck from './ComprehensionCheck';
import ImmersiveReaderMock from './ImmersiveReaderMock';
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

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const simplifiedText = getTextForLevel(doc, level);
  const isDefaultLevel = level === preferences.readingLevel;

  useEffect(() => {
    if (isOpen) {
      // Store the element that triggered the modal
      triggerRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => setVisible(true));
      setShowCheck(false);
      setLevel(preferences.readingLevel);
    } else {
      setVisible(false);
    }
  }, [isOpen, preferences.readingLevel]);

  // Focus the modal when it becomes visible
  useEffect(() => {
    if (isOpen && visible && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector(FOCUSABLE_SELECTOR) as HTMLElement;
      if (firstFocusable) firstFocusable.focus();
    }
  }, [isOpen, visible]);

  const handleClose = useCallback(() => {
    onClose();
    // Return focus to the trigger element
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      // Focus trap: Tab and Shift+Tab cycle within modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        ) as HTMLElement[];
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    setTextKey((k) => k + 1);
    addEntry(
      'AdaptLens',
      `Reading level adjusted to ${newLevel} for "${doc.title}"`,
      `User manually changed reading level from ${level} to ${newLevel}.`
    );
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

      {/* Modal content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={doc.title}
        ref={modalRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 51,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 40,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 900, maxHeight: '85vh', overflowY: 'auto',
            background: 'rgba(20,18,14,0.95)', border: '1px solid var(--glass-border)',
            borderRadius: 20, padding: 36,
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.95)',
            transition: noMotion ? 'none' : 'opacity 0.3s ease, transform 0.3s ease',
            scrollbarWidth: 'thin' as const,
            scrollbarColor: 'rgba(196,181,212,0.2) transparent',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: 22, color: 'var(--text-primary)', marginBottom: 4 }}>
                {doc.title}
              </h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {doc.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(196,181,212,0.12)', color: 'var(--accent-lavender)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close document"
              style={{
                width: 44, height: 44, borderRadius: 10, border: '1px solid var(--border-soft)',
                background: 'rgba(255,248,235,0.06)', color: 'var(--text-secondary)',
                fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              &times;
            </button>
          </div>

          {/* Two-panel layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '45% 55%', gap: 24, marginBottom: 24 }}>
            {/* Left: Original */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-baloo)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-soft)' }}>
                Original
              </h3>
              <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {doc.original}
              </div>
            </div>

            {/* Right: Pebble's version */}
            <div style={{ borderLeft: '1px solid var(--border-soft)', paddingLeft: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-baloo)', fontSize: 16, color: 'var(--accent-lavender)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-soft)' }}>
                {calm ? "Pebble's version" : "Pebble's version \u2726"}
              </h3>
              <div
                key={textKey}
                style={{
                  fontFamily: 'var(--font-nunito)', fontSize: 15, color: 'var(--text-primary)',
                  lineHeight: 1.7, whiteSpace: 'pre-wrap',
                  animation: noMotion ? 'none' : 'fadeIn 0.4s ease',
                }}
              >
                {simplifiedText}
              </div>
              <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
            </div>
          </div>

          {/* Reading level slider */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <label htmlFor="modal-reading-level" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reading complexity</label>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--accent-lavender)' }}>
                Level {level}
              </span>
            </div>
            <input
              id="modal-reading-level"
              type="range" min={1} max={10} value={level}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={level}
              aria-valuetext={`Reading level ${level} of 10`}
              style={{
                width: '100%', height: 4, appearance: 'none', WebkitAppearance: 'none',
                background: `linear-gradient(to right, var(--accent-lavender) ${(level - 1) * 11.1}%, var(--border-soft) ${(level - 1) * 11.1}%)`,
                borderRadius: 2, outline: 'none', cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simple</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clear</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detailed</span>
            </div>
            {/* Dot indicator */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center' }} aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i < level ? 'var(--accent-lavender)' : 'var(--border-soft)',
                  transition: noMotion ? 'none' : 'background 0.15s ease',
                }} />
              ))}
            </div>
          </div>

          {/* Explainability card */}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '12px 16px', background: 'rgba(255,248,235,0.04)',
            borderLeft: '2px solid var(--accent-lavender)', borderRadius: '0 10px 10px 0',
            marginBottom: 20,
          }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--pebble-color)', flexShrink: 0, position: 'relative' }} aria-hidden="true">
              <div style={{ position: 'absolute', width: 4, height: 4, background: '#2A2A2E', borderRadius: '50%', top: 9, left: 6 }} />
              <div style={{ position: 'absolute', width: 4, height: 4, background: '#2A2A2E', borderRadius: '50%', top: 9, right: 6 }} />
            </div>
            <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {isDefaultLevel
                ? `I simplified this to level ${level} because that's your default setting. You can adjust anytime.`
                : `Showing level ${level}. Your default is ${preferences.readingLevel}. I can remember this if you update it in Settings.`}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <button onClick={handleTurnIntoTasks} style={{
              padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'rgba(196,181,212,0.2)', color: 'var(--accent-lavender)',
              fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600,
            }}>
              Turn into tasks
            </button>
            <button onClick={handleStudyPlan} style={{
              padding: '10px 20px', borderRadius: 12, cursor: 'pointer',
              background: 'transparent', border: '1px solid var(--border-soft)',
              color: 'var(--text-secondary)', fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600,
            }}>
              Turn into study plan
            </button>
            <button onClick={() => { setReaderOpen(true); addEntry('PebbleVoice', `Launched Immersive Reader for "${doc.title}"`, 'Azure AI Immersive Reader integration demo.'); }} style={{
              padding: '10px 20px', borderRadius: 12, cursor: 'pointer',
              background: 'transparent', border: '1px solid var(--border-soft)',
              color: 'var(--text-secondary)', fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600,
            }}>
              Immersive Reader
            </button>
          </div>

          {/* Comprehension check toggle */}
          {!showCheck && (
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

      {/* Immersive Reader overlay — tries real Azure SDK, falls back to mock */}
      <ImmersiveReaderMock text={simplifiedText} title={doc.title} isOpen={readerOpen} onClose={() => setReaderOpen(false)} />
    </>
  );
}
