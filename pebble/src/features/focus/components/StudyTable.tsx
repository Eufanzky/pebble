/** The sample room drawn as a table with three people at it. */
export default function StudyTable({ noMotion }: { noMotion: boolean }) {
  const typing = noMotion ? '' : 'typing';
  return (
    <div style={{ flex: '1 1 260px', maxWidth: 320 }}>
      <div className="study-table-scene" aria-hidden="true">
        <div className="study-table">
          <div className="study-table-grain" />
          <div className="study-table-lamp" />
        </div>

        <div className={`study-seat study-seat-1 ${typing}`} style={{ top: 16, left: '50%', transform: 'translateX(-50%)' }} />
        <div className={`study-seat study-seat-2 ${typing}`} style={{ bottom: 16, left: 40 }} />
        <div className={`study-seat study-seat-3 ${typing}`} style={{ bottom: 16, right: 40 }} />

        <div className="study-seat-empty" style={{ top: '50%', left: 12, transform: 'translateY(-50%)' }} />
        <div className="study-seat-empty" style={{ top: '50%', right: 12, transform: 'translateY(-50%)' }} />
      </div>

      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
        3 people focusing
      </div>
    </div>
  );
}
