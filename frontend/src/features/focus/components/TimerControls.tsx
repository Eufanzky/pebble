import { Button } from '@/shared/ui';
import type { TimerState } from '../hooks/useFocusTimer';

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function TimerControls({ state, onStart, onPause, onResume, onStop }: TimerControlsProps) {
  if (state === 'idle') {
    return (
      <Button variant="primary" onClick={onStart}>
        Start focus session
      </Button>
    );
  }
  return (
    <div className="focus-controls">
      {state === 'running' ? (
        <Button variant="quiet" onClick={onPause}>
          Pause
        </Button>
      ) : (
        <Button variant="primary" onClick={onResume}>
          Resume
        </Button>
      )}
      <Button variant="ghost" onClick={onStop}>
        Stop
      </Button>
    </div>
  );
}
