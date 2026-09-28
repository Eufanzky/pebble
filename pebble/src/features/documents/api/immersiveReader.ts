import type { ApiSchema } from '@/shared/api';
import { getJson } from '@/shared/lib/api';

type ReaderToken = ApiSchema<'ReaderTokenResponse'>;

/**
 * Opens Azure Immersive Reader. Resolves false when it can't: the backend has
 * no Immersive Reader configured (503), is down, or the SDK fails to load. The
 * caller then shows the built-in reader.
 */
export async function launchImmersiveReader(
  text: string,
  title: string,
  lang: string,
  onExit: () => void,
): Promise<boolean> {
  try {
    const { token, subdomain } = await getJson<ReaderToken>('/api/documents/immersive-reader/token');
    const { launchAsync } = await import('@microsoft/immersive-reader-sdk');
    const content = { title, chunks: [{ content: text, lang, mimeType: 'text/plain' }] };
    await launchAsync(token, subdomain, content, { onExit, uiZIndex: 70 });
    return true;
  } catch {
    return false;
  }
}
