import { Button, Card, Chip } from '@/shared/ui';
import { TAG_CONFIG } from '../lib/tags';
import type { Task } from '../types';

interface UpNextCardProps {
  task: Task | undefined;
  calm: boolean;
  onDone: (id: string) => void;
}

/** The next open task, and the one main action on Today: marking it done. */
export default function UpNextCard({ task, calm, onDone }: UpNextCardProps) {
  return (
    <Card as="section" tone="raised" padding="md" className="up-next" aria-labelledby="up-next-title">
      <h2 id="up-next-title" className="up-next__label">
        Up next
      </h2>
      {task ? (
        <div className="up-next__body">
          <div className="up-next__task">
            <p className="up-next__title">{task.title}</p>
            <div className="up-next__meta">
              <Chip tone={TAG_CONFIG[task.tag].tone}>{TAG_CONFIG[task.tag].label}</Chip>
              {task.timeEstimate && <span className="task-card__estimate">{task.timeEstimate}</span>}
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => onDone(task.id)}
            aria-label={`Mark "${task.title}" as done`}
          >
            Mark as done
          </Button>
        </div>
      ) : (
        <p className="up-next__all-done">{calm ? "You're all done!" : "You're all done! 🎉"}</p>
      )}
    </Card>
  );
}
