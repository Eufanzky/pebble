import type { CSSProperties } from 'react';
import ReadingLevelSlider from './ReadingLevelSlider';

export type DocView = 'split' | 'reader';

interface DocumentToolbarProps {
  level: number;
  onLevelChange: (level: number) => void;
  onTasks: () => void;
  /** There are action items to add (SimplifyCore found some, or the example has them). */
  tasksReady: boolean;
  onStudyPlan: () => void;
  onReader: () => void;
  view: DocView;
  onViewChange: (view: DocView) => void;
}

const action: CSSProperties = {
  padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
  background: 'transparent', border: '1px solid var(--color-line)',
  color: 'var(--color-text-3)', fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
};

const divider = <div style={{ width: 1, height: 18, background: 'var(--color-line)', margin: '0 4px' }} />;

/** The reading-level slider, the document actions and the view toggle. */
export default function DocumentToolbar({
  level,
  onLevelChange,
  onTasks,
  tasksReady,
  onStudyPlan,
  onReader,
  view,
  onViewChange,
}: DocumentToolbarProps) {
  const waiting = tasksReady ? {} : { opacity: 0.45, cursor: 'default' };
  return (
    <div style={{ padding: '0 28px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <ReadingLevelSlider level={level} onChange={onLevelChange} />

      {divider}

      <button
        onClick={onTasks}
        disabled={!tasksReady}
        style={{ ...action, border: 'none', background: 'rgba(196,181,212,0.15)', color: 'var(--color-accent)', ...waiting }}
      >
        Tasks
      </button>
      <button onClick={onStudyPlan} disabled={!tasksReady} style={{ ...action, ...waiting }}>
        Study Plan
      </button>
      <button onClick={onReader} style={action}>Reader</button>

      {divider}

      <div style={{ display: 'flex', gap: 2, background: 'var(--color-surface-2)', borderRadius: 6, padding: 2 }}>
        {(['split', 'reader'] as const).map((m) => (
          <button
            key={m}
            onClick={() => onViewChange(m)}
            aria-pressed={view === m}
            style={{
              padding: '3px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
              fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-nunito)',
              background: view === m ? 'rgba(196,181,212,0.2)' : 'transparent',
              color: view === m ? 'var(--color-accent)' : 'var(--color-text-3)',
              textTransform: 'capitalize',
            }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
