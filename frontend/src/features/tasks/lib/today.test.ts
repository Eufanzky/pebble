import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { FRESH_START, greeting, nudge, shortestTask, splitTasks } from './today';

function task(title: string, completed = false, timeEstimate = '~10 min'): Task {
  return { id: title, title, timeEstimate, tag: 'study', priority: 'medium', completed };
}

describe('greeting', () => {
  it.each([
    ['morning', 0, 3, 'Good morning ✦', "You have 3 things today. No rush, we'll take it together.", false],
    ['morning', 1, 3, 'Good morning ✦', 'You finished 1 thing so far. Keep going at your own pace.', false],
    ['morning', 2, 3, 'Good morning ✦', 'You finished 2 things so far. Keep going at your own pace.', false],
    ['morning', 0, 1, 'Good morning ✦', "You have 1 thing today. No rush, we'll take it together.", false],
    ['morning', 0, 0, 'Good morning ✦', 'Nothing on the list yet. Add one thing whenever you like.', false],
    ['day', 0, 4, 'Good afternoon ✦', '4 things on the list. Pick the easiest one first, if you like.', false],
    ['day', 0, 0, 'Good afternoon ✦', 'Nothing on the list yet. Add one thing whenever you like.', false],
    ['day', 1, 4, 'Good afternoon ✦', "1 down, 3 to go. You're making progress.", false],
    ['evening', 0, 2, "It's getting late — you've done enough today 🌙", 'Tomorrow is a new day. Rest well.', true],
    ['evening', 2, 2, "It's getting late — you've done enough today 🌙", 'You finished 2 things today. That counts.', true],
  ] as const)('%s with %i of %i done', (timeOfDay, done, total, text, sub, muted) => {
    expect(greeting(timeOfDay, done, total, false)).toEqual({ text, sub, muted });
  });

  it.each(['morning', 'day', 'evening'] as const)('opens fresh after time away, whatever was done (%s)', (timeOfDay) => {
    for (const [done, total] of [[0, 0], [0, 5], [3, 5]]) {
      const fresh = greeting(timeOfDay, done, total, false, true);
      expect(fresh.sub).toBe(FRESH_START);
      expect(fresh.text).toBe(greeting(timeOfDay, done, total, false).text);
    }
    expect(FRESH_START).toBe('Want to pick one small thing?');
  });

  it.each(['morning', 'day', 'evening'] as const)('drops the emoji in calm mode (%s)', (timeOfDay) => {
    expect(greeting(timeOfDay, 0, 1, true).text).not.toMatch(/[✦🌙]/u);
  });
});

describe('shortestTask', () => {
  it('picks the estimate that sorts first, the first one on a tie', () => {
    const a = task('a', false, '~15 min');
    const b = task('b', false, '~10 min');
    const c = task('c', false, '~10 min');
    expect(shortestTask([a, b, c])).toBe(b);
  });

  it('is undefined for no tasks', () => {
    expect(shortestTask([])).toBeUndefined();
  });
});

describe('nudge', () => {
  it('celebrates when everything is finished', () => {
    expect(nudge([task('a', true)], 'day', false)).toBe("You finished everything. That's impressive. ✨");
    expect(nudge([task('a', true)], 'evening', true)).toBe("You finished everything. That's impressive.");
  });

  it('suggests rest in the evening', () => {
    expect(nudge([task('a')], 'evening', false)).toBe('No more tasks tonight. Rest well.');
  });

  it('suggests the shortest open task during the day, without setting the clock against it', () => {
    const tasks = [task('Long', false, '~30 min'), task('Quick', false, '~05 min'), task('Done', true, '~01 min')];
    expect(nudge(tasks, 'day', false)).toBe('2 still open. Want to start with "Quick"?');
    expect(nudge([task('One')], 'day', false)).toBe('1 still open. Want to start with "One"?');
  });

  it('opens fresh after time away, without counting what is open', () => {
    expect(nudge([task('a'), task('b', true)], 'day', false, true)).toBe('Start wherever you like. One small thing is enough.');
  });

  it('counts the list in the morning, and with no tasks', () => {
    expect(nudge([task('a'), task('b')], 'morning', false)).toBe('2 things on the list today. One step at a time.');
    expect(nudge([task('a')], 'morning', false)).toBe('1 thing on the list today. One step at a time.');
    expect(nudge([], 'day', false)).toBe('Nothing on the list yet. Add one thing whenever you like.');
  });
});

describe('splitTasks', () => {
  it('splits open and done tasks and picks the first open one as next', () => {
    const tasks = [task('a', true), task('b'), task('c')];
    const { open, done, next } = splitTasks(tasks);
    expect(open.map((t) => t.title)).toEqual(['b', 'c']);
    expect(done.map((t) => t.title)).toEqual(['a']);
    expect(next?.title).toBe('b');
  });

  it('has no next task when all are done', () => {
    expect(splitTasks([task('a', true)]).next).toBeUndefined();
  });
});
