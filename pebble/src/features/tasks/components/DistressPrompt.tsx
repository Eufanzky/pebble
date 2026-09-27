import PebbleCharacter from '@/components/pebble/PebbleCharacter';

interface DistressPromptProps {
  onStartFresh: () => void;
  onKeepGoing: () => void;
}

/** Offered instead of adding a task when the text reads as distress. */
export default function DistressPrompt({ onStartFresh, onKeepGoing }: DistressPromptProps) {
  return (
    <div
      className="glass-card"
      role="alert"
      aria-live="assertive"
      style={{ marginTop: 16, padding: '20px 24px', borderLeft: '3px solid var(--accent-sage)' }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flexShrink: 0 }}>
          <PebbleCharacter mood="normal" size="small" />
        </div>
        <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          That sounds really hard. It&apos;s okay to step back. Would you like me to clear today&apos;s tasks and start smaller?
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, paddingLeft: 0 }}>
        <button
          onClick={onStartFresh}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(143,175,138,0.2)', color: 'var(--accent-sage)',
            fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600,
          }}
        >
          Clear and start fresh
        </button>
        <button
          onClick={onKeepGoing}
          style={{
            padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
            background: 'transparent', border: '1px solid var(--border-soft)',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600,
          }}
        >
          I&apos;m okay, keep going
        </button>
      </div>
    </div>
  );
}
