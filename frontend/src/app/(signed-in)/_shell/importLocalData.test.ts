import { beforeEach, describe, expect, it } from 'vitest';
import { forgetLocalData, IMPORT_MARK, importUnderWay, isEmpty, LEGACY_KEYS, readLocalData } from './importLocalData';

const put = (key: string, value: unknown) => window.localStorage.setItem(key, JSON.stringify(value));

beforeEach(() => window.localStorage.clear());

describe('readLocalData', () => {
  it('finds nothing in a browser that never kept anything', () => {
    const { body, found } = readLocalData(window.localStorage);

    expect(found).toBe(false);
    expect(isEmpty(body)).toBe(true);
  });

  it('turns kept tasks into an import, steps and all', () => {
    put('pebble-tasks', [
      {
        id: 'task-1',
        title: '  Read Chapter 4 ',
        timeEstimate: '~25 min',
        tag: 'study',
        priority: 'high',
        completed: false,
        showSubtasks: true,
        whyExplanation: 'One step per section.',
        subtasks: [
          { id: 's1', title: 'Skim', timeEstimate: '~5 min', completed: true },
          { id: 's2', title: '', timeEstimate: '', completed: false },
        ],
      },
    ]);

    expect(readLocalData(window.localStorage).body.tasks).toEqual([
      {
        title: 'Read Chapter 4',
        timeEstimate: '~25 min',
        tag: 'study',
        priority: 'high',
        completed: false,
        whyExplanation: 'One step per section.',
        steps: [{ title: 'Skim', timeEstimate: '~5 min', completed: true }],
      },
    ]);
  });

  it('leaves out damaged tasks and fixes unknown tags and priorities', () => {
    put('pebble-tasks', [null, { title: '' }, { title: 42 }, { title: 'Ok', tag: 'homework', priority: 'urgent' }]);

    expect(readLocalData(window.localStorage).body.tasks).toEqual([
      { title: 'Ok', timeEstimate: '', tag: 'project', priority: 'medium', completed: false, whyExplanation: '', steps: [] },
    ]);
  });

  it('keeps only valid preferences, under their current names', () => {
    put('pebble-preferences', { calmMode: true, readingLevel: 11, pebbleColor: 'red', chunkSize: 'small', theme: 'x' });

    expect(readLocalData(window.localStorage).body.preferences).toEqual({ calmMode: true, stepSize: 'small' });
  });

  it('sends no preferences when none are usable', () => {
    put('pebble-preferences', { readingLevel: 0 });

    expect(readLocalData(window.localStorage).body.preferences).toBeNull();
  });

  it('keeps log entries with their times, and leaves out damaged ones', () => {
    put('pebble-activity', [
      { id: 'a', timestamp: '2026-09-01T10:00:00.000Z', agent: 'AdaptLens', action: 'Level 3', reasoning: 'Slider.', safetyStatus: 'passed' },
      { id: 'b', timestamp: 'yesterday-ish', agent: 'AdaptLens', action: 'Bad time' },
      { id: 'c', timestamp: '2026-09-01T10:00:00.000Z', agent: 'Orchestrator', action: 'Bad agent' },
      { id: 'd', timestamp: '2026-09-02T10:00:00.000Z', agent: 'CalmSense', action: 'Held back', safetyStatus: 'flagged' },
    ]);

    expect(readLocalData(window.localStorage).body.activity).toEqual([
      { agent: 'AdaptLens', action: 'Level 3', reasoning: 'Slider.', safetyStatus: 'passed', timestamp: '2026-09-01T10:00:00.000Z' },
      { agent: 'CalmSense', action: 'Held back', reasoning: '', safetyStatus: 'flagged', timestamp: '2026-09-02T10:00:00.000Z' },
    ]);
  });

  it('reports a key that holds only damaged data as found, with nothing to send', () => {
    window.localStorage.setItem('pebble-tasks', '{not json');

    const { body, found } = readLocalData(window.localStorage);

    expect(found).toBe(true);
    expect(isEmpty(body)).toBe(true);
  });
});

describe('the import mark', () => {
  it('means another tab is importing, for a minute', () => {
    const now = 1_000_000;
    expect(importUnderWay(window.localStorage, now)).toBe(false);

    window.localStorage.setItem(IMPORT_MARK, String(now - 30_000));
    expect(importUnderWay(window.localStorage, now)).toBe(true);

    window.localStorage.setItem(IMPORT_MARK, String(now - 61_000));
    expect(importUnderWay(window.localStorage, now)).toBe(false);
  });

  it('is removed with the old data once the import is done', () => {
    for (const key of LEGACY_KEYS) put(key, []);
    window.localStorage.setItem(IMPORT_MARK, '1');
    put('pebble-preferences-cache', { calmMode: true });

    forgetLocalData(window.localStorage);

    expect(LEGACY_KEYS.map((key) => window.localStorage.getItem(key))).toEqual([null, null, null]);
    expect(window.localStorage.getItem(IMPORT_MARK)).toBeNull();
    expect(window.localStorage.getItem('pebble-preferences-cache')).not.toBeNull();
  });
});
