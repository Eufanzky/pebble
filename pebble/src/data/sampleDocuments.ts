import type { DocumentItem } from '@/lib/types';

export const sampleDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Design Thinking Syllabus.pdf',
    type: 'academic',
    tags: ['Deadlines', 'Assignments', 'Reading'],
    original:
      'This course introduces human-centered design methodologies, including stakeholder empathy mapping, rapid ideation frameworks, and iterative prototyping cycles. Students will engage in cross-disciplinary design challenges to develop solutions addressing real-world user needs through systematic design thinking processes.',
    levels: {
      1: "This class is about making things people want. You talk to people, try ideas, and fix them.",
      3: "In this class, you'll learn to design things people actually want to use. You'll talk to users, sketch ideas, build quick prototypes, and keep improving them.",
      5: "You'll learn by doing — making prototypes, interviewing users, and iterating on your designs. The class covers empathy, brainstorming, and testing. Each week builds on the last.",
      7: "This course applies human-centered design methodology through iterative prototyping, stakeholder interviews, and affinity mapping to transform qualitative research into design specifications.",
      10: 'This course introduces human-centered design methodologies, including stakeholder empathy mapping, rapid ideation frameworks, and iterative prototyping cycles. Students will engage in cross-disciplinary design challenges to develop solutions addressing real-world user needs through systematic design thinking processes.',
    },
  },
  {
    id: 'doc-2',
    title: 'Project Brief.pdf',
    type: 'technical',
    tags: ['Project', 'Deadlines'],
    original:
      'The 48-hour innovation sprint requires participants to conceptualize, develop, and present technology solutions addressing sustainability in urban environments. Teams will be evaluated on technical implementation, user experience design, innovation quotient, and presentation quality.',
    levels: {
      1: "Build something in 48 hours that helps cities. Make it work, make it look good.",
      3: "You have 48 hours to build something cool that helps make cities more sustainable. Work with a team, make a prototype, and present it.",
      5: "It's a 48-hour sprint focused on sustainability in cities. Your team needs to build a working prototype and pitch it. Evaluators care about how innovative, usable, and polished your solution is.",
      7: "Participants must architect and present a proof-of-concept addressing urban sustainability, demonstrating technical depth, user experience design, and innovation.",
      10: 'The 48-hour innovation sprint requires participants to conceptualize, develop, and present technology solutions addressing sustainability in urban environments. Teams will be evaluated on technical implementation, user experience design, innovation quotient, and presentation quality.',
    },
  },
];
