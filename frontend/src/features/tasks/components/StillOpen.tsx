'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui';
import { isoDay } from '../lib/deadline';

interface StillOpenProps {
  title: string;
  now: Date;
  /** A new due day, or null for none. */
  onMove: (due: string | null) => void;
  /** CalmSense's breakdown; absent for a task that already has steps. */
  onMakeSmaller?: () => void;
  onLetGo: () => void;
}

/**
 * A task whose day is over (8.4): "still open", never late, with three choices. Moving it, making it
 * smaller and letting it go are all fine outcomes, so none of them is the main button.
 */
export default function StillOpen({ title, now, onMove, onMakeSmaller, onLetGo }: StillOpenProps) {
  const [moving, setMoving] = useState(false);
  const firstDay = useRef<HTMLButtonElement>(null);
  const moveButton = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);

  // The buttons swap: keep focus on the choices, not lost on the page
  useEffect(() => {
    if (moving) firstDay.current?.focus();
    else if (opened.current) moveButton.current?.focus();
    opened.current ||= moving;
  }, [moving]);

  const inDays = (n: number) => isoDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + n));
  const question = onMakeSmaller ? 'Move it, make it smaller, or let it go?' : 'Move it, or let it go?';

  return (
    <div className="task-card__still-open" role="group" aria-label="Still open">
      <p>Still open. {moving ? 'Move it to…' : question}</p>
      {moving ? (
        <>
          <Button ref={firstDay} variant="quiet" size="sm" onClick={() => onMove(inDays(1))}>
            Tomorrow
          </Button>
          <Button variant="quiet" size="sm" onClick={() => onMove(inDays(7))}>
            Next week
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onMove(null)}>
            No due day
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMoving(false)}>
            Back
          </Button>
        </>
      ) : (
        <>
          <Button
            ref={moveButton}
            variant="quiet"
            size="sm"
            onClick={() => setMoving(true)}
            aria-label={`Move "${title}" to another day`}
          >
            Move it
          </Button>
          {onMakeSmaller && (
            <Button variant="quiet" size="sm" icon="✦" onClick={onMakeSmaller} aria-label={`Make "${title}" smaller`}>
              Make it smaller
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onLetGo} aria-label={`Let "${title}" go`}>
            Let it go
          </Button>
        </>
      )}
    </div>
  );
}
