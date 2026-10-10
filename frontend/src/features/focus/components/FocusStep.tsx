import Link from 'next/link';
import { Button } from '@/shared/ui';

interface FocusStepProps {
  /** The step and its task, or `missing` when the link names a step that isn't there. */
  step: { title: string; taskTitle: string; completed: boolean } | 'missing';
  /** A session was finished or stopped: the step can be marked done. */
  ended: boolean;
  onDone: () => void;
}

/** What this session is for (9.2): one step of a task, and after it, the choice to mark it done. */
export default function FocusStep({ step, ended, onDone }: FocusStepProps) {
  if (step === 'missing') {
    return (
      <p className="focus-step focus-note" role="status">
        That step isn&apos;t on your list any more. You can still focus here.
      </p>
    );
  }
  return (
    <div className="focus-step">
      <p className="focus-step__title">
        <span className="focus-step__label">Working on: </span>
        {step.title}
      </p>
      <p className="focus-step__task">{step.taskTitle}</p>
      {ended && (
        <div className="focus-controls">
          {step.completed ? (
            <p className="focus-note" role="status">
              Step done.
            </p>
          ) : (
            <Button variant="primary" onClick={onDone}>
              Mark this step done
            </Button>
          )}
          <Link href="/today" className="ui-button ui-button--ghost ui-button--md">
            Back to Today
          </Link>
        </div>
      )}
    </div>
  );
}
