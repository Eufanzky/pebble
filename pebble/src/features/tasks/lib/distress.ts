const DISTRESS_PHRASES = [
  "i can't do this",
  "i'm overwhelmed",
  "too much",
  "i give up",
  "i can't cope",
  "i'm stressed",
  "i'm struggling",
  "everything is too hard",
  "i want to quit",
];

/** True when text typed as a task reads as distress rather than a task. */
export function isDistressInput(text: string): boolean {
  const lower = text.toLowerCase().replace(/[‘’]/g, "'");
  return DISTRESS_PHRASES.some((phrase) => lower.includes(phrase));
}
