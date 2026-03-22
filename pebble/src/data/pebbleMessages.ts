import type { PebblePersonality, TimeOfDay } from '@/lib/types';

type MessagesByPersonality = Record<PebblePersonality, string[]>;
type MessagesByTime = Record<TimeOfDay, MessagesByPersonality>;

export const messages: MessagesByTime = {
  morning: {
    gentle: [
      "Good morning! You've got {taskCount} things today. No rush, we'll take it together.",
      "How are you feeling today? I'm here either way.",
      'A new day, a fresh start. Let\'s see what we\'ve got.',
      'Take your time this morning. We\'ll ease into it.',
      '{taskCount} things on the list. One step at a time.',
    ],
    playful: [
      "Rise and shine! Your favorite cat is ready to help.",
      '{taskCount} tasks? Paw-sitively doable.',
      "I've been napping all night. I'm SO ready.",
      'Good morning! Let\'s make today awesome.',
      'The early cat catches the... productivity?',
    ],
    calm: [
      'Good morning. {taskCount} tasks today.',
      'Ready when you are.',
      "Let's begin.",
      'A new day.',
      '{taskCount} things. No rush.',
    ],
  },
  day: {
    gentle: [
      "You finished {completedCount} things already. That's really good.",
      "No rush. We'll get through this together.",
      'Remember: small steps count just as much as big ones.',
      'Taking breaks is part of the work. It counts.',
      "You're making steady progress. Keep going.",
    ],
    playful: [
      'Look at you go! {completedCount} down already.',
      'I believe in you. Also I believe in naps.',
      "You're doing great. I'd give you a high five but... paws.",
      '{completedCount} tasks crushed! Keep that energy going.',
      "Productivity level: legendary. (That's a compliment.)",
    ],
    calm: [
      '{completedCount} tasks done so far.',
      'Still here.',
      'At your own pace.',
      'Progress.',
      'Keep going.',
    ],
  },
  evening: {
    gentle: [
      "It's getting late — you've done enough today.",
      'Rest is productive too. Seriously.',
      "You did good today. Time to wind down.",
      "Tomorrow is a new day. Tonight, be kind to yourself.",
      "You've earned some rest.",
    ],
    playful: [
      "It's past my bedtime! Yours too, probably.",
      "Tomorrow-you will handle the rest. Tonight-you can relax.",
      "Even superheroes sleep. And cats. Especially cats.",
      "Wrapping up? Same. My pillow is calling.",
    ],
    calm: [
      "Evening. You've done enough.",
      'Rest now.',
      'Tomorrow.',
      'Wind down.',
    ],
  },
};

/**
 * Replace template variables in a message string.
 */
export function interpolateMessage(
  message: string,
  vars: { taskCount: number; completedCount: number }
): string {
  return message
    .replace(/\{taskCount\}/g, String(vars.taskCount))
    .replace(/\{completedCount\}/g, String(vars.completedCount));
}

export const pebbleTips = [
  'Start with the smallest task first. Momentum builds on itself.',
  "If you're stuck, try working for just 5 minutes. You'll often want to continue.",
  "Taking breaks isn't lazy — it's how your brain processes what you've learned.",
  "You don't need to finish everything today. Progress matters more than perfection.",
  "Try explaining what you're learning to someone else. Teaching deepens understanding.",
  'Drink some water. Your brain works better when hydrated.',
];
