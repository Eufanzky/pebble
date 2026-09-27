import type { DocumentItem } from '../types';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** PDF, Word and text files up to 10 MB. */
export function isAcceptedUpload(file: Pick<File, 'name' | 'type' | 'size'>): boolean {
  const knownType = ALLOWED_TYPES.includes(file.type) || /\.(pdf|doc|docx|txt)$/i.test(file.name);
  return knownType && file.size <= MAX_UPLOAD_BYTES;
}

export function isTextFile(file: Pick<File, 'name' | 'type'>): boolean {
  return file.type === 'text/plain' || file.name.endsWith('.txt');
}

const titleOf = (fileName: string) => fileName.replace(/\.[^.]+$/, '');
const extensionOf = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || '';
export const sizeInKb = (bytes: number) => (bytes / 1024).toFixed(0);

/** A document from an uploaded text file: the same text at every level. */
export function documentFromText(fileName: string, text: string, now = Date.now()): DocumentItem {
  const ext = extensionOf(fileName);
  return {
    id: `upload-${now}`,
    title: titleOf(fileName),
    type: ext === 'pdf' || ext === 'doc' || ext === 'docx' ? 'technical' : 'academic',
    tags: ['uploaded'],
    original: text,
    levels: { 1: text, 3: text, 5: text, 7: text, 10: text },
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

/** A placeholder document for a PDF or Word file, which isn't parsed here yet. */
export function documentFromBinary(file: Pick<File, 'name' | 'type' | 'size'>, now = Date.now()): DocumentItem {
  return {
    id: `upload-${now}`,
    title: titleOf(file.name),
    type: 'technical',
    tags: ['uploaded'],
    original: `[${file.name}] — This document will be parsed by Azure Document Intelligence.\n\nFile size: ${sizeInKb(file.size)} KB\nType: ${file.type}`,
    levels: {},
    extractedTasks: [],
    comprehensionQuestion: { question: '', correctAnswer: '', wrongAnswer: '', pebbleCorrect: '', pebbleWrong: '' },
  };
}
