import { PebbleCharacter } from '@/features/companion';

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
      style={{ marginTop: 16, padding: '20px 24px', borderLeft: '3px solid var(--color-tag-wellbeing)' }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flexShrink: 0 }}>
          <PebbleCharacter mood="normal" size="small" />
        </div>
        <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>
          That sounds really hard. It&apos;s okay to step back. Would you like me to clear today&apos;s tasks and start smaller?
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, paddingLeft: 0 }}>
        <button
          onClick={onStartFresh}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(143,175,138,0.2)', color: 'var(--color-tag-wellbeing)',
            fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600,
          }}
        >
          Clear and start fresh
        </button>
        <button
          onClick={onKeepGoing}
          style={{
            padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
            background: 'transparent', border: '1px solid var(--color-line)',
            color: 'var(--color-text-2)', fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600,
          }}
        >
          I&apos;m okay, keep going
        </button>
      </div>
    </div>
  );
}
