import { RING_CIRCUMFERENCE, RING_RADIUS, formatTime, ringOffset } from '../lib/timer';

/** The countdown: a ring that empties as time passes, with the time left in the middle. */
export default function FocusRing({ secondsLeft, noMotion }: { secondsLeft: number; noMotion: boolean }) {
  return (
    <div className="focus-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="var(--color-line)" strokeWidth="3" />
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
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
      <div className="focus-ring__time" role="timer" aria-label="Time left">
        {formatTime(secondsLeft)}
      </div>
    </div>
  );
}
