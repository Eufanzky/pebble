import { applySyllables } from './syllables';
import { simulateTranslation } from './translation';

export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 32;
export const DEFAULT_FONT_SIZE = 18;

/** The text as the built-in reader shows it: translated, then split into syllables. */
export function displayText(text: string, language: string, syllables: boolean): string {
  const translated = simulateTranslation(text, language);
  return syllables ? applySyllables(translated) : translated;
}

/** One step smaller or bigger, within 12–32 px. */
export function stepFontSize(size: number, direction: -1 | 1): number {
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size + direction * 2));
}

/** The line-focus strip follows the pointer, kept 5% away from the edges. */
export function focusPosition(pointerY: number, top: number, height: number): number {
  const percent = ((pointerY - top) / height) * 100;
  return Math.max(5, Math.min(95, percent));
}

export function wordCount(text: string): number {
  return text.split(/\s+/).length;
}
