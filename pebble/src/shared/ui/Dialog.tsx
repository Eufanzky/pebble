'use client';

import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { IconButton } from './IconButton';

interface DialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** `sheet` comes up from the bottom on phones; on wider screens both are centred. */
  variant?: 'center' | 'sheet';
  /** False while another dialog is open on top of this one. */
  active?: boolean;
}

/**
 * A modal dialog. Render it only while open: it traps focus, closes on Escape,
 * on the close button and on a click outside, and gives focus back on close.
 * It renders on <body>, above everything else on screen (the tab bar, the chat
 * button), whatever stacking the page it was opened from has.
 */
export function Dialog({ title, onClose, children, variant = 'center', active = true }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(ref, active, onClose);
  const sheet = variant === 'sheet';

  return createPortal(
    <div
      className={`ui-dialog-scrim ${sheet ? 'ui-dialog-scrim--sheet' : ''}`.trim()}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`ui-dialog ${sheet ? 'ui-dialog--sheet' : ''}`.trim()}
      >
        <div className="ui-dialog__header">
          <h2 id={titleId} className="ui-dialog__title">
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
