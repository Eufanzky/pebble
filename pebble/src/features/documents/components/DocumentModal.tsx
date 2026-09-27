'use client';

import { useRef, useState } from 'react';
import { usePreferences } from '@/shared/preferences';
import { useFadeIn } from '@/shared/hooks/useFadeIn';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useDocumentActions } from '../hooks/useDocumentActions';
import { useReadingLevel } from '../hooks/useReadingLevel';
import type { DocumentItem } from '../types';
import DocumentHeader from './DocumentHeader';
import DocumentToolbar, { type DocView } from './DocumentToolbar';
import ImmersiveReader from './ImmersiveReader';
import ReaderView from './ReaderView';
import SplitView from './SplitView';

interface Props {
  document: DocumentItem;
  onClose: () => void;
}

/** A document, simplified to the user's reading level. Mounted while open. */
export default function DocumentModal({ document: doc, onClose }: Props) {
  const { preferences, reduceMotion } = usePreferences();
  const noMotion = reduceMotion;
  const visible = useFadeIn();
  const modalRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<DocView>('split');
  const [readerOpen, setReaderOpen] = useState(false);

  const { level, setLevel, version, defaultLevel, text } = useReadingLevel(doc);
  const { turnIntoTasks, makeStudyPlan, logReaderOpened } = useDocumentActions(doc, onClose);
  // The reader has its own trap while it's open
  useFocusTrap(modalRef, !readerOpen, onClose);

  const openReader = () => {
    setReaderOpen(true);
    logReaderOpened();
  };

  const viewProps = { doc, text, textVersion: version, level, defaultLevel, calm: preferences.calmMode, noMotion };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(15,13,10,0.85)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          opacity: visible ? 1 : 0,
          transition: noMotion ? 'none' : 'opacity 0.3s ease',
        }}
      />

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
          <div style={{ flexShrink: 0, borderBottom: '1px solid rgba(255,248,235,0.06)' }}>
            <DocumentHeader doc={doc} onClose={onClose} />
            <DocumentToolbar
              level={level}
              onLevelChange={setLevel}
              onTasks={turnIntoTasks}
              onStudyPlan={makeStudyPlan}
              onReader={openReader}
              view={view}
              onViewChange={setView}
            />
          </div>

          <div style={{
            flex: 1, overflowY: view === 'split' ? 'hidden' : 'auto',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(196,181,212,0.2) transparent',
            display: 'flex', flexDirection: 'column',
          }}>
            <style>{`@keyframes docFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            {view === 'split' ? <SplitView {...viewProps} /> : <ReaderView {...viewProps} />}
          </div>
        </div>
      </div>

      {readerOpen && <ImmersiveReader text={text} title={doc.title} onClose={() => setReaderOpen(false)} />}
    </>
  );
}
