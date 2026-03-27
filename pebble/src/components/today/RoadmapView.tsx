'use client';

import { TAG_CONFIG } from '@/data/sampleTasks';
import type { Task } from '@/lib/types';

interface RoadmapViewProps {
  tasks: Task[];
  completionPercentage: number;
  onToggle: (id: string) => void;
  calm: boolean;
  noMotion: boolean;
}

export default function RoadmapView({
  tasks,
  completionPercentage,
  onToggle,
  calm,
  noMotion,
}: RoadmapViewProps) {
  const allDone = completionPercentage === 100 && tasks.length > 0;
  const firstIncompleteIdx = tasks.findIndex((t) => !t.completed);

  return (
    <div style={{ position: 'relative', padding: '12px 0 40px' }}>
      {/* ---- Center timeline line ---- */}
      <div
        aria-hidden="true"
        className="roadmap-line"
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: 2,
          transform: 'translateX(-50%)',
          background: 'var(--border-soft)',
          borderRadius: 1,
        }}
      />

      {/* ---- Progress fill on the line ---- */}
      <div
        aria-hidden="true"
        className="roadmap-line"
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: 2,
          transform: 'translateX(-50%)',
          height: `${completionPercentage}%`,
          background: 'var(--accent-lavender)',
          borderRadius: 1,
          transition: noMotion ? 'none' : 'height 0.6s ease',
        }}
      />

      {/* ---- Start node ---- */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--bg-surface)', border: '2px solid var(--accent-lavender)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-jetbrains)', color: 'var(--accent-lavender)' }}>
            GO
          </span>
        </div>
      </div>

      {/* ---- Task nodes ---- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {tasks.map((task, index) => {
          const isLeft = index % 2 === 0;
          const isActive = index === firstIncompleteIdx;
          const tagConf = TAG_CONFIG[task.tag];

          return (
            <RoadmapNode
              key={task.id}
              task={task}
              side={isLeft ? 'left' : 'right'}
              isActive={isActive}
              tagColor={tagConf.color}
              tagLabel={tagConf.label}
              tagEmoji={tagConf.emoji}
              calm={calm}
              noMotion={noMotion}
              onToggle={() => onToggle(task.id)}
            />
          );
        })}
      </div>

      {/* ---- Finish node ---- */}
      <div style={{
        display: 'flex', justifyContent: 'center', marginTop: 32, position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: allDone ? 'var(--accent-lavender)' : 'var(--bg-surface)',
          border: `2px solid ${allDone ? 'var(--accent-lavender)' : 'var(--border-soft)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: allDone ? '0 0 20px rgba(196,181,212,0.4)' : 'none',
          transition: noMotion ? 'none' : 'all 0.4s ease',
        }}>
          {allDone ? (
            <span style={{ fontSize: 20, lineHeight: 1 }}>{calm ? '' : '\u2B50'}</span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <polygon
                points="9,1 11.5,6.5 17,7.2 13,11.1 14,16.5 9,13.8 4,16.5 5,11.1 1,7.2 6.5,6.5"
                stroke="var(--text-muted)"
                strokeWidth="1.2"
                fill="none"
                opacity={0.5}
              />
            </svg>
          )}
        </div>
        <div style={{
          position: 'absolute', top: 52,
          fontFamily: 'var(--font-jetbrains)', fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '1.5px',
          color: allDone ? 'var(--accent-lavender)' : 'var(--text-muted)',
        }}>
          {allDone ? 'All done!' : 'Finish'}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual roadmap node
// ---------------------------------------------------------------------------

interface RoadmapNodeProps {
  task: Task;
  side: 'left' | 'right';
  isActive: boolean;
  tagColor: string;
  tagLabel: string;
  tagEmoji: string;
  calm: boolean;
  noMotion: boolean;
  onToggle: () => void;
}

function RoadmapNode({
  task,
  side,
  isActive,
  tagColor,
  tagLabel,
  tagEmoji,
  calm,
  noMotion,
  onToggle,
}: RoadmapNodeProps) {
  const done = task.completed;

  return (
    <div
      className="roadmap-node"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 0',
        position: 'relative',
      }}
    >
      {/* Left card (or spacer) */}
      <div className="roadmap-card-slot" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingRight: 20 }}>
        {side === 'left' && (
          <NodeCard
            task={task}
            done={done}
            isActive={isActive}
            tagColor={tagColor}
            tagLabel={tagLabel}
            tagEmoji={tagEmoji}
            calm={calm}
            noMotion={noMotion}
            onToggle={onToggle}
          />
        )}
      </div>

      {/* Center dot */}
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        background: done ? 'var(--accent-sage)' : tagColor,
        border: isActive ? `2px solid var(--accent-lavender)` : '2px solid transparent',
        boxShadow: isActive && !noMotion ? `0 0 12px ${tagColor}` : 'none',
        transition: noMotion ? 'none' : 'all 0.3s ease',
        zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {done && (
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <polyline points="2,5.5 4.5,8 8,3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Right card (or spacer) */}
      <div className="roadmap-card-slot" style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', paddingLeft: 20 }}>
        {side === 'right' && (
          <NodeCard
            task={task}
            done={done}
            isActive={isActive}
            tagColor={tagColor}
            tagLabel={tagLabel}
            tagEmoji={tagEmoji}
            calm={calm}
            noMotion={noMotion}
            onToggle={onToggle}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task card within a node
// ---------------------------------------------------------------------------

interface NodeCardProps {
  task: Task;
  done: boolean;
  isActive: boolean;
  tagColor: string;
  tagLabel: string;
  tagEmoji: string;
  calm: boolean;
  noMotion: boolean;
  onToggle: () => void;
}

function NodeCard({ task, done, isActive, tagColor, tagLabel, tagEmoji, calm, noMotion, onToggle }: NodeCardProps) {
  return (
    <button
      onClick={onToggle}
      className="glass-card"
      aria-label={`${done ? 'Undo' : 'Complete'} task: ${task.title}`}
      style={{
        maxWidth: 280,
        width: '100%',
        padding: '14px 16px',
        textAlign: 'left',
        cursor: 'pointer',
        opacity: done ? 0.5 : 1,
        borderColor: isActive ? 'rgba(196,181,212,0.25)' : undefined,
        boxShadow: isActive && !noMotion ? '0 0 16px rgba(196,181,212,0.12)' : undefined,
        transition: noMotion ? 'none' : 'opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Tag + time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
          background: `color-mix(in srgb, ${tagColor} 15%, transparent)`,
          color: tagColor, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          {calm ? tagLabel : `${tagEmoji} ${tagLabel}`}
        </span>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--text-muted)' }}>
          {task.timeEstimate}
        </span>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600, lineHeight: 1.4,
        color: 'var(--text-primary)',
        textDecoration: done ? 'line-through' : 'none',
      }}>
        {task.title}
      </div>

      {/* Subtask count */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} steps
        </div>
      )}
    </button>
  );
}
