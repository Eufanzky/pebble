import type { Step } from '../types';

interface StepListProps {
  steps: Step[];
  noMotion: boolean;
  onToggle: (stepId: string) => void;
}

/** A task's steps, each with its own tick. */
export default function StepList({ steps, noMotion, onToggle }: StepListProps) {
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
        </li>
      ))}
    </ul>
  );
}
