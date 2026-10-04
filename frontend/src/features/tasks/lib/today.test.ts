import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { greeting, hourLabel, nudge, shortestTask, splitTasks } from './today';

function task(title: string, completed = false, timeEstimate = '~10 min'): Task {
  return { id: title, title, timeEstimate, tag: 'study', priority: 'medium', completed };
}

describe('greeting', () => {
  it.each([
    ['morning', 0, 3, 'Good morning ✦', "You have 3 things today. No rush, we'll take it together.", false],
    ['morning', 1, 3, 'Good morning ✦', 'You finished 1 thing so far. Keep going at your own pace.', false],
    ['morning', 2, 3, 'Good morning ✦', 'You finished 2 things so far. Keep going at your own pace.', false],
    ['day', 0, 4, 'Good afternoon ✦', '4 tasks waiting. Pick the easiest one first — momentum builds.', false],
    ['day', 1, 4, 'Good afternoon ✦', "1 down, 3 to go. You're making progress.", false],
    ['evening', 0, 2, "It's getting late — you've done enough today 🌙", 'Tomorrow is a new day. Rest well.', true],
    ['evening', 2, 2, "It's getting late — you've done enough today 🌙", 'You finished 2 things today. That counts.', true],
  ] as const)('%s with %i of %i done', (timeOfDay, done, total, text, sub, muted) => {
    expect(greeting(timeOfDay, done, total, false)).toEqual({ text, sub, muted });
  });

  it.each(['morning', 'day', 'evening'] as const)('drops the emoji in calm mode (%s)', (timeOfDay) => {
    expect(greeting(timeOfDay, 0, 1, true).text).not.toMatch(/[✦🌙]/u);
  });
});

describe('hourLabel', () => {
  it.each([[0, '0am'], [9, '9am'], [12, '12pm'], [13, '1pm'], [23, '11pm']])('%i → %s', (hour, label) => {
    expect(hourLabel(hour)).toBe(label);
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
    expect(nudge([task('a', true)], 'day', 14, false)).toBe("You finished everything. That's impressive. ✨");
    expect(nudge([task('a', true)], 'evening', 20, true)).toBe("You finished everything. That's impressive.");
  });

  it('suggests rest in the evening', () => {
    expect(nudge([task('a')], 'evening', 21, false)).toBe('No more tasks tonight. Rest well.');
  });

  it('suggests the shortest open task during the day', () => {
    const tasks = [task('Long', false, '~30 min'), task('Quick', false, '~05 min'), task('Done', true, '~01 min')];
    expect(nudge(tasks, 'day', 15, false)).toBe('It\'s 3pm and you have 2 tasks left. Want to start with "Quick"?');
    expect(nudge([task('One')], 'day', 12, false)).toBe('It\'s 12pm and you have 1 task left. Want to start with "One"?');
  });

  it('counts the list in the morning, and with no tasks', () => {
    expect(nudge([task('a'), task('b')], 'morning', 9, false)).toBe('2 things on the list today. One step at a time.');
    expect(nudge([], 'day', 14, false)).toBe('0 things on the list today. One step at a time.');
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
