import type { TaskPriority, TaskTag } from '../types';

export const TAG_CONFIG: Record<TaskTag, { color: string; label: string; emoji: string }> = {
  study:         { color: 'var(--accent-lavender)', label: 'Study',     emoji: '📚' },
  communication: { color: 'var(--accent-amber)',    label: 'Comms',     emoji: '💬' },
  project:       { color: 'var(--accent-coral)',     label: 'Project',   emoji: '🔨' },
  wellbeing:     { color: 'var(--accent-sage)',      label: 'Wellbeing', emoji: '🌿' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { color: string; label: string }> = {
  high:   { color: '#E8856A', label: 'High' },
  medium: { color: '#D4A843', label: 'Medium' },
  low:    { color: '#8FAF8A', label: 'Low' },
};

/** The tag's label, with its emoji unless calm mode is on. */
export function tagLabel(tag: TaskTag, calm: boolean): string {
  const { label, emoji } = TAG_CONFIG[tag];
  return calm ? label : `${emoji} ${label}`;
}
