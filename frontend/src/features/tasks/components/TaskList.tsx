import { useCallback, type ReactNode } from 'react';
import { PebbleCharacter } from '@/features/companion';
import { Button } from '@/shared/ui';
import { REORDER_HINT, useReorder } from '../hooks/useReorder';
import type { Task } from '../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  open: Task[];
  done: Task[];
  onToggle: (id: string) => void;
  onToggleStep: (taskId: string, stepId: string) => void;
  onShowSteps: (id: string, shown: boolean) => void;
  onWhyOpen: (id: string) => void;
  onEdit?: (id: string) => void;
  /** With it, the open tasks can be reordered (by keyboard or drag); called with the new order of the open ones. */
  onReorderOpen?: (openIds: string[]) => void;
  /** Offered when the list is empty: fills it with example tasks to look around with. */
  onAddExamples?: () => void;
  /** Shown between the open tasks and the done ones: where a new task goes. */
  addTask?: ReactNode;
  /** Shown when a filter hides every task. */
  emptyFilter?: ReactNode;
}

/** The list view: what's left to do (reorderable), then what's done today. */
export default function TaskList({
  open,
  done,
  onAddExamples,
  addTask,
  emptyFilter,
  onReorderOpen,
  ...handlers
}: TaskListProps) {
  const empty = open.length === 0 && done.length === 0;
  const titleOf = useCallback((id: string) => open.find((t) => t.id === id)?.title ?? '', [open]);
  const { order, draggingId, handleProps, announcement } = useReorder(
    open.map((t) => t.id),
    titleOf,
    onReorderOpen ?? (() => {}),
  );
  const byId = new Map(open.map((t) => [t.id, t]));
  const ordered = order.map((id) => byId.get(id)!).filter(Boolean);

  return (
    <>
      <section className="task-group" aria-labelledby="group-open">
        <h2 id="group-open" className="task-group__title">
          To do <span className="task-group__count">{open.length}</span>
        </h2>
        {ordered.length > 0 && (
          <div className="task-group__list" data-reorder-list>
            {ordered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                {...handlers}
                reorder={
                  onReorderOpen && ordered.length > 1
                    ? { handleProps: handleProps(task.id), dragging: draggingId === task.id }
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {empty && (emptyFilter ?? (
          <div className="task-empty">
            <PebbleCharacter mood="normal" size="small" />
            <p>All clear! Add a task when you&apos;re ready, or just rest.</p>
            {onAddExamples && (
              <Button variant="quiet" onClick={onAddExamples}>
                Add example tasks
              </Button>
            )}
          </div>
        ))}

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

      <p id="reorder-hint" className="ui-visually-hidden">
        {REORDER_HINT}
      </p>
      <p className="ui-visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
