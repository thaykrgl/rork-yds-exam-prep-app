export type QuestionCategory = 'vocabulary' | 'grammar' | 'paragraph' | 'translation' | 'cloze' | 'reading';

export interface Question {
  id: string;
  category: QuestionCategory;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Passage {
  id: string;
  title?: string;
  text: string;
  source?: string;
}

export interface ReadingQuestion extends Question {
  category: 'reading';
  passageId: string;
}

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

export type ExamMode = 'full' | 'mini';

export interface ExamConfig {
  mode: ExamMode;
  questionCount: 20 | 40 | 80;
  timeLimitMinutes: number;
}

export interface ExamAnswer {
  questionId: string;
  selectedAnswer: number | null;
  isFlagged: boolean;
}

export interface CategoryBreakdown {
  category: QuestionCategory;
  total: number;
  correct: number;
  percentage: number;
}

export interface ExamResult {
  id: string;
  date: string;
  config: ExamConfig;
  answers: ExamAnswer[];
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  categoryBreakdown: CategoryBreakdown[];
  estimatedYDSScore: number;
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
  examHistory: ExamResult[];
  totalStudyTimeSeconds: number;
  xp: number;
  level: number;
}

// Spaced Repetition
export interface QuestionReviewData {
  questionId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastAttemptDate: string;
  correctCount: number;
  incorrectCount: number;
}

// Bookmarks
export interface BookmarkEntry {
  questionId: string;
  savedDate: string;
}

// Analytics
export interface DailyStudyRecord {
  date: string;
  questionsAnswered: number;
  questionsCorrect: number;
  studyTimeSeconds: number;
  categoriesStudied: QuestionCategory[];
}

// Study Plans
export type StudyPlanId = '2_week_intensive' | '1_month_structured' | 'weak_area_focused';

export interface StudyPlanTask {
  id: string;
  day: number;
  title: string;
  description: string;
  taskType: 'quiz' | 'review' | 'exam' | 'vocabulary';
  category?: QuestionCategory;
  questionCount?: number;
  completed: boolean;
  completedDate?: string;
}

export interface StudyPlan {
  id: StudyPlanId;
  title: string;
  description: string;
  durationDays: number;
  tasks: StudyPlanTask[];
}

export interface ActiveStudyPlan {
  planId: StudyPlanId;
  startDate: string;
  completedTasks: string[];
  currentDay: number;
}

// Achievements
export type BadgeId =
  | 'first_100'
  | 'first_500'
  | 'perfect_day'
  | 'week_warrior'
  | 'month_master'
  | 'speed_demon'
  | 'master_grammarian'
  | 'word_wizard'
  | 'exam_ace'
  | 'bookworm'
  | 'comeback_kid'
  | 'perfectionist';

export interface Badge {
  id: BadgeId;
  title: string;
  titleTr: string;
  description: string;
  icon: string;
  color: string;
  condition: string;
  unlockedDate?: string;
}

// Notifications
export interface NotificationPreferences {
  dailyReminder: boolean;
  dailyReminderTime: string;
  streakReminder: boolean;
  milestoneNotifications: boolean;
  wordOfTheDay: boolean;
  wordOfTheDayTime: string;
}

export type PremiumTier = 'free' | 'premium';

export interface PremiumState {
  tier: PremiumTier;
  dailyQuestionsAnswered: number;
  dailyQuestionLimit: number;
  dailyExamsCompleted: number;
  dailyExamLimit: number;
  lastResetDate: string;
}

// Grammar Library
export type GrammarTopicId =
  | 'conditionals'
  | 'relative_clauses'
  | 'inversion'
  | 'subjunctive'
  | 'tense_sequencing'
  | 'agreement'
  | 'participial_phrases'
  | 'gerunds_infinitives'
  | 'passive_voice'
  | 'causatives'
  | 'connectors'
  | 'comparatives'
  | 'wish_would_rather'
  | 'cleft_sentences'
  | 'modals'
  | 'reported_speech'
  | 'articles_determiners'
  | 'prepositions'
  | 'noun_clauses'
  | 'adverbial_clauses'
  | 'quantifiers'
  | 'word_formation'
  | 'emphatic_structures'
  | 'ellipsis_substitution'
  | 'parallel_structure';

export type GrammarDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type GrammarTheme = 'sentence_structure' | 'verb_forms' | 'clauses' | 'special_structures';

export interface GrammarExample {
  english: string;
  turkish: string;
}

export interface GrammarRule {
  formula: string;
  explanation: string;
}

export interface GrammarTopic {
  id: GrammarTopicId;
  titleTr: string;
  description: string;
  theme: GrammarTheme;
  difficulty: GrammarDifficulty;
  icon: string;
  color: string;
  content: {
    introduction: string;
    rules: GrammarRule[];
    examples: GrammarExample[];
    ydsPatterns: string[];
    commonMistakes: string[];
    quickTip: string;
  };
  relatedQuestionIds: string[];
  order: number;
}

export interface GrammarTopicProgress {
  topicId: GrammarTopicId;
  isRead: boolean;
  readDate?: string;
  readCount: number;
  lastReadDate?: string;
}

// Personal Records
export type RecordType =
  | 'best_exam_score'
  | 'longest_streak'
  | 'most_questions_day'
  | 'best_accuracy'
  | 'fastest_exam'
  | 'total_exams'
  | 'best_grammar'
  | 'best_vocabulary';

export interface PersonalRecord {
  id: RecordType;
  titleTr: string;
  icon: string;
  color: string;
  value: number;
  displayValue: string;
  achievedDate: string;
}

export interface Milestone {
  id: string;
  titleTr: string;
  icon: string;
  color: string;
  achievedDate: string;
  recordType: RecordType;
  oldValue: string;
  newValue: string;
}
