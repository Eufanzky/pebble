'use client';

import { useCallback, type HTMLAttributes } from 'react';
import { usePreferences } from '@/shared/preferences';
import { Button, Chip, IconButton } from '@/shared/ui';
import { useBreakDown } from '../hooks/useBreakDown';
import { useRipple } from '../hooks/useRipple';
import { PRIORITY_CONFIG, TAG_CONFIG } from '../lib/tags';
import type { Task } from '../types';
import SubtaskList from './SubtaskList';
import WhyCard from './WhyCard';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onBreakDown: (id: string) => void;
  onWhyOpen?: (id: string) => void;
  /** Opens the edit dialog for this task. */
  onEdit?: (id: string) => void;
  /** Present when the list can be reordered: the move handle's events, and whether this card is being dragged. */
  reorder?: { handleProps: HTMLAttributes<HTMLButtonElement>; dragging: boolean };
}

/** One task: tick it off, see its steps and why Pebble suggested them. */
export default function TaskCard({
  task,
  onToggle,
  onToggleSubtask,
  onBreakDown,
  onWhyOpen,
  onEdit,
  reorder,
}: TaskCardProps) {
  const { reduceMotion } = usePreferences();
  const noMotion = reduceMotion;

  const onShown = useCallback(() => onBreakDown(task.id), [onBreakDown, task.id]);
  const { showSteps, breaking, breakDown } = useBreakDown(task.showSubtasks ?? false, noMotion, onShown);
  const { ripple, trigger: triggerRipple } = useRipple(noMotion);

  const tag = TAG_CONFIG[task.tag];
  const priority = PRIORITY_CONFIG[task.priority];
  const subtasks = task.subtasks ?? [];
  const hasSubtasks = subtasks.length > 0;
  const canBreakDown = hasSubtasks && !showSteps && !breaking && !task.completed;
  const showWhy = task.whyExplanation && (showSteps || !hasSubtasks);
  const stepsDone = subtasks.filter((s) => s.completed).length;

  return (
    <article
      className={`task-card ${task.completed ? 'completed' : ''}`}
      data-tag={task.tag}
      data-task-id={task.id}
      data-dragging={reorder?.dragging || undefined}
      aria-label={task.title}
    >
      <div className="task-card__check">
        <button
          className={`task-checkbox ${task.completed ? 'checked' : ''}`}
          onClick={() => {
            triggerRipple();
            onToggle(task.id);
          }}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <span aria-hidden="true">{task.completed && '✓'}</span>
        </button>
        {ripple && <span className="checkbox-ripple" />}
      </div>

      <div className="task-card__body">
        <p className="task-title">
          {task.title}
          {task.completed && <span className={`task-title-strike ${noMotion ? 'instant' : 'animate'}`} />}
        </p>

        <div className="task-card__meta">
          <Chip tone={tag.tone}>{tag.label}</Chip>
          {task.timeEstimate && <span className="task-card__estimate">{task.timeEstimate}</span>}
          {hasSubtasks && showSteps && (
            <span className="task-card__estimate">
              {stepsDone} of {subtasks.length} steps
            </span>
          )}
          <span className="task-card__priority" style={{ background: priority.color }} aria-hidden="true" />
          <span className="ui-visually-hidden">{priority.label} priority</span>
          {(reorder || onEdit) && (
            <span className="task-card__tools">
              {reorder && (
                <button
                  type="button"
                  className="task-card__handle"
                  aria-label={`Move "${task.title}"`}
                  aria-describedby="reorder-hint"
                  {...reorder.handleProps}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    {[3, 7, 11].flatMap((y) =>
                      [4.5, 9.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="currentColor" />),
                    )}
                  </svg>
                </button>
              )}
              {onEdit && (
                <IconButton label={`Edit "${task.title}"`} onClick={() => onEdit(task.id)}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M10.5 2.5l3 3L6 13H3v-3l7.5-7.5z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
              )}
            </span>
          )}
        </div>

        {canBreakDown && (
          <Button
            variant="quiet"
            size="sm"
            className="task-card__break"
            icon="✦"
            onClick={breakDown}
            aria-label={`Break down "${task.title}" into subtasks`}
          >
            Break it down
          </Button>
        )}

        {breaking && (
          <div className="task-card__shimmer" role="status" aria-label="Breaking it down">
            <div className="shimmer-bar" />
            <div className="shimmer-bar" />
            <div className="shimmer-bar" />
          </div>
        )}

        {showSteps && hasSubtasks && !breaking && (
          <SubtaskList
            subtasks={subtasks}
            noMotion={noMotion}
            onToggle={(subtaskId) => onToggleSubtask(task.id, subtaskId)}
          />
        )}

        {showWhy && !task.completed && (
          <WhyCard explanation={task.whyExplanation!} onOpen={() => onWhyOpen?.(task.id)} />
        )}
      </div>
    </article>
  );
}
