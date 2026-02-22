import { Question, ExamConfig, QuestionCategory } from '@/types';

// Approximate YDS question distribution for 80-question exam
const YDS_DISTRIBUTION: Record<QuestionCategory, number> = {
  vocabulary: 20,
  grammar: 18,
  paragraph: 10,
  cloze: 12,
  translation: 10,
  reading: 10,
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function selectQuestionsForExam(config: ExamConfig, allQuestions: Question[]): Question[] {
  const { questionCount } = config;

  if (config.mode === 'full') {
    // Full simulation: distribute according to YDS pattern
    return selectByDistribution(allQuestions, YDS_DISTRIBUTION, questionCount);
  }

  // Mini exam: proportional distribution based on available questions
  const totalAvailable = allQuestions.length;
  const categoryGroups = groupByCategory(allQuestions);
  const proportionalDistribution: Record<string, number> = {};

  for (const [category, questions] of Object.entries(categoryGroups)) {
    const proportion = questions.length / totalAvailable;
    proportionalDistribution[category] = Math.max(1, Math.round(proportion * questionCount));
  }

  // Adjust to exact count
  return selectByDistribution(allQuestions, proportionalDistribution as Record<QuestionCategory, number>, questionCount);
}

function groupByCategory(questions: Question[]): Record<string, Question[]> {
  const groups: Record<string, Question[]> = {};
  for (const q of questions) {
    if (!groups[q.category]) groups[q.category] = [];
    groups[q.category].push(q);
  }
  return groups;
}

function selectByDistribution(
  allQuestions: Question[],
  distribution: Record<QuestionCategory, number>,
  targetCount: number
): Question[] {
  const categoryGroups = groupByCategory(allQuestions);
  const selected: Question[] = [];

  // First pass: select up to distribution count from each category
  for (const [category, targetFromCategory] of Object.entries(distribution)) {
    const available = categoryGroups[category] || [];
    const shuffled = shuffleArray(available);
    const count = Math.min(targetFromCategory, shuffled.length);
    selected.push(...shuffled.slice(0, count));
  }

  // If we don't have enough, fill from remaining questions
  if (selected.length < targetCount) {
    const selectedIds = new Set(selected.map(q => q.id));
    const remaining = shuffleArray(allQuestions.filter(q => !selectedIds.has(q.id)));
    const needed = targetCount - selected.length;
    selected.push(...remaining.slice(0, needed));
  }

  // If we have too many, trim
  if (selected.length > targetCount) {
    selected.length = targetCount;
  }

  return shuffleArray(selected);
}

export function getExamTimeLimitMinutes(questionCount: number): number {
  // YDS: 150 minutes for 80 questions ≈ 1.875 min per question
  // Scale proportionally for mini exams
  if (questionCount === 80) return 150;
  if (questionCount === 40) return 75;
  if (questionCount === 20) return 40;
  return Math.round(questionCount * 1.875);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}sa ${mins}dk`;
  }
  if (mins > 0) {
    return `${mins}dk ${secs}sn`;
  }
  return `${secs}sn`;
}
