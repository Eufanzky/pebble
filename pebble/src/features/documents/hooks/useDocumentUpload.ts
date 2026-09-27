'use client';

import { useCallback } from 'react';
import { usePebble } from '@/contexts/PebbleContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { useToast } from '@/contexts/ToastContext';
import { documentFromBinary, documentFromText, isTextFile, sizeInKb } from '../lib/upload';
import type { DocumentItem } from '../types';

function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Adds an uploaded file as a document. Text files are read in the browser;
 * PDF and Word files get a placeholder until they're parsed by the backend.
 */
export function useDocumentUpload(onAdded: (doc: DocumentItem) => void) {
  const { flashMood } = usePebble();
  const { addEntry } = useActivityLog();
  const { showToast } = useToast();

  return useCallback(
    async (file: File) => {
      const text = isTextFile(file);
      const doc = text ? documentFromText(file.name, await readText(file)) : documentFromBinary(file);

      onAdded(doc);
      flashMood('excited', 2000);
      showToast(`"${doc.title}" uploaded — tap to read it`);
      addEntry(
        'SimplifyCore',
        `User uploaded "${file.name}" (${sizeInKb(file.size)} KB)`,
        text
          ? `File type: ${file.type || 'txt'}. Ready for simplification at user's reading level.`
          : `File type: ${file.type}. Queued for Azure Document Intelligence parsing.`,
      );
    },
    [onAdded, flashMood, showToast, addEntry],
  );
}
