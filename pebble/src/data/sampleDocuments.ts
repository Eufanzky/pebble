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
  {
    id: 'doc-4',
    title: 'Clean Architecture — Ch.1: What Is Design and Architecture?',
    type: 'academic',
    tags: ['Software', 'Architecture', 'Design', 'Book Chapter'],
    original:
      'There has been a lot of confusion about design and architecture over the years. What is design? What is architecture? What are the differences between the two? One of the goals of this book is to cut through all that confusion and to define, once and for all, what design and architecture are. For starters, I\'ll assert that there is no difference between them. None at all.\n\nThe word "architecture" is often used in the context of something at a high level that is divorced from the lower-level details, whereas "design" more often seems to imply structures and decisions at a lower level. But this usage is nonsensical when you look at what a real architect does.\n\nConsider the architect who designed my new home. Does this home have an architecture? Of course it does. And what is that architecture? Well, it is the shape of the home, the outward appearance, the elevations, and the layout of the spaces and rooms. But as I look through the diagrams that my architect produced, I see an immense number of low-level details. I see where every outlet, light switch, and light will be placed. I see which switches control which lights. I see where the furnace is placed, and the size and placement of the water heater and the sump pump.\n\nIn short, I see all the little details that support all the high-level decisions. I also see that those low-level details and high-level decisions are part of the whole design of the house.\n\nAnd so it is with software design. The low-level details and the high-level structure are all part of the same whole. They form a continuous fabric that defines the shape of the system. You can\'t have one without the other; indeed, no clear dividing line separates them. There is simply a continuum of decisions from the highest to the lowest levels.\n\nThe Goal?\n\nThe goal of software architecture is to minimize the human resources required to build and maintain the required system.\n\nThe measure of design quality is simply the measure of the effort required to meet the needs of the customer. If that effort is low, and stays low throughout the lifetime of the system, the design is good. If that effort grows with each new release, the design is bad. It\'s as simple as that.\n\nThe Signature of a Mess\n\nWhat you are looking at is the signature of a mess. When systems are thrown together in a hurry, when the sheer number of programmers is the sole driver of output, and when little or no thought is given to the cleanliness of the code or the structure of the design, then you can bank on riding this curve to its ugly end.\n\nFrom the developers\' point of view, this is tremendously frustrating, because everyone is working hard. Nobody has decreased their effort. And yet, despite all their heroics, overtime, and dedication, they simply aren\'t getting much of anything done anymore. All their effort has been diverted away from features and is now consumed with managing the mess. Their job has changed from that of a developer to a mess mover.\n\nThe executives are dismayed that their decrees to the developers have no effect. They\'ve hired all these programmers, but nothing seems to be getting done.\n\nWhat Did You Think?\n\nThe developers are overconfident in their ability to remain productive. The bigger lie that developers buy into is the notion that writing messy code makes them go fast in the short term, and just slows them down in the long term. Developers who accept this lie exhibit a characteristic behavior: They switch to a new startup company where they can write code in a clean greenfield project.\n\nThe fact is that making messes is always slower than staying clean, no matter which time scale you are using. Consider the results of a remarkable experiment performed by Jason Gorman. The conclusion: The only way to go fast, is to go well.',
    levels: {
      3: 'Design and architecture are the same thing. There\'s no difference.\n\nThe goal of good software design: make it easy to build and maintain.\n\nIf your code gets harder to change over time, the design is bad. If it stays easy, the design is good.\n\nMessy code is NEVER faster. Clean code is always faster, even in the short term.',
      5: 'Chapter 1: What Is Design and Architecture?\n\nKey idea: Design and architecture are the same thing. "Architecture" sounds high-level, "design" sounds low-level, but they\'re actually one continuous set of decisions — from big-picture structure down to where every function goes.\n\nThink of it like a house: the floor plan IS the architecture, but the architect also decides where every light switch goes. It\'s all one design.\n\nThe Goal\nGood software architecture = minimize the effort needed to build and maintain the system. If each new feature gets harder to add, your design is failing.\n\nThe Mess Problem\nWhen teams rush and skip clean code, productivity crashes. Even with more developers, output flatlines. Everyone works hard but nothing gets done — they\'re just managing the mess.\n\nThe Big Lie\nDevelopers think "messy now, clean later" is faster. It\'s not. Experiments prove that clean code is ALWAYS faster, even day one. The only way to go fast is to go well.',
      8: 'Robert C. Martin argues that software design and architecture are not separate concepts — they form a continuous spectrum of decisions from high-level structure to low-level details, much like a house architect decides both the floor plan and where each outlet goes.\n\nThe goal of software architecture is to minimize the human resources required to build and maintain a system. Design quality is measured by effort: if adding features stays easy over time, the design is good.\n\nThe chapter presents a case study showing how a company\'s productivity collapsed despite growing their engineering team. The cause: accumulated mess. When code is thrown together without thought for structure, all effort eventually goes to managing the mess rather than building features.\n\nMartin debunks the common developer belief that writing messy code is faster in the short term. Citing Jason Gorman\'s experiment, he concludes: making messes is always slower than staying clean, regardless of time scale. The only way to go fast is to go well.',
      10: 'There has been a lot of confusion about design and architecture over the years. What is design? What is architecture? What are the differences between the two? One of the goals of this book is to cut through all that confusion and to define, once and for all, what design and architecture are. For starters, I\'ll assert that there is no difference between them. None at all.\n\nThe word "architecture" is often used in the context of something at a high level that is divorced from the lower-level details, whereas "design" more often seems to imply structures and decisions at a lower level. But this usage is nonsensical when you look at what a real architect does.\n\nThe goal of software architecture is to minimize the human resources required to build and maintain the required system. The measure of design quality is simply the measure of the effort required to meet the needs of the customer. If that effort is low, and stays low throughout the lifetime of the system, the design is good. If that effort grows with each new release, the design is bad.\n\nThe Signature of a Mess: When systems are thrown together in a hurry, when little or no thought is given to the cleanliness of the code or the structure of the design, then you can bank on riding this curve to its ugly end. The only way to go fast, is to go well.',
    },
    extractedTasks: [
      { title: 'Read Chapter 1: What Is Design and Architecture?', timeEstimate: '~15 min', tag: 'study' },
      { title: 'Summarize the "Signature of a Mess" concept', timeEstimate: '~10 min', tag: 'study' },
      { title: 'Review case study on productivity decline', timeEstimate: '~10 min', tag: 'study' },
    ],
    comprehensionQuestion: {
      question: 'What is the goal of software architecture according to the chapter?',
      correctAnswer: 'Minimize the human resources required to build and maintain the system',
      wrongAnswer: 'Use the latest technology frameworks',
      pebbleCorrect: 'Exactly! It\'s about making things easier to build and maintain — not about fancy tools.',
      pebbleWrong: 'Not quite — the goal is about effort and people, not technology choices. Want me to simplify that section?',
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
