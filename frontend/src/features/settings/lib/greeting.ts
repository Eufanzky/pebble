import type { PebblePersonality } from '@/shared/preferences';

/** What Pebble says at the top of settings, in its personality. */
export function settingsGreeting(personality: PebblePersonality): string {
  switch (personality) {
    case 'gentle': return 'Make this space yours';
    case 'playful': return 'Let\'s make this purr-fect!';
    case 'calm': return 'Your settings.';
  }
}
