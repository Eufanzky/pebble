'use client';

import { useState, useCallback } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { TAG_CONFIG, PRIORITY_CONFIG } from '@/data/sampleTasks';
import WhyCard from './WhyCard';
import type { Task } from '@/lib/types';
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
  const { preferences, stripEmoji } = usePreferences();
  const [breaking, setBreaking] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(task.showSubtasks ?? false);
  const [ripple, setRipple] = useState(false);

  const tag = TAG_CONFIG[task.tag];
  const priority = PRIORITY_CONFIG[task.priority];
  const noMotion = preferences.reduceAnimations;
  const calm = preferences.calmMode;

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const canBreakDown = hasSubtasks && !showSubtasks && !breaking;
  const showWhy = task.whyExplanation && (showSubtasks || !hasSubtasks);
  const isAdapted = ADAPTED_TASK_IDS.has(task.id);

  const handleBreakDown = useCallback(() => {
    if (noMotion) {
      setShowSubtasks(true);
      onBreakDown(task.id);
      return;
    }
    setBreaking(true);
    setTimeout(() => {
      setBreaking(false);
      setShowSubtasks(true);
      onBreakDown(task.id);
    }, 1500);
  }, [noMotion, onBreakDown, task.id]);

  const handleCheckboxClick = () => {
    if (!noMotion) {
      setRipple(true);
      setTimeout(() => setRipple(false), 400);
    }
    onToggle(task.id);
  };

  const tagLabel = calm ? stripEmoji(tag.label) : `${tag.emoji} ${tag.label}`;

  return (
    <div
      className={`task-card ${task.completed ? 'completed' : ''}`}
      style={{ '--tag-color': tag.color, '--priority-color': priority.color } as React.CSSProperties}
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
            {task.completed && '\u2713'}
          </button>
          {ripple && <span className="checkbox-ripple" />}
        </div>

        {/* Center content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
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
            {isAdapted && (
              <span
                className="adapted-badge"
                title="Pebble adjusted the chunk size based on your recent activity"
              >
                Adapted for you
              </span>
            )}
          </div>

          {/* Shimmer loading */}
          {breaking && (
            <div style={{ marginTop: 12, paddingLeft: 36 }}>
              <div className="shimmer-bar" />
              <div className="shimmer-bar" />
              <div className="shimmer-bar" />
            </div>
          )}

          {/* Subtasks */}
          {showSubtasks && hasSubtasks && !breaking && (
            <div className="subtask-list">
              {task.subtasks!.map((st, i) => (
                <div
                  key={st.id}
                  className={`subtask-item ${noMotion ? '' : 'animate-in'}`}
                  style={noMotion ? undefined : { animationDelay: `${i * 150}ms` }}
                >
                  <button
                    className={`subtask-checkbox ${st.completed ? 'checked' : ''} ${st.completed && !noMotion ? 'animate' : ''}`}
                    onClick={() => onToggleSubtask(task.id, st.id)}
                    aria-label={st.completed ? 'Uncheck subtask' : 'Check subtask'}
                  >
                    {st.completed && '\u2713'}
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
          )}

          {/* Why card */}
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
            <button className="break-btn" onClick={handleBreakDown}>
              <span className="sparkle">&#10022;</span>
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
