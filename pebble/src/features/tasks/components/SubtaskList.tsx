import type { Subtask } from '../types';

interface SubtaskListProps {
  subtasks: Subtask[];
  noMotion: boolean;
  onToggle: (subtaskId: string) => void;
}

export default function SubtaskList({ subtasks, noMotion, onToggle }: SubtaskListProps) {
  return (
    <div className="subtask-list">
      {subtasks.map((st, i) => (
        <div
          key={st.id}
          className={`subtask-item ${noMotion ? '' : 'animate-in'}`}
          style={noMotion ? undefined : { animationDelay: `${i * 150}ms` }}
        >
          <button
            className={`subtask-checkbox ${st.completed ? 'checked' : ''} ${st.completed && !noMotion ? 'animate' : ''}`}
            onClick={() => onToggle(st.id)}
            aria-label={st.completed ? 'Uncheck subtask' : 'Check subtask'}
          >
            {st.completed && '✓'}
          </button>
          <span
            className={`subtask-title ${st.completed ? 'done' : ''}`}
            style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}
          >
            {st.title}
          </span>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
            {st.timeEstimate}
          </span>
        </div>
      ))}
    </div>
  );
}
