import { RING_CIRCUMFERENCE, RING_RADIUS, formatTime, ringOffset } from '../lib/timer';

/** The countdown ring with the time left in the middle. */
export default function FocusRing({ secondsLeft, noMotion }: { secondsLeft: number; noMotion: boolean }) {
  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg viewBox="0 0 120 120" width={120} height={120} aria-hidden="true">
        <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="var(--border-soft)" strokeWidth="4" />
        <circle
          cx="60" cy="60" r={RING_RADIUS}
          fill="none"
          stroke="var(--accent-lavender)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={ringOffset(secondsLeft)}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: noMotion ? 'none' : 'stroke-dashoffset 1s linear',
          }}
        />
      </svg>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-jetbrains)', fontSize: 28, color: 'var(--text-primary)',
        letterSpacing: '1px',
      }}>
        {formatTime(secondsLeft)}
      </div>
    </div>
  );
}
