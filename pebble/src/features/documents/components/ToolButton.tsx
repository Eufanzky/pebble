import type { ReactNode } from 'react';

interface ToolButtonProps {
  active: boolean;
  noMotion: boolean;
  onClick: () => void;
  children: ReactNode;
  ariaExpanded?: boolean;
}

/** A pill button in the reader's toolbar; `active` shows it's switched on. */
export default function ToolButton({ active, noMotion, onClick, children, ariaExpanded }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ariaExpanded === undefined ? active : undefined}
      aria-expanded={ariaExpanded}
      style={{
        padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
        background: active ? 'rgba(196,181,212,0.2)' : 'var(--color-surface-2)',
        color: active ? 'var(--color-accent)' : 'var(--color-text-2)',
        fontFamily: 'var(--font-nunito)', fontSize: 12, fontWeight: 600,
        transition: noMotion ? 'none' : 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}
