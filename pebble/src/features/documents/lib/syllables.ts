const VOWELS = 'aeiouy';

/** Splits an English word at vowel-consonant boundaries with a middle dot. */
export function breakIntoSyllables(word: string): string {
  const lower = word.toLowerCase();
  if (lower.length <= 3) return word;

  const parts: string[] = [];
  let current = '';

  for (let i = 0; i < word.length; i++) {
    current += word[i];
    const isVowel = VOWELS.includes(lower[i]);
    const nextIsConsonant = i + 1 < word.length && !VOWELS.includes(lower[i + 1]);
    const hasMoreChars = i + 2 < word.length;

    if (isVowel && nextIsConsonant && hasMoreChars && current.length >= 2) {
      parts.push(current);
      current = '';
    }
  }
  if (current) parts.push(current);
  if (parts.length <= 1) return word;
  return parts.join('·');
}

/** Breaks every word of four letters or more into syllables. */
export function applySyllables(text: string): string {
  return text.replace(/\b[a-zA-Z]{4,}\b/g, (match) => breakIntoSyllables(match));
}
