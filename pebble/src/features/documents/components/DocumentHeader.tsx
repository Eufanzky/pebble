import type { DocumentItem } from '../types';

export default function DocumentHeader({ doc, onClose }: { doc: DocumentItem; onClose: () => void }) {
  return (
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
        onClick={onClose}
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
  );
}
