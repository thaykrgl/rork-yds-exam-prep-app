export interface Question {
  id: string;
  category: QuestionCategory;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type QuestionCategory = 'vocabulary' | 'grammar' | 'paragraph' | 'translation' | 'cloze';

export interface VocabularyCard {
  id: string;
  word: string;
  meaning: string;
  example: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  mastered: boolean;
}

export interface StudyCategory {
  id: QuestionCategory;
  title: string;
  titleTr: string;
  icon: string;
  color: string;
  questionCount: number;
}

export interface UserStats {
  totalAnswered: number;
  correctAnswers: number;
  streak: number;
  bestStreak: number;
  dailyGoal: number;
  dailyProgress: number;
  categoryStats: Record<QuestionCategory, { answered: number; correct: number }>;
  lastStudyDate: string;
}

export interface QuizState {
  currentIndex: number;
  answers: number[];
  isFinished: boolean;
  score: number;
}
