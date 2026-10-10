'use client';

import { useState, type HTMLAttributes } from 'react';
import { usePreferences } from '@/shared/preferences';
import { Button, Chip, IconButton } from '@/shared/ui';
import { useBreakDown } from '../hooks/useBreakDown';
import { useCalendarExport } from '../hooks/useCalendarExport';
import { useNow } from '../hooks/useNow';
import { useStillOpen } from '../hooks/useStillOpen';
import { useRipple } from '../hooks/useRipple';
import { timeLeft } from '../lib/deadline';
import { PRIORITY_CONFIG, TAG_CONFIG } from '../lib/tags';
import type { Task } from '../types';
import DueBar from './DueBar';
import StepList from './StepList';
import StillOpen from './StillOpen';
import WhyCard from './WhyCard';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onToggleStep: (taskId: string, stepId: string) => void;
  /** Show or hide this task's steps. */
  onShowSteps: (id: string, shown: boolean) => void;
  /** Opens the edit dialog for this task. */
  onEdit?: (id: string) => void;
  /** Present when the list can be reordered: the move handle's events, and whether this card is being dragged. */
  reorder?: { handleProps: HTMLAttributes<HTMLButtonElement>; dragging: boolean };
}

/** One task: tick it off, see its steps and why Pebble suggested them. */
export default function TaskCard({
  task,
  onToggle,
  onToggleStep,
  onShowSteps,
  onEdit,
  reorder,
}: TaskCardProps) {
  const { reduceMotion } = usePreferences();
  const noMotion = reduceMotion;

  const breakdown = useBreakDown(task.id, task.title);
  const calendar = useCalendarExport(task);
  const working = breakdown.status === 'working';
  const showSteps = task.showSteps ?? false;
  const { ripple, trigger: triggerRipple } = useRipple(noMotion);

  const tag = TAG_CONFIG[task.tag];
  const priority = PRIORITY_CONFIG[task.priority];
  const steps = task.steps ?? [];
  const hasSteps = steps.length > 0;
  // Only a task without steps can be broken down: CalmSense does it, while the card says so
  const canBreakDown = !hasSteps && !task.completed && !working;
  const showWhy = task.whyExplanation && (showSteps || !hasSteps);
  const stepsDone = steps.filter((s) => s.completed).length;

  // Time left, for an open task with a due day; near the end, Pebble offers CalmSense once (8.3)
  const tracked = Boolean(task.due) && !task.completed;
  const now = useNow(tracked);
  const time = tracked ? timeLeft(task.due!, task.dueSetAt, now) : null;
  const [offerDismissed, setOfferDismissed] = useState(false);
  const offerSmaller = Boolean(time?.near) && canBreakDown && !offerDismissed;
  // Once the day is over: move it, make it smaller, or let it go (8.4)
  const stillOpen = useStillOpen(task);
  const passed = Boolean(time?.passed);

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
          {hasSteps && (
            <span className="task-card__estimate">
              {stepsDone} of {steps.length} steps
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

        {time && !passed && <DueBar time={time} />}

        {passed && (
          <StillOpen
            title={task.title}
            now={now}
            onMove={stillOpen.moveTo}
            onMakeSmaller={canBreakDown ? breakdown.start : undefined}
            onLetGo={stillOpen.letItGo}
          />
        )}

        {offerSmaller && (
          <div className="task-card__offer" role="group" aria-label="Make it smaller">
            <p>Want CalmSense to make this one smaller?</p>
            <Button variant="quiet" size="sm" icon="✦" onClick={breakdown.start}>
              Make it smaller
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOfferDismissed(true)}>
              Not now
            </Button>
          </div>
        )}

        {canBreakDown && !offerSmaller && !passed && (
          <Button
            variant="quiet"
            size="sm"
            className="task-card__break"
            icon="✦"
            onClick={breakdown.start}
            aria-label={`Break down "${task.title}" into steps`}
          >
            Break it down
          </Button>
        )}

        {working && (
          <div className="task-card__shimmer" role="status">
            <span className="task-card__working">CalmSense is breaking it down…</span>
            {!noMotion && (
              <div aria-hidden="true">
                <div className="shimmer-bar" />
                <div className="shimmer-bar" />
                <div className="shimmer-bar" />
              </div>
            )}
          </div>
        )}

        {breakdown.status === 'failed' && (
          <p className="task-card__note" role="status">
            CalmSense couldn&apos;t break this down just now. Try again whenever you&apos;re ready.
          </p>
        )}

        {hasSteps && !task.completed && (
          <Button
            variant="ghost"
            size="sm"
            className="task-card__steps-toggle"
            aria-expanded={showSteps}
            onClick={() => onShowSteps(task.id, !showSteps)}
          >
            {showSteps ? 'Hide steps' : 'Show steps'}
          </Button>
        )}

        {hasSteps && !task.completed && (
          <Button
            variant="ghost"
            size="sm"
            className="task-card__calendar"
            busy={calendar.busy}
            onClick={calendar.save}
            aria-label={`Add the steps of "${task.title}" to your calendar`}
          >
            Add to calendar
          </Button>
        )}

        {showSteps && hasSteps && (
          <StepList
            taskId={task.id}
            steps={steps}
            noMotion={noMotion}
            onToggle={(stepId) => onToggleStep(task.id, stepId)}
          />
        )}

        {showWhy && !task.completed && (
          <WhyCard explanation={task.whyExplanation!} />
        )}
      </div>
    </article>
  );
}
