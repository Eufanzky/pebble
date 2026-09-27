import type { ActivityEntry } from '../types';

export interface ActivityStat {
  title: string;
  value: string;
  label: string;
  color: string;
}

/** The three numbers above the log: decisions, safety checks passed, agents. */
export function activityStats(entries: ActivityEntry[]): ActivityStat[] {
  const passed = entries.filter((e) => e.safetyStatus === 'passed').length;
  const agents = new Set(entries.map((e) => e.agent)).size;
  return [
    { title: 'Decisions made', value: String(entries.length), label: 'today', color: 'var(--accent-lavender)' },
    { title: 'Safety checks', value: String(passed), label: 'all passed', color: 'var(--accent-sage)' },
    { title: 'Agents active', value: String(agents), label: 'in pipeline', color: 'var(--accent-amber)' },
  ];
}
