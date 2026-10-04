import type { DocumentItem } from '../types';

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 10;

/**
 * The closest available text for a slider value.
 * 1-3 → level 3, 4-6 → level 5, 7-9 → level 8, 10 → the original.
 */
export function getTextForLevel(doc: DocumentItem, level: number): string {
  if (level >= 10) return doc.original;
  if (level >= 7) return doc.levels[8] ?? doc.original;
  if (level >= 4) return doc.levels[5] ?? doc.levels[8] ?? doc.original;
  return doc.levels[3] ?? doc.levels[5] ?? doc.original;
}

/** Why the text looks the way it does: the level shown and the user's default. */
export function levelNote(level: number, defaultLevel: number, detailed: boolean): string {
  if (level === defaultLevel) {
    return detailed
      ? `Simplified to level ${level} (your default). Drag the slider above to adjust.`
      : `Simplified to level ${level} (your default).`;
  }
  return detailed
    ? `Showing level ${level}. Your default is ${defaultLevel}. Update it in Settings to remember.`
    : `Showing level ${level}. Your default is ${defaultLevel}.`;
}

/** How far along the slider track the fill reaches, in percent. */
export function sliderFill(level: number): number {
  return (level - MIN_LEVEL) * 11.1;
}
