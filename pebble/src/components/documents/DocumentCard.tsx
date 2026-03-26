'use client';

import { useState } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import type { DocumentItem } from '@/lib/types';

interface DocumentCardProps {
  document: DocumentItem;
  onClick: () => void;
}

const typeLabels: Record<string, string> = {
  academic: 'Academic',
  technical: 'Technical',
  meeting: 'Meeting transcript',
};

function DocIcon({ type, calm }: { type: string; calm: boolean }) {
  if (!calm) {
    const emoji = type === 'academic' ? '\uD83D\uDCC4' : type === 'technical' ? '\u2699\uFE0F' : '\uD83D\uDCAC';
    return <span style={{ fontSize: 28, opacity: 0.8 }}>{emoji}</span>;
  }
  // CSS shapes for calm mode
  const color = type === 'academic' ? 'var(--accent-lavender)' : type === 'technical' ? 'var(--accent-coral)' : 'var(--accent-amber)';
  return (
    <div style={{ width: 28, height: 32, borderRadius: 4, border: `2px solid ${color}`, opacity: 0.6, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 6, left: 4, right: 4, height: 2, background: color, borderRadius: 1, opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: 12, left: 4, right: 6, height: 2, background: color, borderRadius: 1, opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: 18, left: 4, right: 8, height: 2, background: color, borderRadius: 1, opacity: 0.3 }} />
    </div>
  );
}

export default function DocumentCard({ document: doc, onClick }: DocumentCardProps) {
  const { preferences } = usePreferences();
  const noMotion = preferences.reduceAnimations;

  return (
    <button
      onClick={onClick}
      className="glass-card"
      style={{
        width: '100%', height: 160, padding: '20px 22px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        cursor: 'pointer', textAlign: 'left',
        transition: noMotion ? 'none' : 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!noMotion) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'rgba(255,248,235,0.20)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div>
        <DocIcon type={doc.type} calm={preferences.calmMode} />
        <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 10, lineHeight: 1.3 }}>
          {doc.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
          {typeLabels[doc.type]}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {doc.tags.map((tag) => (
          <span key={tag} style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
            background: 'var(--bg-surface)', color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

export function UploadZone({ onUpload }: { onUpload?: (file: File) => void }) {
  const { preferences } = usePreferences();
  const noMotion = preferences.reduceAnimations;
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      return;
    }
    if (file.size > 10 * 1024 * 1024) return;
    onUpload?.(file);
  };

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      style={{
        width: '100%', height: 160, padding: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        border: `2px dashed ${isDragging ? 'var(--accent-lavender)' : 'var(--border-soft)'}`,
        borderRadius: 16,
        background: isDragging ? 'rgba(196,181,212,0.06)' : 'transparent',
        cursor: 'pointer',
        transition: noMotion ? 'none' : 'border-color 0.2s ease, background 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!noMotion) e.currentTarget.style.borderColor = 'var(--accent-lavender)';
      }}
      onMouseLeave={(e) => {
        if (!isDragging) e.currentTarget.style.borderColor = '';
      }}
    >
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <div style={{ fontSize: 28, color: isDragging ? 'var(--accent-lavender)' : 'var(--text-muted)', opacity: isDragging ? 0.9 : 0.5, fontWeight: 300 }}>+</div>
      <div style={{ fontSize: 12, color: isDragging ? 'var(--accent-lavender)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
        {isDragging ? 'Drop your file here' : 'Upload a PDF, doc, or text file'}
      </div>
    </label>
  );
}
