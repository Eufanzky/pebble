// Public API of the companion feature (the Pebble character and its mood).
// Code outside `features/companion` imports only from here.
export { PebbleProvider, usePebble } from './context/PebbleContext';
export { default as PebbleCharacter } from './components/PebbleCharacter';
export { default as PebbleFace } from './components/PebbleFace';
export { default as PebbleSpeechBubble } from './components/PebbleSpeechBubble';
export type { PebbleMood } from './types';
