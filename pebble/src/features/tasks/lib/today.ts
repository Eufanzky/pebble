import type { TimeOfDay } from '@/lib/types';
import type { Task } from '../types';

export interface Greeting {
  text: string;
  sub: string;
  muted: boolean;
}

const plural = (n: number) => (n > 1 ? 's' : '');

/** The Today banner: a greeting for the time of day and what's done so far. */
export function greeting(timeOfDay: TimeOfDay, done: number, total: number, calm: boolean): Greeting {
  switch (timeOfDay) {
    case 'morning':
      return {
        text: calm ? 'Good morning' : 'Good morning ✦',
        sub: done > 0
          ? `You finished ${done} thing${plural(done)} so far. Keep going at your own pace.`
          : `You have ${total} things today. No rush, we'll take it together.`,
        muted: false,
      };
    case 'day':
      return {
        text: calm ? 'Good afternoon' : 'Good afternoon ✦',
        sub: done > 0
          ? `${done} down, ${total - done} to go. You're making progress.`
          : `${total} tasks waiting. Pick the easiest one first — momentum builds.`,
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

/** A 12-hour clock label: 0 → "0am", 13 → "1pm". */
export function hourLabel(hour: number): string {
  return `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`;
}

/** The quick-win suggestion: the task whose estimate sorts first. */
export function shortestTask(tasks: Task[]): Task | undefined {
  if (tasks.length === 0) return undefined;
  return tasks.reduce((a, b) => (a.timeEstimate.localeCompare(b.timeEstimate) <= 0 ? a : b));
}

/** The time-aware line under "up next". */
export function nudge(tasks: Task[], timeOfDay: TimeOfDay, hour: number, calm: boolean): string {
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
    return `It's ${hourLabel(hour)} and you have ${open.length} task${plural(open.length)} left. Want to start with "${shortest.title}"?`;
  }
  return `${total} things on the list today. One step at a time.`;
}

/** Open tasks first, finished ones in "done today", and the next one to start. */
export function splitTasks(tasks: Task[]) {
  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  return { open, done, next: open[0] };
}
