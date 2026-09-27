'use client';

import { useToast } from '@/shared/ui/ToastContext';

/** Sample AdaptLens adjustments. They are fixed text for now (A-020; 5.3 makes them real). */
export default function AdaptationCards() {
  const { showToast } = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
      {/* Adaptation 1 */}
      <div className="glass-card" style={{ padding: '14px 18px' }}>
        <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(196,181,212,0.15)', color: 'var(--accent-lavender)', marginBottom: 8 }}>
          Adapted for you
        </span>
        <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
          Chunk size &rarr; Small (5-10 min)
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
          You completed 4 out of 4 small tasks yesterday but abandoned 2 medium tasks. Pebble suggested smaller chunks.
        </div>
        <button onClick={() => showToast('Preference restored')} style={{
          padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
          border: '1px solid var(--border-soft)', background: 'transparent',
          color: 'var(--text-muted)', fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 600,
        }}>
          Override
        </button>
      </div>

      {/* Adaptation 2 */}
      <div className="glass-card" style={{ padding: '14px 18px' }}>
        <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(196,181,212,0.15)', color: 'var(--accent-lavender)', marginBottom: 8 }}>
          Adapted for you
        </span>
        <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
          Reading level &rarr; 4
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
          You moved the reading slider down from 5 to 3 twice last session. Pebble lowered your default by 1 level.
        </div>
        <button onClick={() => showToast('Preference restored')} style={{
          padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
          border: '1px solid var(--border-soft)', background: 'transparent',
          color: 'var(--text-muted)', fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 600,
        }}>
          Override
        </button>
      </div>
    </div>
  );
}
