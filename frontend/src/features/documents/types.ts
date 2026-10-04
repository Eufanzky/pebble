type DocumentType = 'academic' | 'technical' | 'meeting';

interface ExtractedTask {
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
  title: string;
  type: DocumentType;
  tags: string[];
  original: string;
  levels: Record<number, string>;
  extractedTasks: ExtractedTask[];
  comprehensionQuestion: ComprehensionQuestion;
}
