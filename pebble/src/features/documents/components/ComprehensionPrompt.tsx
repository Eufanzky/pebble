'use client';

import { useState } from 'react';
import type { DocumentItem } from '../types';
import ComprehensionCheck from './ComprehensionCheck';

/** "Check my understanding", which opens the comprehension check. */
export default function ComprehensionPrompt({ doc, calm }: { doc: DocumentItem; calm: boolean }) {
  const [open, setOpen] = useState(false);

  if (!doc.comprehensionQuestion.question) return null;
  if (open) return <ComprehensionCheck question={doc.comprehensionQuestion} docTitle={doc.title} />;

  return (
    <button onClick={() => setOpen(true)} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--text-muted)',
      display: 'flex', alignItems: 'center', gap: 4, padding: '8px 0', minHeight: 44,
    }}>
      <span style={{ fontSize: 14 }} aria-hidden="true">{calm ? '?' : '💡'}</span>
      Check my understanding
    </button>
  );
}
