import type { PebbleColor } from './types';

export const PEBBLE_COLORS: Record<PebbleColor, { hex: string; dark: string }> = {
  lavender: { hex: '#C4B5D4', dark: '#A89ABC' },
  sage:     { hex: '#8FAF8A', dark: '#7A9E76' },
  coral:    { hex: '#E8856A', dark: '#D07050' },
  amber:    { hex: '#D4A843', dark: '#B89030' },
  sky:      { hex: '#87CEEB', dark: '#6098B5' },
};
