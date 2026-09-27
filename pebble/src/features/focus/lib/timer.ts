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

/** Where each person sits on the room's circle, "You" last. */
export function seatPosition(index: number, count: number, center = 160, radius = 130, avatar = 36) {
  const angle = (2 * Math.PI * index) / count - Math.PI / 2;
  return {
    x: center + radius * Math.cos(angle) - avatar / 2,
    y: center + radius * Math.sin(angle) - avatar / 2,
  };
}
