import type { PebblePersonality } from '@/lib/types';

type MessagePool = {
  idle: string[];
  progress: string[];
  done: string[];
  late: string[];
};

export const messages: Record<PebblePersonality, MessagePool> = {
  gentle: {
    idle: [
      "Let's take it one step at a time.",
      "You're doing great. Keep going.",
      'Remember, small steps count too.',
      "I'm here with you. Let's focus.",
      "One task at a time. You've got this.",
    ],
    progress: [
      "Nice! You're making progress.",
      'Look at you go! Keep it up.',
      'Every task done is a win.',
    ],
    done: [
      "You did it! I'm so proud of you.",
      'All done! Time to rest.',
    ],
    late: [
      "It's getting late. Be kind to yourself.",
      "Rest is productive too. Don't forget.",
    ],
  },
  playful: {
    idle: [
      "Let's crush 'em like little bugs!",
      "Your task list doesn't stand a chance!",
      'Ready? Set? FOCUS!',
      "These tasks won't know what hit 'em.",
      "Let's gooooo!",
    ],
    progress: [
      'BOOM! Another one bites the dust!',
      "You're on fire! (metaphorically)",
      'Unstoppable! Keep that streak!',
    ],
    done: [
      'YOU DID IT! Party time!',
      'Victory dance! All tasks DESTROYED!',
    ],
    late: [
      'Even night owls need sleep eventually!',
      'Past bedtime, but I respect the grind.',
    ],
  },
  calm: {
    idle: [
      'One thing at a time.',
      'Breathe. Begin.',
      'Focus.',
      "You're here. That's enough.",
      'Steady progress.',
    ],
    progress: [
      'Good. Keep going.',
      'Progress.',
      'Moving forward.',
    ],
    done: [
      'Done. Well done.',
      'Complete. Rest now.',
    ],
    late: [
      'Rest soon.',
      'Tomorrow is another day.',
    ],
  },
};

export const pebbleTips = [
  'Start with the smallest task first. Momentum builds on itself.',
  "If you're stuck, try working for just 5 minutes. You'll often want to continue.",
  "Taking breaks isn't lazy — it's how your brain processes what you've learned.",
  "You don't need to finish everything today. Progress matters more than perfection.",
  "Try explaining what you're learning to someone else. Teaching deepens understanding.",
  'Drink some water. Your brain works better when hydrated.',
];
