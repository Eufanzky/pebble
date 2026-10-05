type DocumentType = 'academic' | 'technical' | 'meeting';

export interface ExtractedTask {
  title: string;
  timeEstimate: string;
  tag: string;
}

export interface ComprehensionQuestion {
  question: string;
  correctAnswer: string;
  wrongAnswer: string;
  pebbleCorrect: string;
  pebbleWrong: string;
}

export interface DocumentItem {
  id: string;
  /** A built-in example (its levels are written in advance), or the user's upload (SimplifyCore writes them). */
  source: 'example' | 'upload';
  title: string;
  type: DocumentType;
  tags: string[];
  original: string;
  levels: Record<number, string>;
  extractedTasks: ExtractedTask[];
  comprehensionQuestion: ComprehensionQuestion;
}
