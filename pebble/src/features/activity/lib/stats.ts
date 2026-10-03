import type { ActivityEntry } from '../types';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * The log in one honest sentence: how many entries, from how many agents, and
 * how the safety checks went. Empty for an empty log (the empty state speaks).
 */
export function activitySummary(entries: ActivityEntry[]): string {
  if (entries.length === 0) return '';
  const flagged = entries.filter((e) => e.safetyStatus === 'flagged').length;
  const agents = new Set(entries.map((e) => e.agent)).size;
  const safety =
    flagged === 0
      ? entries.length === 1
        ? 'It passed the safety checks.'
        : 'Every one passed the safety checks.'
      : `${entries.length - flagged} passed the safety checks, and ${plural(flagged, 'was', 'were').replace(/^\d+ /, `${flagged} `)} held back.`;
  return `${plural(entries.length, 'entry', 'entries')} from ${plural(agents, 'agent')}. ${safety}`;
}
