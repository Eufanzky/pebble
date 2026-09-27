'use client';

import { useCallback, type CSSProperties } from 'react';
import { usePreferences } from '@/shared/preferences';
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

// Tasks with subtasks are "adapted" by AdaptLens
const ADAPTED_TASK_IDS = new Set(['task-1', 'task-3']);

export default function TaskCard({ task, onToggle, onToggleSubtask, onBreakDown, onWhyOpen }: TaskCardProps) {
  const { preferences, reduceMotion, stripEmoji } = usePreferences();
  const noMotion = reduceMotion;
  const calm = preferences.calmMode;

  const onShown = useCallback(() => onBreakDown(task.id), [onBreakDown, task.id]);
  const { showSteps, breaking, breakDown } = useBreakDown(task.showSubtasks ?? false, noMotion, onShown);
  const { ripple, trigger: triggerRipple } = useRipple(noMotion);

  const tag = TAG_CONFIG[task.tag];
  const priority = PRIORITY_CONFIG[task.priority];
  const subtasks = task.subtasks ?? [];
  const hasSubtasks = subtasks.length > 0;
  const canBreakDown = hasSubtasks && !showSteps && !breaking;
  const showWhy = task.whyExplanation && (showSteps || !hasSubtasks);
  const tagLabel = calm ? stripEmoji(tag.label) : `${tag.emoji} ${tag.label}`;

  const handleCheckboxClick = () => {
    triggerRipple();
    onToggle(task.id);
  };

  return (
    <div
      className={`task-card ${task.completed ? 'completed' : ''}`}
      style={{ '--tag-color': tag.color, '--priority-color': priority.color } as CSSProperties}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Checkbox with ripple */}
        <div className="checkbox-wrapper">
          <button
            className={`task-checkbox ${task.completed ? 'checked' : ''}`}
            onClick={handleCheckboxClick}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
            style={noMotion && task.completed ? { animation: 'none' } : undefined}
          >
            {task.completed && '✓'}
          </button>
          {ripple && <span className="checkbox-ripple" />}
        </div>

        {/* Center content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 6 }}>
            <span
              className="task-title"
              style={{
                fontFamily: 'var(--font-nunito)',
                fontSize: 15,
                fontWeight: 600,
                color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                lineHeight: 1.4,
              }}
            >
              {task.title}
              {task.completed && (
                <span className={`task-title-strike ${noMotion ? 'instant' : 'animate'}`} />
              )}
            </span>
          </div>

          {/* Meta row: tag + time + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              className="task-tag"
              style={{ background: `color-mix(in srgb, ${tag.color} 20%, transparent)`, color: tag.color }}
            >
              {tagLabel}
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--text-secondary)' }}>
              {task.timeEstimate}
            </span>
            {ADAPTED_TASK_IDS.has(task.id) && (
              <span
                className="adapted-badge"
                title="Pebble adjusted the chunk size based on your recent activity"
              >
                Adapted for you
              </span>
            )}
          </div>

          {breaking && (
            <div style={{ marginTop: 12, paddingLeft: 36 }} role="status" aria-label="Breaking it down">
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
            <WhyCard
              explanation={task.whyExplanation!}
              onOpen={() => onWhyOpen?.(task.id)}
            />
          )}
        </div>

        {/* Right side: priority dot + break down button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingTop: 2 }}>
          {canBreakDown && !task.completed && (
            <button
              className="break-btn"
              onClick={breakDown}
              aria-label={`Break down "${task.title}" into subtasks`}
            >
              <span className="sparkle" aria-hidden="true">&#10022;</span>
              Break it down
            </button>
          )}
          <div
            className="priority-dot"
            style={{ background: priority.color }}
            title={`${priority.label} priority`}
          />
        </div>
      </div>
    </div>
  );
}
