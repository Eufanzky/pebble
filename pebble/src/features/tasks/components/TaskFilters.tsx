import { Chip, Field } from '@/shared/ui';
import type { TaskFilter } from '../lib/organise';
import { TAG_CONFIG } from '../lib/tags';
import type { TaskTag } from '../types';

const TAGS = Object.keys(TAG_CONFIG) as TaskTag[];

interface TaskFiltersProps {
  filter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  /** How many tasks the filter shows, of how many. */
  shown: number;
  total: number;
}

/** Search the list by title, or show one tag. */
export default function TaskFilters({ filter, onChange, shown, total }: TaskFiltersProps) {
  const active = filter.tag !== null || filter.query.trim() !== '';
  return (
    <div className="task-filters">
      <Field
        type="search"
        label="Search tasks"
        hideLabel
        placeholder="Search tasks"
        value={filter.query}
        onChange={(e) => onChange({ ...filter, query: e.target.value })}
      />
      <div role="group" aria-label="Show one tag" className="task-filters__tags">
        <Chip pressed={filter.tag === null} onClick={() => onChange({ ...filter, tag: null })}>
          All
        </Chip>
        {TAGS.map((tag) => (
          <Chip
            key={tag}
            tone={TAG_CONFIG[tag].tone}
            pressed={filter.tag === tag}
            onClick={() => onChange({ ...filter, tag: filter.tag === tag ? null : tag })}
          >
            {TAG_CONFIG[tag].label}
          </Chip>
        ))}
      </div>
      <p className="task-filters__count" role="status">
        {active ? `Showing ${shown} of ${total} tasks.` : ''}
      </p>
    </div>
  );
}
