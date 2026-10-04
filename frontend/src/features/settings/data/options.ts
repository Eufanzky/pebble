import type { ChunkSize, PebbleColor, PebbleModel, PebblePersonality } from '@/shared/preferences';

// The choices on the settings screen.
export const models: { id: PebbleModel; name: string; desc: string }[] = [
  { id: 'classic', name: 'Classic', desc: 'The original Pebble' },
  { id: 'chonky', name: 'Chonky Bean', desc: 'Pusheen-inspired' },
  { id: 'mochi', name: 'Mochi Ball', desc: 'Ultra-round blob' },
  { id: 'minimal', name: 'Sleek', desc: 'Tamagotchi-like' },
  { id: 'chonky-plus', name: 'Chonky+', desc: 'Stripes, purrs on hover' },
  { id: 'mochi-plus', name: 'Mochi+', desc: 'Jelly wobble, nuzzle hover' },
  { id: 'minimal-plus', name: 'Minimal+', desc: 'Pixel-bob, eye widen' },
];

export const colorOptions: { id: PebbleColor; label: string }[] = [
  { id: 'lavender', label: 'Lavender' },
  { id: 'sage', label: 'Sage' },
  { id: 'coral', label: 'Coral' },
  { id: 'amber', label: 'Amber' },
  { id: 'sky', label: 'Sky' },
];

export const personalities: { id: PebblePersonality; name: string; desc: string; quote: string }[] = [
  { id: 'gentle', name: 'Gentle & encouraging', desc: 'Soft, warm, patient', quote: "No rush, we'll get through this together" },
  { id: 'playful', name: 'Playful & funny', desc: 'Light jokes, cat puns, energetic', quote: 'Paw-sitively doable!' },
  { id: 'calm', name: 'Calm & minimal', desc: 'Brief, no-pressure, minimal', quote: 'Ready when you are.' },
];

export const chunkSizes: { id: ChunkSize; label: string; desc: string }[] = [
  { id: 'small', label: 'Small (5-10 min)', desc: 'Short focus bursts' },
  { id: 'medium', label: 'Medium (15-20 min)', desc: 'Balanced' },
  { id: 'large', label: 'Large (30+ min)', desc: 'Deep work sessions' },
];
