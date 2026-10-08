import type { TimeLeft } from '../lib/deadline';

/**
 * Time left until a task's due day ends, as a calm bar (8.3): one quiet tone the whole way, with no
 * colour change near the end and no red. Once the day is over, `StillOpen` takes its place (8.4).
 */
export default function DueBar({ time }: { time: TimeLeft }) {
  return (
    <div className="due-bar">
      <div
        className="due-bar__track"
        role="meter"
        aria-label="Time left"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(time.left * 100)}
        aria-valuetext={time.label}
      >
        <div className="due-bar__fill" style={{ width: `${time.left * 100}%` }} />
      </div>
      <span className="due-bar__label">{time.label}</span>
    </div>
  );
}
