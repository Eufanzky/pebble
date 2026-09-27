'use client';

import { usePreferences } from '@/contexts/PreferencesContext';
import type { DocumentItem } from '../types';

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
        width: '100%', minHeight: 180, padding: '20px 22px',
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
        <div style={{
          fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
          marginTop: 10, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
        }}>
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
