'use client';

import { useState } from 'react';
import { usePreferences } from '@/shared/preferences';
import { isAcceptedUpload } from '../lib/upload';

export default function UploadZone({ onUpload }: { onUpload?: (file: File) => void }) {
  const { reduceMotion } = usePreferences();
  const noMotion = reduceMotion;
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (isAcceptedUpload(file)) onUpload?.(file);
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
        width: '100%', minHeight: 180, padding: 20,
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
        aria-label="Upload a document"
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
