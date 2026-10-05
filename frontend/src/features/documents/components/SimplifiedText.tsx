import { Button } from '@/shared/ui';
import type { DocumentText } from '../hooks/useDocumentText';

interface SimplifiedTextProps {
  simplified: DocumentText;
  level: number;
  /** Bumped on every level change, so the text fades in again. */
  textVersion: number;
  noMotion: boolean;
  /** Space below the text (the reader view leaves room before the original). */
  marginBottom?: number;
}

const textStyle = {
  fontFamily: 'var(--font-nunito)', fontSize: 15, color: 'var(--color-text)', lineHeight: 1.8, whiteSpace: 'pre-wrap',
} as const;

const noteStyle = { fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--color-text-2)', margin: 0 } as const;

/** Pebble's version of the document, or what SimplifyCore is doing about it. */
export default function SimplifiedText({ simplified, level, textVersion, noMotion, marginBottom = 0 }: SimplifiedTextProps) {
  if (simplified.status === 'working') {
    return (
      <p role="status" style={{ ...noteStyle, marginBottom }}>
        SimplifyCore is writing this at level {level}…
      </p>
    );
  }
  if (simplified.status === 'failed') {
    return (
      <div role="status" style={{ display: 'grid', gap: 10, justifyItems: 'start', marginBottom }}>
        <p style={noteStyle}>SimplifyCore couldn&apos;t simplify this just now. The original is still here.</p>
        <Button variant="quiet" size="sm" onClick={simplified.retry}>
          Try again
        </Button>
      </div>
    );
  }
  return (
    <div style={{ marginBottom }}>
      <div
        key={textVersion}
        data-testid="simplified-text"
        style={{ ...textStyle, animation: noMotion ? 'none' : 'docFadeIn 0.4s ease' }}
      >
        {simplified.text}
      </div>
      {simplified.partial && (
        <p style={{ ...noteStyle, marginTop: 12 }}>
          This is the first part of the document, simplified. The rest is in the original.
        </p>
      )}
      {simplified.ungrounded && (
        <p style={{ ...noteStyle, marginTop: 12 }}>
          SimplifyCore&apos;s version may say things the original doesn&apos;t. Check it against the original.
        </p>
      )}
    </div>
  );
}
