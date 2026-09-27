// Sample rooms with made-up people. Roadmap 7.1 removes them: principle 6
// rules out fake presence.

export interface RoomUser {
  name: string;
  color: string;
  focusing: boolean;
}

export interface RoomInfo {
  name: string;
  people: number;
  colors: string[];
  users: RoomUser[];
}

export const OTHER_ROOMS: RoomInfo[] = [
  {
    name: 'Morning Grind', people: 7,
    colors: ['var(--accent-amber)', 'var(--accent-sage)', 'var(--accent-lavender)', 'var(--accent-coral)', 'var(--accent-sky)'],
    users: [
      { name: 'Alex', color: 'var(--accent-amber)', focusing: true },
      { name: 'Sam', color: 'var(--accent-sage)', focusing: true },
      { name: 'Jordan', color: 'var(--accent-lavender)', focusing: false },
      { name: 'Riley', color: 'var(--accent-coral)', focusing: true },
      { name: 'Casey', color: 'var(--accent-sky)', focusing: true },
      { name: 'Morgan', color: 'var(--accent-cream)', focusing: true },
      { name: 'Taylor', color: 'var(--accent-sage)', focusing: false },
    ],
  },
  {
    name: 'Late Night Club', people: 2,
    colors: ['var(--accent-coral)', 'var(--accent-sky)'],
    users: [
      { name: 'Noor', color: 'var(--accent-coral)', focusing: true },
      { name: 'Quinn', color: 'var(--accent-sky)', focusing: true },
    ],
  },
  {
    name: 'Deep Work Den', people: 5,
    colors: ['var(--accent-sage)', 'var(--accent-lavender)', 'var(--accent-amber)'],
    users: [
      { name: 'Avery', color: 'var(--accent-sage)', focusing: true },
      { name: 'Kai', color: 'var(--accent-lavender)', focusing: true },
      { name: 'Reese', color: 'var(--accent-amber)', focusing: true },
      { name: 'Drew', color: 'var(--accent-coral)', focusing: false },
      { name: 'Blake', color: 'var(--accent-sky)', focusing: true },
    ],
  },
  {
    name: 'Quiet Corner', people: 1,
    colors: ['var(--accent-lavender)'],
    users: [
      { name: 'Luna', color: 'var(--accent-lavender)', focusing: true },
    ],
  },
];
