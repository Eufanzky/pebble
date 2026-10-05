import { describe, expect, it } from 'vitest';
import type { ActivityEntry } from '../types';
import { entryTime, feedEntries, showMoreLabel } from './feed';

function entry(id: string, agent: ActivityEntry['agent'], timestamp: Date | string): ActivityEntry {
  return { id, agent, timestamp: timestamp as Date, action: id, reasoning: '', safetyStatus: 'passed', explanation: '' };
}

const entries = [
  entry('old', 'CalmSense', new Date('2026-09-27T09:00:00')),
  entry('new', 'WhyBot', '2026-09-27T15:00:00'), // as read back from localStorage
  entry('mid', 'CalmSense', new Date('2026-09-27T12:00:00')),
];

describe('feedEntries', () => {
  it('sorts newest first, whether timestamps are dates or strings', () => {
    expect(feedEntries(entries, 'All').map((e) => e.id)).toEqual(['new', 'mid', 'old']);
  });

  it('keeps one agent', () => {
    expect(feedEntries(entries, 'CalmSense').map((e) => e.id)).toEqual(['mid', 'old']);
    expect(feedEntries(entries, 'BridgeBot')).toEqual([]);
  });
});

describe('entryTime', () => {
  it('shows the time of day', () => {
    expect(entryTime(new Date('2026-09-27T15:05:00'))).toBe('3:05 PM');
    expect(entryTime('2026-09-27T09:30:00')).toBe('9:30 AM');
  });

  it('is empty for a timestamp it cannot read', () => {
    expect(entryTime('not a date')).toBe('');
  });
});

describe('showMoreLabel', () => {
  it.each([[0, null], [-2, null], [3, 'Show 3 more'], [8, 'Show 8 more'], [20, 'Show 8 more of 20']])(
    '%i left → %s',
    (remaining, label) => {
      expect(showMoreLabel(remaining)).toBe(label);
    },
  );
});
