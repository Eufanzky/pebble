import { PebbleCharacter } from '@/features/companion';
import type { Task } from '../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  open: Task[];
  done: Task[];
  onToggle: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onBreakDown: (id: string) => void;
  onWhyOpen: (id: string) => void;
  /** Offered when the list is empty: fills it with example tasks to look around with. */
  onAddExamples?: () => void;
}

/** The list view: open tasks, then the ones done today. */
export default function TaskList({ open, done, onAddExamples, ...handlers }: TaskListProps) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {open.map((task) => <TaskCard key={task.id} task={task} {...handlers} />)}
      </div>

      {open.length === 0 && done.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <PebbleCharacter mood="normal" size="small" />
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
            All clear! Add a task when you&apos;re ready, or just rest.
          </p>
          {onAddExamples && (
            <button
              type="button"
              onClick={onAddExamples}
              style={{
                marginTop: 14,
                padding: '8px 18px',
                borderRadius: 999,
                border: '1px solid var(--pebble-color)',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add example tasks
            </button>
          )}
        </div>
      )}

      {done.length > 0 && (
        <>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--text-muted)',
            marginTop: 24,
            marginBottom: 10,
            paddingLeft: 4,
          }}>
            done today
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {done.map((task) => <TaskCard key={task.id} task={task} {...handlers} />)}
          </div>
        </>
      )}
    </>
  );
}
