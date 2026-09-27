import { describe, expect, it } from 'vitest';
import type { ActivityEntry } from '../types';
import { activityStats } from './stats';

const entry = (agent: ActivityEntry['agent'], safetyStatus: ActivityEntry['safetyStatus']): ActivityEntry =>
  ({ id: Math.random().toString(), agent, safetyStatus, timestamp: new Date(), action: '', reasoning: '' });

describe('activityStats', () => {
  it('counts decisions, passed safety checks and distinct agents', () => {
    const stats = activityStats([entry('CalmSense', 'passed'), entry('CalmSense', 'flagged'), entry('WhyBot', 'passed')]);

    expect(stats.map((s) => [s.title, s.value])).toEqual([
      ['Decisions made', '3'],
      ['Safety checks', '2'],
      ['Agents active', '2'],
    ]);
  });

  it('is all zeros for an empty log', () => {
    expect(activityStats([]).map((s) => s.value)).toEqual(['0', '0', '0']);
  });
});
