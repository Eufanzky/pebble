import type { Subtask } from '../types';

interface SubtaskListProps {
  subtasks: Subtask[];
  noMotion: boolean;
  onToggle: (subtaskId: string) => void;
}

/** A task's steps, each with its own tick. */
export default function SubtaskList({ subtasks, noMotion, onToggle }: SubtaskListProps) {
  return (
    <ul className="subtask-list">
      {subtasks.map((st, i) => (
        <li
          key={st.id}
          className={`subtask-item ${noMotion ? '' : 'animate-in'}`}
          style={noMotion ? undefined : { animationDelay: `${i * 90}ms` }}
        >
          <button
            className={`subtask-checkbox ${st.completed ? 'checked' : ''} ${st.completed && !noMotion ? 'animate' : ''}`}
            onClick={() => onToggle(st.id)}
            aria-label={st.completed ? 'Uncheck subtask' : 'Check subtask'}
          >
            <span aria-hidden="true">{st.completed && '✓'}</span>
          </button>
          <span className={`subtask-title ${st.completed ? 'done' : ''}`}>{st.title}</span>
          {st.timeEstimate && <span className="subtask-estimate">{st.timeEstimate}</span>}
        </li>
      ))}
    </ul>
  );
}
