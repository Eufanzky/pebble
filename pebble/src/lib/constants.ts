import type { PebbleColor } from './types';

export const PEBBLE_COLORS: Record<PebbleColor, { hex: string; dark: string }> = {
  lavender: { hex: '#C4B5D4', dark: '#A89ABC' },
  sage:     { hex: '#8FAF8A', dark: '#7A9E76' },
  coral:    { hex: '#E8856A', dark: '#D07050' },
  amber:    { hex: '#D4A843', dark: '#B89030' },
  sky:      { hex: '#87CEEB', dark: '#6098B5' },
};

export const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  study:         { bg: 'rgba(196,181,212,0.15)', text: 'var(--accent-lavender)', border: 'var(--accent-lavender)' },
  communication: { bg: 'rgba(212,168,67,0.15)',  text: 'var(--accent-amber)',    border: 'var(--accent-amber)' },
  project:       { bg: 'rgba(232,133,106,0.15)', text: 'var(--accent-coral)',    border: 'var(--accent-coral)' },
  wellbeing:     { bg: 'rgba(143,175,138,0.15)', text: 'var(--accent-sage)',     border: 'var(--accent-sage)' },
};

export const FONTS = {
  body: 'var(--font-nunito)',
  heading: 'var(--font-baloo)',
  mono: 'var(--font-jetbrains)',
} as const;
