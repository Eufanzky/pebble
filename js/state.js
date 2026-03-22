// ========== STATE ==========
const defaultState = {
  currentScreen: 'today',
  personality: 'gentle',
  pebbleColor: '#C4B5D4',
  pebbleDark: '#A89ABC',
  readingLevel: 5,
  chunkSize: 'medium',
  reduceAnimations: false,
  calmMode: false,
  tasks: [
    { id: 1, title: 'Read Chapter 4 of the design textbook', tag: 'Study', time: '~30 min', priority: 'medium', completed: false, hasSubtasks: true, expanded: false, subtasks: ['Skim section headings & key terms', 'Read intro and summary paragraphs', 'Take notes on 3 main concepts', 'Write 2 discussion questions'] },
    { id: 2, title: "Reply to Professor Martinez's email", tag: 'Communication', time: '~10 min', priority: 'high', completed: false, hasSubtasks: false, expanded: false, subtasks: [] },
    { id: 3, title: 'Work on project proposal', tag: 'Project', time: '~45 min', priority: 'high', completed: false, hasSubtasks: true, expanded: false, subtasks: ['Brainstorm 3 project ideas', 'Research feasibility of top idea', 'Draft problem statement', 'Outline tech stack'] },
    { id: 4, title: 'Take a 10-minute walk', tag: 'Wellbeing', time: '~10 min', priority: 'low', completed: false, hasSubtasks: false, expanded: false, subtasks: [] }
  ]
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('focusbuddy_v2'));
    return saved ? { ...defaultState, ...saved, tasks: saved.tasks || defaultState.tasks } : { ...defaultState };
  } catch { return { ...defaultState }; }
}

function saveState() {
  localStorage.setItem('focusbuddy_v2', JSON.stringify(state));
}
