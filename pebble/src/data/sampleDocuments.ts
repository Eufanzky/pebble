import type { DocumentItem } from '@/lib/types';

export const sampleDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Design Thinking Syllabus',
    type: 'academic',
    tags: ['Deadlines', 'Assignments', 'Reading'],
    original:
      'This course employs a human-centered design methodology, requiring students to engage in iterative prototyping cycles, stakeholder interviews, and affinity mapping exercises to synthesize qualitative data into actionable design insights within constrained timeframes. Students will be assessed on their ability to demonstrate empathetic engagement with end-users, articulate design rationale through structured critique sessions, and produce functional prototypes that address identified pain points. The course requires completion of three major deliverables: a user research report (due Week 4), a mid-fidelity prototype with stakeholder feedback integration (due Week 8), and a final design presentation with comprehensive documentation of the iterative process (due Week 12).',
    levels: {
      3: "This class is about making things people actually want. You'll talk to people, try your ideas, and fix them. Then try again. That's it.\n\n3 assignments: research report (Week 4), prototype (Week 8), final presentation (Week 12).",
      5: "In this class, you'll design things with real people in mind. You'll talk to users, build rough versions of your ideas, and keep improving them based on what you learn. The goal is to turn messy feedback into clear next steps — and do it quickly.\n\nYou have 3 big assignments:\n1. A report about your user research (due Week 4)\n2. A working prototype with feedback from real people (due Week 8)\n3. A final presentation showing your whole process (due Week 12)",
      8: "This course applies human-centered design through iterative prototyping, user interviews, and affinity mapping to turn research into design insights. You'll be graded on user empathy, design reasoning, and working prototypes. Three main deliverables: user research report (Week 4), prototype with feedback (Week 8), and final presentation with process documentation (Week 12).",
      10: 'This course employs a human-centered design methodology, requiring students to engage in iterative prototyping cycles, stakeholder interviews, and affinity mapping exercises to synthesize qualitative data into actionable design insights within constrained timeframes. Students will be assessed on their ability to demonstrate empathetic engagement with end-users, articulate design rationale through structured critique sessions, and produce functional prototypes that address identified pain points. The course requires completion of three major deliverables: a user research report (due Week 4), a mid-fidelity prototype with stakeholder feedback integration (due Week 8), and a final design presentation with comprehensive documentation of the iterative process (due Week 12).',
    },
    extractedTasks: [
      { title: 'Start user research report', timeEstimate: '~2 hours', tag: 'study' },
      { title: 'Review prototype requirements for Week 8', timeEstimate: '~20 min', tag: 'study' },
    ],
    comprehensionQuestion: {
      question: "What's the main idea of human-centered design?",
      correctAnswer: "Designing with real people's needs in mind",
      wrongAnswer: 'Using the latest technology tools',
      pebbleCorrect: "That's right! It's all about the people, not the tools.",
      pebbleWrong: "Not quite — it's more about people than technology. Want me to simplify that section a bit more?",
    },
  },
  {
    id: 'doc-2',
    title: 'Project Brief',
    type: 'technical',
    tags: ['Requirements', 'Deadline', 'Azure'],
    original:
      'Participants are expected to architect and implement a proof-of-concept solution leveraging Azure AI services to address cognitive accessibility barriers, demonstrating responsible AI principles throughout the design and deployment lifecycle. The solution must incorporate multi-agent orchestration patterns, implement content safety guardrails, and provide explainable AI outputs with full auditability. Teams should consider observability requirements, preference-aware personalization, and how the solution could evolve from proof-of-concept into a production-ready service with enterprise-grade security and governance.',
    levels: {
      3: "Make an app that helps people think more easily. Use Microsoft's AI tools. Make it safe, make it explain itself, and show it working.",
      5: "Build an app using Microsoft's AI tools that helps people who get overwhelmed by information. Make sure it's safe, fair, and actually works. Show how you built it and why it helps.\n\nKey requirements:\n- Use multiple AI agents that work together\n- Include safety checks on all AI output\n- Explain why the AI made each decision\n- Think about how real people would actually use it",
      8: "Build a working proof-of-concept using Azure AI services that helps people with cognitive accessibility needs. Your solution must use multiple AI agents working together, include content safety checks, and explain its AI decisions clearly. Think about monitoring, personalization, and how it could scale to production.",
      10: 'Participants are expected to architect and implement a proof-of-concept solution leveraging Azure AI services to address cognitive accessibility barriers, demonstrating responsible AI principles throughout the design and deployment lifecycle. The solution must incorporate multi-agent orchestration patterns, implement content safety guardrails, and provide explainable AI outputs with full auditability. Teams should consider observability requirements, preference-aware personalization, and how the solution could evolve from proof-of-concept into a production-ready service with enterprise-grade security and governance.',
    },
    extractedTasks: [
      { title: 'List the Azure services to use', timeEstimate: '~15 min', tag: 'project' },
      { title: 'Draft the multi-agent architecture', timeEstimate: '~30 min', tag: 'project' },
    ],
    comprehensionQuestion: {
      question: 'What must every AI decision in the app include?',
      correctAnswer: 'A clear explanation of why it was made',
      wrongAnswer: 'A link to the source code',
      pebbleCorrect: "Exactly! Explainability is the key. Every decision should make sense to the user.",
      pebbleWrong: "Close, but it's about explaining the 'why' to the user, not showing code. Want me to re-read that section with you?",
    },
  },
  {
    id: 'doc-3',
    title: 'Team Standup — March 18',
    type: 'meeting',
    tags: ['Meeting', 'Action Items', 'Decisions'],
    original:
      "Okay so um let me start, so yesterday I was working on the, uh, the frontend components, got the sidebar done and most of the navigation but I'm stuck on the screen transitions, they're kind of janky right now. Today I'm going to fix that and start on the task cards. No blockers really, just need to figure out the animation library situation. Cool, uh, my turn — so I finished the Pebble character, the CSS cat thing, it looks pretty good actually. The blink animation works, the float works, but I need help with the mood states, specifically the excited state with the sparkles, I can't get the particles to look right. Today I'm going to keep working on that and also start the speech bubble system. One blocker: I need the final list of Pebble messages from the content doc. Oh also, we decided to cut the Study Room for now and focus on the core four screens. We can add it back if we have time.",
    levels: {
      3: 'Quick summary: Navigation is done. Pebble cat is done but needs sparkle fix. Study Room is cut. Focus on 4 main screens.',
      5: "Team Standup — March 18\n\nSummary:\nPartner A worked on frontend — sidebar and navigation done. Screen transitions need fixing (janky animations). Starting task cards today.\n\nPartner B finished Pebble character — blink and float animations work. Needs help with excited mood sparkles. Starting speech bubble system.\n\nBlocker: Need final Pebble message list from content doc.\n\nDecision: Study Room cut from scope. Focus on 4 core screens first.\n\nAction Items:\n- Partner A: Fix screen transitions, start task cards\n- Partner B: Finish mood states, start speech bubbles\n- Both: Finalize Pebble message content",
      8: "Frontend progress: sidebar and navigation complete, screen transitions need polish. Task cards starting today. Pebble character CSS complete with blink and float animations; mood states (especially excited sparkles) still in progress. Speech bubble system next. Blocker: awaiting final Pebble message content. Scope decision: Study Room deferred to focus on four core screens.",
      10: "Okay so um let me start, so yesterday I was working on the, uh, the frontend components, got the sidebar done and most of the navigation but I'm stuck on the screen transitions, they're kind of janky right now. Today I'm going to fix that and start on the task cards. No blockers really, just need to figure out the animation library situation. Cool, uh, my turn — so I finished the Pebble character, the CSS cat thing, it looks pretty good actually. The blink animation works, the float works, but I need help with the mood states, specifically the excited state with the sparkles, I can't get the particles to look right. Today I'm going to keep working on that and also start the speech bubble system. One blocker: I need the final list of Pebble messages from the content doc. Oh also, we decided to cut the Study Room for now and focus on the core four screens. We can add it back if we have time.",
    },
    extractedTasks: [
      { title: 'Fix screen transition animations', timeEstimate: '~30 min', tag: 'project' },
      { title: 'Finalize Pebble message content', timeEstimate: '~15 min', tag: 'communication' },
    ],
    comprehensionQuestion: {
      question: "What was the team's main scope decision?",
      correctAnswer: 'Cut the Study Room and focus on 4 core screens',
      wrongAnswer: 'Add more features to the sidebar',
      pebbleCorrect: "That's it! Focus on what matters most. Smart move.",
      pebbleWrong: "Not quite — they actually decided to cut something, not add. Want another look?",
    },
  },
];

/**
 * Get the closest available reading level text for a given slider value.
 * Maps 1-3 → level 3, 4-6 → level 5, 7-9 → level 8, 10 → original.
 */
export function getTextForLevel(doc: DocumentItem, level: number): string {
  if (level >= 10) return doc.original;
  if (level >= 7) return doc.levels[8] ?? doc.original;
  if (level >= 4) return doc.levels[5] ?? doc.levels[8] ?? doc.original;
  return doc.levels[3] ?? doc.levels[5] ?? doc.original;
}
