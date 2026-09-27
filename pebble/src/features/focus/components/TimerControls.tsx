import type { TimerState } from '../hooks/useFocusTimer';

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
}

export default function TimerControls({ state, onStart, onPause, onResume }: TimerControlsProps) {
  if (state === 'running') {
    return <button onClick={onPause} className="study-btn study-btn-secondary">Pause</button>;
  }
  if (state === 'paused') {
    return <button onClick={onResume} className="study-btn study-btn-primary">Resume</button>;
  }
  return <button onClick={onStart} className="study-btn study-btn-primary">Start Focus Session</button>;
}
