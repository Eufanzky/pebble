import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { dropIndex, filterTasks, isFiltering, moveBy, moveTo, NO_FILTER } from './organise';

const task = (id: string, title: string, tag: Task['tag']): Task => ({
  id,
  title,
  tag,
  timeEstimate: '',
  priority: 'medium',
  completed: false,
});
const TASKS = [task('1', 'Read Chapter 4', 'study'), task('2', 'Email Sam', 'communication'), task('3', 'Read notes', 'project')];

describe('filterTasks', () => {
  it('keeps everything with no filter', () => {
    expect(filterTasks(TASKS, NO_FILTER)).toEqual(TASKS);
    expect(isFiltering(NO_FILTER)).toBe(false);
  });

  it('narrows by tag, by words in the title (any case), or both, keeping the order', () => {
    expect(filterTasks(TASKS, { tag: 'study', query: '' }).map((t) => t.id)).toEqual(['1']);
    expect(filterTasks(TASKS, { tag: null, query: '  read ' }).map((t) => t.id)).toEqual(['1', '3']);
    expect(filterTasks(TASKS, { tag: 'project', query: 'READ' }).map((t) => t.id)).toEqual(['3']);
    expect(filterTasks(TASKS, { tag: 'wellbeing', query: '' })).toEqual([]);
  });

  it('counts blank words as no filter', () => {
    expect(isFiltering({ tag: null, query: '   ' })).toBe(false);
    expect(isFiltering({ tag: 'study', query: '' })).toBe(true);
  });
});

describe('moving', () => {
  const ids = ['a', 'b', 'c', 'd'];

  it('moves an item to a place, kept within the list', () => {
    expect(moveTo(ids, 'd', 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(moveTo(ids, 'a', 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveTo(ids, 'b', 99)).toEqual(['a', 'c', 'd', 'b']);
    expect(moveTo(ids, 'b', -3)).toEqual(['b', 'a', 'c', 'd']);
    expect(moveTo(ids, 'x', 1)).toBe(ids);
  });

  it('moves an item up or down by places', () => {
    expect(moveBy(ids, 'c', -1)).toEqual(['a', 'c', 'b', 'd']);
    expect(moveBy(ids, 'a', 1)).toEqual(['b', 'a', 'c', 'd']);
    expect(moveBy(ids, 'a', -1)).toEqual(ids);
    expect(moveBy(ids, 'd', 1)).toEqual(ids);
  });

  it('drops after every item whose middle is above the pointer', () => {
    expect(dropIndex([10, 50, 90], 5)).toBe(0);
    expect(dropIndex([10, 50, 90], 60)).toBe(2);
    expect(dropIndex([10, 50, 90], 200)).toBe(3);
  });
});
