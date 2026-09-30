import type { ReactNode } from 'react';

const noteStyle = {
  padding: '14px 18px',
  borderRadius: 16,
  borderLeft: '2px solid var(--pebble-color)',
  background: 'var(--bg-surface)',
  color: 'var(--text-secondary)',
  fontSize: 14,
  lineHeight: 1.5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 16,
} as const;

const buttonStyle = {
  padding: '6px 14px',
  borderRadius: 999,
  border: '1px solid var(--pebble-color)',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  flexShrink: 0,
} as const;

function Note({ children, action, onAction }: { children: ReactNode; action: string; onAction: () => void }) {
  return (
    <div role="status" style={noteStyle}>
      <span>{children}</span>
      <button type="button" style={buttonStyle} onClick={onAction}>
        {action}
      </button>
    </div>
  );
}

/** The list is on its way from the server. */
export function TasksLoading() {
  return (
    <p role="status" style={{ color: 'var(--text-muted)', fontSize: 14, padding: '24px 0' }}>
      Getting your list…
    </p>
  );
}

/** The list couldn't be loaded. */
export function TasksLoadFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <Note action="Try again" onAction={onRetry}>
      Pebble couldn&apos;t load your list just now.
    </Note>
  );
}

/** A change couldn't be saved; the list shows what the server has. */
export function TasksSaveFailed({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Note action="OK" onAction={onDismiss}>
      Pebble couldn&apos;t save your last change. Your list shows what&apos;s saved.
    </Note>
  );
}
