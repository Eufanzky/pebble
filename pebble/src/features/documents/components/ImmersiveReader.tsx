'use client';

import { useCallback } from 'react';
import { useImmersiveReader } from '../hooks/useImmersiveReader';
import BuiltInReader from './BuiltInReader';

interface Props {
  text: string;
  title?: string;
  lang?: string;
  onClose: () => void;
}

/**
 * Azure Immersive Reader when the backend has it configured, and the built-in
 * reader otherwise. Mounted while open.
 */
export default function ImmersiveReader({ text, title = 'Document', lang = 'en', onClose }: Props) {
  const onExit = useCallback(() => onClose(), [onClose]);
  const status = useImmersiveReader(text, title, lang, onExit);

  if (status === 'loading') {
    return (
      <div role="status" style={{
        position: 'fixed', inset: 0, zIndex: 60, background: '#1a1a2e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 14, fontFamily: 'var(--font-nunito)', color: 'var(--color-text-3)' }}>
          Opening the reader...
        </div>
      </div>
    );
  }

  // Azure's reader draws its own UI and calls onExit when closed
  if (status === 'azure') return null;

  return <BuiltInReader text={text} onClose={onClose} />;
}
