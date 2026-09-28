'use client';

import { useCallback } from 'react';
import { usePebble } from '@/features/companion';
import { useActivityLog } from '@/features/activity';
import { useToast } from '@/shared/ui/ToastContext';
import { parseDocument } from '../api/parseDocument';
import { documentFromText, isTextFile, sizeInKb, toDocumentType, uploadErrorMessage } from '../lib/upload';
import type { DocumentItem } from '../types';

function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/** A file's text: read in the browser for text files, by the backend for PDF and Word. */
async function readDocument(file: File): Promise<DocumentItem> {
  if (isTextFile(file)) return documentFromText(file.name, await readText(file));
  const parsed = await parseDocument(file);
  return documentFromText(file.name, parsed.text, toDocumentType(parsed.type));
}

/**
 * Adds an uploaded file as a document. If it can't be read (the backend is
 * down, or the file is damaged), Pebble says so gently and adds nothing.
 */
export function useDocumentUpload(onAdded: (doc: DocumentItem) => void) {
  const { flashMood } = usePebble();
  const { addEntry } = useActivityLog();
  const { showToast } = useToast();

  return useCallback(
    async (file: File) => {
      let doc: DocumentItem;
      try {
        doc = await readDocument(file);
      } catch (error) {
        showToast(uploadErrorMessage(error, file.name));
        return;
      }

      onAdded(doc);
      flashMood('excited', 2000);
      showToast(`"${doc.title}" uploaded — tap to read it`);
      addEntry(
        'SimplifyCore',
        `User uploaded "${file.name}" (${sizeInKb(file.size)} KB)`,
        isTextFile(file)
          ? 'Text file read in the browser. Ready for simplification at user\'s reading level.'
          : 'Text read by the backend in memory; the file was not stored. Ready for simplification at user\'s reading level.',
      );
    },
    [onAdded, flashMood, showToast, addEntry],
  );
}
