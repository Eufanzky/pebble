import { describe, expect, it } from 'vitest';
import type { ActivityEntry } from '../types';
import { activitySummary } from './summary';

function entry(agent: ActivityEntry['agent'], safetyStatus: ActivityEntry['safetyStatus']): ActivityEntry {
  return { id: Math.random().toString(), timestamp: new Date(), agent, action: 'x', reasoning: 'y', safetyStatus, explanation: '' };
}

describe('activitySummary', () => {
  it('says how many entries, from how many agents, and that every check passed', () => {
    expect(activitySummary([entry('CalmSense', 'passed'), entry('WhyBot', 'passed'), entry('CalmSense', 'passed')])).toBe(
      '3 entries from 2 agents. Every one passed the safety checks.',
    );
    expect(activitySummary([entry('CalmSense', 'passed')])).toBe('1 entry from 1 agent. It passed the safety checks.');
  });

  it('says plainly how many were held back', () => {
    expect(activitySummary([entry('CalmSense', 'passed'), entry('CalmSense', 'flagged')])).toBe(
      '2 entries from 1 agent. 1 passed the safety checks, and 1 was held back.',
    );
    expect(activitySummary([entry('CalmSense', 'flagged'), entry('WhyBot', 'flagged'), entry('WhyBot', 'passed')])).toBe(
      '3 entries from 2 agents. 1 passed the safety checks, and 2 were held back.',
    );
  });

  it('says nothing about an empty log', () => {
    expect(activitySummary([])).toBe('');
  });
});
