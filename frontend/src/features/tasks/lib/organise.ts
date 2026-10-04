import type { Task, TaskTag } from '../types';

/** What the list is narrowed to: one tag, words in the title, or both. */
export interface TaskFilter {
  tag: TaskTag | null;
  query: string;
}

export const NO_FILTER: TaskFilter = { tag: null, query: '' };

export function isFiltering(filter: TaskFilter): boolean {
  return filter.tag !== null || filter.query.trim() !== '';
}

/** The tasks with the tag and whose title contains the words (any case, any order of the list kept). */
export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  const query = filter.query.trim().toLocaleLowerCase();
  return tasks.filter(
    (t) => (filter.tag === null || t.tag === filter.tag) && (!query || t.title.toLocaleLowerCase().includes(query)),
  );
}

/** `ids` with `id` moved to `index` (kept within the list). */
export function moveTo(ids: string[], id: string, index: number): string[] {
  const from = ids.indexOf(id);
  if (from < 0) return ids;
  const rest = ids.filter((other) => other !== id);
  const to = Math.max(0, Math.min(index, rest.length));
  return [...rest.slice(0, to), id, ...rest.slice(to)];
}

/** `ids` with `id` moved `delta` places up (negative) or down. */
export function moveBy(ids: string[], id: string, delta: number): string[] {
  return moveTo(ids, id, ids.indexOf(id) + delta);
}

/** Where a dragged item lands: after every other item whose middle is above the pointer. */
export function dropIndex(middles: number[], pointerY: number): number {
  return middles.filter((middle) => middle < pointerY).length;
}
