import type { ReactNode } from 'react';

export type ChipTone = 'study' | 'communication' | 'project' | 'wellbeing' | 'accent';

interface ChipProps {
  children: ReactNode;
  /** The colour of the dot: a task tag, or the Pebble colour. */
  tone?: ChipTone;
  /** With `onClick`, the chip is a toggle button (a filter); without, a label. */
  pressed?: boolean;
  onClick?: () => void;
}

/** A small label with a colour dot, or a toggle when it has `onClick`. */
export function Chip({ children, tone = 'accent', pressed, onClick }: ChipProps) {
  const content = (
    <>
      <span className="ui-chip__dot" aria-hidden="true" />
      {children}
    </>
  );
  if (onClick) {
    return (
      <button type="button" className="ui-chip" data-tone={tone} aria-pressed={pressed ?? false} onClick={onClick}>
        {content}
      </button>
    );
  }
  return (
    <span className="ui-chip" data-tone={tone}>
      {content}
    </span>
  );
}
