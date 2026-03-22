export const PEBBLE_COLORS = [
  { color: '#C4B5D4', dark: '#A89ABC', label: 'Lavender' },
  { color: '#8FAF8A', dark: '#7A9E76', label: 'Sage' },
  { color: '#E8856A', dark: '#D07050', label: 'Coral' },
  { color: '#D4A843', dark: '#B89030', label: 'Amber' },
  { color: '#7AB5D4', dark: '#6098B5', label: 'Sky' },
] as const;

export const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Study:         { bg: 'rgba(143,175,138,0.15)', text: 'var(--accent-sage)',     border: 'var(--accent-sage)' },
  Communication: { bg: 'rgba(212,168,67,0.15)',  text: 'var(--accent-amber)',    border: 'var(--accent-amber)' },
  Project:       { bg: 'rgba(196,181,212,0.15)', text: 'var(--accent-lavender)', border: 'var(--accent-lavender)' },
  Wellbeing:     { bg: 'rgba(232,133,106,0.15)', text: 'var(--accent-coral)',    border: 'var(--accent-coral)' },
  Deadlines:     { bg: 'rgba(232,133,106,0.15)', text: 'var(--accent-coral)',    border: 'var(--accent-coral)' },
  Reading:       { bg: 'rgba(143,175,138,0.15)', text: 'var(--accent-sage)',     border: 'var(--accent-sage)' },
};

export const FONTS = {
  body: 'var(--font-nunito)',
  heading: 'var(--font-baloo)',
  mono: 'var(--font-jetbrains)',
} as const;

export const LOCAL_STORAGE_KEY = 'pebble_v1';
