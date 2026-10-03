import type { ChipTone } from '@/shared/ui';
import type { TaskPriority, TaskTag } from '../types';

export const TAG_CONFIG: Record<TaskTag, { color: string; label: string; emoji: string; tone: ChipTone }> = {
  study:         { color: 'var(--color-tag-study)',         label: 'Study',     emoji: '📚', tone: 'study' },
  communication: { color: 'var(--color-tag-communication)', label: 'Comms',     emoji: '💬', tone: 'communication' },
  project:       { color: 'var(--color-tag-project)',       label: 'Project',   emoji: '🔨', tone: 'project' },
  wellbeing:     { color: 'var(--color-tag-wellbeing)',     label: 'Wellbeing', emoji: '🌿', tone: 'wellbeing' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { color: string; label: string }> = {
  high:   { color: 'var(--color-tag-project)',       label: 'High' },
  medium: { color: 'var(--color-tag-communication)', label: 'Medium' },
  low:    { color: 'var(--color-tag-wellbeing)',     label: 'Low' },
};

/** The tag's label, with its emoji unless calm mode is on. */
export function tagLabel(tag: TaskTag, calm: boolean): string {
  const { label, emoji } = TAG_CONFIG[tag];
  return calm ? label : `${emoji} ${label}`;
}
