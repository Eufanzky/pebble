import { Button } from '@/shared/ui';
import type { TimerState } from '../hooks/useFocusTimer';

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
}

export default function TimerControls({ state, onStart, onPause, onResume }: TimerControlsProps) {
  if (state === 'running') {
    return (
      <Button variant="quiet" onClick={onPause}>
        Pause
      </Button>
    );
  }
  if (state === 'paused') {
    return (
      <Button variant="primary" onClick={onResume}>
        Resume
      </Button>
    );
  }
  return (
    <Button variant="primary" onClick={onStart}>
      Start focus session
    </Button>
  );
}
