'use client';

import { useCallback } from 'react';
import { usePreferences } from '@/shared/preferences';
import { Button, Chip } from '@/shared/ui';
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
}

/** One task: tick it off, see its steps and why Pebble suggested them. */
export default function TaskCard({ task, onToggle, onToggleSubtask, onBreakDown, onWhyOpen }: TaskCardProps) {
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
    <article className={`task-card ${task.completed ? 'completed' : ''}`} data-tag={task.tag} aria-label={task.title}>
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
