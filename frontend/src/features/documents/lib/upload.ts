import { ApiError } from '@/shared/lib/api';
import type { DocumentItem } from '../types';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const DOCUMENT_TYPES: readonly DocumentItem['type'][] = ['academic', 'technical', 'meeting'];

/** The backend's guess at a document's type; technical when it's one the UI doesn't know. */
export function toDocumentType(type: string): DocumentItem['type'] {
  return DOCUMENT_TYPES.includes(type as DocumentItem['type']) ? (type as DocumentItem['type']) : 'technical';
}

/** PDF, Word and text files up to 10 MB. */
export function isAcceptedUpload(file: Pick<File, 'name' | 'type' | 'size'>): boolean {
  const knownType = ALLOWED_TYPES.includes(file.type) || /\.(pdf|doc|docx|txt)$/i.test(file.name);
  return knownType && file.size <= MAX_UPLOAD_BYTES;
}

export function isTextFile(file: Pick<File, 'name' | 'type'>): boolean {
  return file.type === 'text/plain' || file.name.endsWith('.txt');
}

const titleOf = (fileName: string) => fileName.replace(/\.[^.]+$/, '');
export const sizeInKb = (bytes: number) => (bytes / 1024).toFixed(0);

/** A document from a file's text. SimplifyCore writes its levels when they're asked for (`useDocumentText`). */
export function documentFromText(
  fileName: string,
  text: string,
  type: DocumentItem['type'] = 'academic',
  now = Date.now(),
): DocumentItem {
  return {
    id: `upload-${now}`,
    source: 'upload',
    title: titleOf(fileName),
    type,
    tags: ['uploaded'],
    original: text,
    levels: {},
    extractedTasks: [],
    comprehensionQuestion: {
      question: '',
      correctAnswer: '',
      wrongAnswer: '',
      pebbleCorrect: 'Nice work!',
      pebbleWrong: 'No worries, let\'s look at it again.',
    },
  };
}

/**
 * What to tell the user when a file can't be read. The backend explains a
 * damaged, locked or scanned file itself, in Pebble's voice; anything else
 * (the backend is down, a 5xx) gets a general message.
 */
export function uploadErrorMessage(error: unknown, fileName: string): string {
  if (error instanceof ApiError && error.status !== null && error.status < 500) {
    try {
      const { detail } = JSON.parse(error.detail) as { detail?: unknown };
      if (typeof detail === 'string' && detail) return detail;
    } catch {
      // Not JSON: fall through to the general message
    }
  }
  return `Pebble couldn't read "${fileName}" just now. Text files always work.`;
}
