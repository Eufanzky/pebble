import { MAX_LEVEL, MIN_LEVEL, sliderFill } from '../lib/readingLevel';

interface ReadingLevelSliderProps {
  level: number;
  onChange: (level: number) => void;
}

export default function ReadingLevelSlider({ level, onChange }: ReadingLevelSliderProps) {
  const fill = sliderFill(level);
  return (
    <>
      <label htmlFor="modal-reading-level" title="Based on Flesch-Kincaid readability grades" style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: 'help', borderBottom: '1px dotted var(--text-muted)' }}>
        Complexity (FK)
      </label>
      <input
        id="modal-reading-level"
        type="range" min={MIN_LEVEL} max={MAX_LEVEL} value={level}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`Reading level ${level} of ${MAX_LEVEL}`}
        style={{
          flex: 1, height: 4, appearance: 'none', WebkitAppearance: 'none',
          background: `linear-gradient(to right, var(--accent-lavender) ${fill}%, var(--border-soft) ${fill}%)`,
          borderRadius: 2, outline: 'none', cursor: 'pointer', minWidth: 100,
        }}
      />
      <span aria-hidden="true" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--accent-lavender)', minWidth: 16, textAlign: 'center' }}>
        {level}
      </span>
    </>
  );
}
