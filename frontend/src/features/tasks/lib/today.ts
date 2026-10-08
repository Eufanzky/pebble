import type { TimeOfDay } from '@/shared/hooks/useTimeOfDay';
import type { Task } from '../types';

export interface Greeting {
  text: string;
  sub: string;
  muted: boolean;
}

const plural = (n: number) => (n === 1 ? '' : 's');

const EMPTY = 'Nothing on the list yet. Add one thing whenever you like.';

/** The Today banner: a greeting for the time of day and what's done so far. */
export function greeting(timeOfDay: TimeOfDay, done: number, total: number, calm: boolean): Greeting {
  switch (timeOfDay) {
    case 'morning':
      return {
        text: calm ? 'Good morning' : 'Good morning ✦',
        sub: done > 0
          ? `You finished ${done} thing${plural(done)} so far. Keep going at your own pace.`
          : total > 0
            ? `You have ${total} thing${plural(total)} today. No rush, we'll take it together.`
            : EMPTY,
        muted: false,
      };
    case 'day':
      return {
        text: calm ? 'Good afternoon' : 'Good afternoon ✦',
        sub: done > 0
          ? `${done} down, ${total - done} to go. You're making progress.`
          : total > 0
            ? `${total} thing${plural(total)} on the list. Pick the easiest one first, if you like.`
            : EMPTY,
        muted: false,
      };
    case 'evening':
      return {
        text: calm
          ? "It's getting late — you've done enough today"
          : "It's getting late — you've done enough today 🌙",
        sub: done > 0
          ? `You finished ${done} thing${plural(done)} today. That counts.`
          : 'Tomorrow is a new day. Rest well.',
        muted: true,
      };
  }
}

/** The quick-win suggestion: the task whose estimate sorts first. */
export function shortestTask(tasks: Task[]): Task | undefined {
  if (tasks.length === 0) return undefined;
  return tasks.reduce((a, b) => (a.timeEstimate.localeCompare(b.timeEstimate) <= 0 ? a : b));
}

/**
 * The time-aware line under "up next". It never sets the clock against what's left: the time of day only
 * picks the tone (principle 1).
 */
export function nudge(tasks: Task[], timeOfDay: TimeOfDay, calm: boolean): string {
  const total = tasks.length;
  const open = tasks.filter((t) => !t.completed);

  if (total > 0 && open.length === 0) {
    return calm
      ? "You finished everything. That's impressive."
      : "You finished everything. That's impressive. ✨";
  }
  if (timeOfDay === 'evening') return 'No more tasks tonight. Rest well.';
  const shortest = shortestTask(open);
  if (timeOfDay === 'day' && shortest) {
    return `${open.length} still open. Want to start with "${shortest.title}"?`;
  }
  if (total === 0) return EMPTY;
  return `${total} thing${plural(total)} on the list today. One step at a time.`;
}

/** Open tasks first, finished ones in "done today", and the next one to start. */
export function splitTasks(tasks: Task[]) {
  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  return { open, done, next: open[0] };
}
