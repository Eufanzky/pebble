import Link from 'next/link';
import type { Step } from '../types';

interface StepListProps {
  taskId: string;
  steps: Step[];
  noMotion: boolean;
  onToggle: (stepId: string) => void;
}

/** A task's steps, each with its own tick, and an open one with a link to focus on it (9.2). */
export default function StepList({ taskId, steps, noMotion, onToggle }: StepListProps) {
  return (
    <ul className="step-list">
      {steps.map((st, i) => (
        <li
          key={st.id}
          className={`step-item ${noMotion ? '' : 'animate-in'}`}
          style={noMotion ? undefined : { animationDelay: `${i * 90}ms` }}
        >
          <button
            className={`step-checkbox ${st.completed ? 'checked' : ''} ${st.completed && !noMotion ? 'animate' : ''}`}
            onClick={() => onToggle(st.id)}
            aria-label={st.completed ? 'Uncheck step' : 'Check step'}
          >
            <span aria-hidden="true">{st.completed && '✓'}</span>
          </button>
          <span className={`step-title ${st.completed ? 'done' : ''}`}>{st.title}</span>
          {st.timeEstimate && <span className="step-estimate">{st.timeEstimate}</span>}
          {/* A step still being saved has no id the focus screen could find */}
          {!st.completed && !taskId.startsWith('temp-') && !st.id.startsWith('temp-') && (
            <Link
              href={`/focus?task=${encodeURIComponent(taskId)}&step=${encodeURIComponent(st.id)}`}
              className="ui-button ui-button--ghost ui-button--sm step-focus"
              aria-label={`Focus on "${st.title}"`}
            >
              Focus
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
