import type { Task } from '../types';

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

export default function RoadmapNode({
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
        background: done ? 'var(--color-tag-wellbeing)' : tagColor,
        border: isActive ? `2px solid var(--color-accent)` : '2px solid transparent',
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
      className="ui-card"
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
          color: tagColor, }}>
          {calm ? tagLabel : `${tagEmoji} ${tagLabel}`}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11, color: 'var(--color-text-3)' }}>
          {task.timeEstimate}
        </span>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600, lineHeight: 1.4,
        color: 'var(--color-text)',
        textDecoration: done ? 'line-through' : 'none',
      }}>
        {task.title}
      </div>

      {/* Subtask count */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 4 }}>
          {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} steps
        </div>
      )}
    </button>
  );
}
