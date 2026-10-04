/** Darkens everything except a 3-line strip at `focusY` percent. */
export default function LineFocusOverlay({ focusY, noMotion }: { focusY: number; noMotion: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: `linear-gradient(
          to bottom,
          rgba(15,13,10,0.82) 0%,
          rgba(15,13,10,0.82) ${focusY - 8}%,
          transparent ${focusY - 5}%,
          transparent ${focusY + 5}%,
          rgba(15,13,10,0.82) ${focusY + 8}%,
          rgba(15,13,10,0.82) 100%
        )`,
        transition: noMotion ? 'none' : 'background 0.1s ease',
      }}
    />
  );
}
