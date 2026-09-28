import type { ApiSchema } from '@/shared/api';
import { postForm } from '@/shared/lib/api';

export type ParsedDocument = ApiSchema<'ParsedDocumentResponse'>;

/**
 * Reads a PDF or Word file's text on the backend (`POST /api/documents/parse`).
 * The backend parses it in memory and never stores it. Throws `ApiError`.
 */
export function parseDocument(file: File): Promise<ParsedDocument> {
  const form = new FormData();
  form.append('file', file);
  return postForm<ParsedDocument>('/api/documents/parse', form);
}
