import type { ApiSchema } from '@/shared/api';
import { postJson } from '@/shared/lib/api';

export type Simplification = ApiSchema<'SimplifyResponse'>;

/** SimplifyCore rewrites the text at a reading level (1-10) and lists its action items (`POST /api/agents/simplify`). */
export function simplifyText(text: string, readingLevel: number): Promise<Simplification> {
  return postJson<Simplification>('/api/agents/simplify', { text, readingLevel });
}
