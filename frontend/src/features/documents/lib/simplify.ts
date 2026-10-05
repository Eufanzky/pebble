/** How much of an upload SimplifyCore is asked to simplify at once: the free LLM tier's limits allow about this much. */
const SIMPLIFY_LIMIT = 6000;

/**
 * The part of a document SimplifyCore simplifies: all of it when it's short enough, otherwise the start, cut at
 * the last paragraph (or sentence) break before the limit. `partial` says the rest was left out.
 */
export function excerptForSimplifying(text: string, limit = SIMPLIFY_LIMIT): { text: string; partial: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= limit) return { text: trimmed, partial: false };
  const head = trimmed.slice(0, limit);
  const paragraph = head.lastIndexOf('\n\n');
  const sentence = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
  const cut = paragraph > limit / 2 ? paragraph : sentence > limit / 2 ? sentence + 1 : limit;
  return { text: head.slice(0, cut).trim(), partial: true };
}
