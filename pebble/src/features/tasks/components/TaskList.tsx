import type { ReactNode } from 'react';
import { PebbleCharacter } from '@/features/companion';
import { Button } from '@/shared/ui';
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
  /** Shown between the open tasks and the done ones: where a new task goes. */
  addTask?: ReactNode;
}

/** The list view: what's left to do, then what's done today. */
export default function TaskList({ open, done, onAddExamples, addTask, ...handlers }: TaskListProps) {
  const empty = open.length === 0 && done.length === 0;

  return (
    <>
      <section className="task-group" aria-labelledby="group-open">
        <h2 id="group-open" className="task-group__title">
          To do <span className="task-group__count">{open.length}</span>
        </h2>
        {open.length > 0 && (
          <div className="task-group__list">
            {open.map((task) => (
              <TaskCard key={task.id} task={task} {...handlers} />
            ))}
          </div>
        )}

        {empty && (
          <div className="task-empty">
            <PebbleCharacter mood="normal" size="small" />
            <p>All clear! Add a task when you&apos;re ready, or just rest.</p>
            {onAddExamples && (
              <Button variant="quiet" onClick={onAddExamples}>
                Add example tasks
              </Button>
            )}
          </div>
        )}

        {addTask}
      </section>

      {done.length > 0 && (
        <section className="task-group" aria-labelledby="group-done">
          <h2 id="group-done" className="task-group__title">
            Done today <span className="task-group__count">{done.length}</span>
          </h2>
          <div className="task-group__list">
            {done.map((task) => (
              <TaskCard key={task.id} task={task} {...handlers} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
