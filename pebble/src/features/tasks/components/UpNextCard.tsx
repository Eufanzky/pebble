import { TAG_CONFIG, tagLabel } from '../lib/tags';
import type { Task } from '../types';

interface UpNextCardProps {
  task: Task | undefined;
  calm: boolean;
  noMotion: boolean;
  onStart: (id: string) => void;
}

const sectionLabel = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  color: 'var(--text-muted)',
  marginBottom: 14,
} as const;

/** The next open task, with a button to tick it off. */
export default function UpNextCard({ task, calm, noMotion, onStart }: UpNextCardProps) {
  return (
    <div className="glass-card" style={{ padding: '20px 22px', marginBottom: 16 }}>
      <div style={sectionLabel}>up next</div>

      {task ? (
        <>
          <div style={{
            fontFamily: 'var(--font-baloo)',
            fontSize: 16,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            marginBottom: 6,
          }}>
            {task.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '2px 8px',
              borderRadius: 6,
              background: `color-mix(in srgb, ${TAG_CONFIG[task.tag].color} 20%, transparent)`,
              color: TAG_CONFIG[task.tag].color,
            }}>
              {tagLabel(task.tag, calm)}
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--text-muted)' }}>
              {task.timeEstimate}
            </span>
          </div>
          <button
            onClick={() => onStart(task.id)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-sage), #7A9E76)',
              color: 'var(--bg-deep)',
              fontFamily: 'var(--font-nunito)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: noMotion ? 'none' : 'all 0.2s ease',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              if (!noMotion) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(143,175,138,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            Start this one &rarr;
          </button>
        </>
      ) : (
        <div style={{
          fontFamily: 'var(--font-baloo)',
          fontSize: 16,
          color: 'var(--accent-sage)',
          textAlign: 'center',
          padding: '12px 0',
        }}>
          {calm ? "You're all done!" : "You're all done! 🎉"}
        </div>
      )}
    </div>
  );
}
