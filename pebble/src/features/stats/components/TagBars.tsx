import { Chip } from '@/shared/ui';
import { TAG_CONFIG, type TaskTag } from '@/features/tasks';
import type { Stats } from '../types';

const TAGS = Object.keys(TAG_CONFIG) as TaskTag[];

/**
 * Tasks finished per tag, as bars in one colour: each row is named, so colour
 * never has to tell the tags apart (the tag colours are too close for that).
 */
export default function TagBars({ byTag }: { byTag: Stats['byTag'] }) {
  const max = Math.max(1, ...TAGS.map((tag) => byTag[tag]));
  return (
    <ul className="tag-bars">
      {TAGS.map((tag) => (
        <li key={tag} className="tag-bars__row">
          <Chip tone={TAG_CONFIG[tag].tone}>{TAG_CONFIG[tag].label}</Chip>
          <div className="tag-bars__track" aria-hidden="true">
            {byTag[tag] > 0 && <div className="tag-bars__bar" style={{ width: `${(byTag[tag] / max) * 100}%` }} />}
          </div>
          <span className="tag-bars__value">{byTag[tag]}</span>
        </li>
      ))}
    </ul>
  );
}
