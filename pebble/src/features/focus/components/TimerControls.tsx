import type { TimerState } from '../hooks/useFocusTimer';

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
}

export default function TimerControls({ state, onStart, onPause, onResume }: TimerControlsProps) {
  if (state === 'running') {
    return <button onClick={onPause} className="focus-btn focus-btn-secondary">Pause</button>;
  }
  if (state === 'paused') {
    return <button onClick={onResume} className="focus-btn focus-btn-primary">Resume</button>;
  }
  return <button onClick={onStart} className="focus-btn focus-btn-primary">Start Focus Session</button>;
}
