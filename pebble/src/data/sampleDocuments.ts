import type { Document } from '@/lib/types';

export const sampleDocuments: Document[] = [
  {
    id: 1,
    title: 'Design Thinking Syllabus.pdf',
    type: 'PDF',
    tags: ['Deadlines', 'Assignments', 'Reading'],
    complex:
      'This course introduces human-centered design methodologies, including stakeholder empathy mapping, rapid ideation frameworks, and iterative prototyping cycles. Students will engage in cross-disciplinary design challenges to develop solutions addressing real-world user needs through systematic design thinking processes.',
    medium:
      "You'll learn by doing — making prototypes, interviewing users, and iterating on your designs. The class covers empathy, brainstorming, and testing. Each week builds on the last, so staying current with readings is important.",
    simple:
      "In this class, you'll learn to design things people actually want to use. You'll talk to users, sketch ideas, build quick prototypes, and keep improving them. It's hands-on and creative.",
    taskSnippets: ['Review syllabus deadlines', 'Start reading list'],
  },
  {
    id: 2,
    title: 'Project Brief.pdf',
    type: 'Brief',
    tags: ['Project', 'Deadlines'],
    complex:
      'The 48-hour innovation sprint requires participants to conceptualize, develop, and present technology solutions addressing sustainability in urban environments. Teams will be evaluated on technical implementation, user experience design, innovation quotient, and presentation quality.',
    medium:
      "It's a 48-hour sprint focused on sustainability in cities. Your team needs to build a working prototype and pitch it. Evaluators care about how innovative, usable, and polished your solution is.",
    simple:
      'You have 48 hours to build something cool that helps make cities more sustainable. Work with a team, make a prototype, and present it. Focus on making something that actually works and looks good.',
    taskSnippets: ['Brainstorm project ideas', 'Check due date'],
  },
];
