// ========== DOCUMENTS DATA ==========
const documents = [
  {
    id: 1, title: 'Design Thinking Syllabus.pdf', type: 'PDF',
    tags: ['Deadlines', 'Assignments', 'Reading'],
    complex: 'This course introduces human-centered design methodologies, including stakeholder empathy mapping, rapid ideation frameworks, and iterative prototyping cycles. Students will engage in cross-disciplinary design challenges to develop solutions addressing real-world user needs through systematic design thinking processes.',
    medium: "You'll learn by doing \u2014 making prototypes, interviewing users, and iterating on your designs. The class covers empathy, brainstorming, and testing. Each week builds on the last, so staying current with readings is important.",
    simple: "In this class, you'll learn to design things people actually want to use. You'll talk to users, sketch ideas, build quick prototypes, and keep improving them. It's hands-on and creative.",
    taskSnippets: ['Review syllabus deadlines', 'Start reading list']
  },
  {
    id: 2, title: 'Challenge Brief.pdf', type: 'Brief',
    tags: ['Project', 'Deadlines'],
    complex: 'The 48-hour innovation sprint challenges participants to conceptualize, develop, and present technology solutions addressing sustainability challenges in urban environments. Teams will be evaluated on technical implementation, user experience design, innovation quotient, and presentation quality.',
    medium: "It's a 48-hour challenge focused on sustainability in cities. Your team needs to build a working prototype and pitch it. Judges care about how innovative, usable, and polished your solution is.",
    simple: "You have 48 hours to build something cool that helps make cities more sustainable. Work with a team, make a prototype, and present it. Focus on making something that actually works and looks good.",
    taskSnippets: ['Brainstorm project ideas', 'Check submission deadline']
  }
];

// ========== STUDY ROOMS ==========
const studyRooms = [
  { name: 'Morning Grind', emoji: '\u2600\uFE0F', people: 7, status: 'Starts in 12 min', colors: ['var(--accent-amber)', 'var(--accent-sage)', 'var(--accent-coral)', 'var(--accent-lavender)', 'var(--accent-amber)'] },
  { name: 'Chill Afternoon', emoji: '\uD83C\uDF3F', people: 5, status: 'Active now', colors: ['var(--accent-sage)', 'var(--accent-amber)', 'var(--accent-lavender)', 'var(--accent-coral)', 'var(--accent-sage)'] }
];

// ========== SPEECH MESSAGES ==========
const messages = {
  gentle: {
    idle: [
      "Let's take it one step at a time.",
      "You're doing great. Keep going.",
      "Remember, small steps count too.",
      "I'm here with you. Let's focus.",
      "One task at a time. You've got this."
    ],
    progress: [
      "Nice! You're making progress.",
      "Look at you go! Keep it up.",
      "Every task done is a win."
    ],
    done: [
      "You did it! I'm so proud of you.",
      "All done! Time to rest."
    ],
    late: [
      "It's getting late. Be kind to yourself.",
      "Rest is productive too. Don't forget."
    ]
  },
  playful: {
    idle: [
      "Let's crush 'em like little bugs!",
      "Your task list doesn't stand a chance!",
      "Ready? Set? FOCUS!",
      "These tasks won't know what hit 'em.",
      "Let's gooooo!"
    ],
    progress: [
      "BOOM! Another one bites the dust!",
      "You're on fire! (metaphorically)",
      "Unstoppable! Keep that streak!"
    ],
    done: [
      "YOU DID IT! Party time!",
      "Victory dance! All tasks DESTROYED!"
    ],
    late: [
      "Even night owls need sleep eventually!",
      "Past bedtime, but I respect the grind."
    ]
  },
  calm: {
    idle: [
      "One thing at a time.",
      "Breathe. Begin.",
      "Focus.",
      "You're here. That's enough.",
      "Steady progress."
    ],
    progress: [
      "Good. Keep going.",
      "Progress.",
      "Moving forward."
    ],
    done: [
      "Done. Well done.",
      "Complete. Rest now."
    ],
    late: [
      "Rest soon.",
      "Tomorrow is another day."
    ]
  }
};

const pebbleTips = [
  "Start with the smallest task first. Momentum builds on itself.",
  "If you're stuck, try working for just 5 minutes. You'll often want to continue.",
  "Taking breaks isn't lazy \u2014 it's how your brain processes what you've learned.",
  "You don't need to finish everything today. Progress matters more than perfection.",
  "Try explaining what you're learning to someone else. Teaching deepens understanding.",
  "Drink some water. Your brain works better when hydrated."
];
