/** A focus session: 25 minutes. */
export const FOCUS_SECONDS = 25 * 60;

/** 1500 → "25:00". */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const RING_RADIUS = 54;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** How much of the ring is still undrawn: all of it at the start, none at the end. */
export function ringOffset(secondsLeft: number, total = FOCUS_SECONDS): number {
  const progress = (total - secondsLeft) / total;
  return RING_CIRCUMFERENCE - RING_CIRCUMFERENCE * progress;
}
