'use client';

import { TAG_CONFIG } from '../lib/tags';
import type { Task } from '../types';
import RoadmapNode from './RoadmapNode';

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
          <span style={{ fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--accent-lavender)' }}>
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
          fontVariantNumeric: 'tabular-nums', fontSize: 10, fontWeight: 700,
          color: allDone ? 'var(--accent-lavender)' : 'var(--text-muted)',
        }}>
          {allDone ? 'All done!' : 'Finish'}
        </div>
      </div>
    </div>
  );
}
