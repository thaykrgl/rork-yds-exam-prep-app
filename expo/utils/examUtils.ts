import { Question, ExamConfig, ExamAnswer, CategoryBreakdown, QuestionCategory } from '@/types';

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

// --- YDS Score Estimation Algorithm ---

export interface YDSScoreResult {
  score: number;
  level: string;
  message: string;
  details: {
    rawPercentage: number;
    difficultyBonus: number;
    categoryBonus: number;
  };
}

const DIFFICULTY_WEIGHTS: Record<string, number> = {
  easy: 1.0,
  medium: 1.15,
  hard: 1.35,
};

interface YDSLevel {
  min: number;
  level: string;
  message: string;
}

const YDS_LEVELS: YDSLevel[] = [
  { min: 90, level: 'Uzman Seviye', message: 'Muhteşem! YDS\'de zirvedesin!' },
  { min: 80, level: 'İleri Seviye', message: 'Harika performans! Hedefe çok yakınsın!' },
  { min: 70, level: 'İyi Seviye', message: 'Güçlü bir performans! Biraz daha pratikle hedefine ulaşabilirsin.' },
  { min: 60, level: 'Orta-İleri', message: 'İyi gidiyorsun! Zayıf kategorilerine odaklanarak puanını yükseltebilirsin.' },
  { min: 50, level: 'Orta Seviye', message: 'Gelişme gösteriyorsun! Düzenli çalışmayla puanın hızla artacak.' },
  { min: 40, level: 'Orta-Alt', message: 'Temellerin oturuyor. Gramer ve kelime çalışmasına ağırlık ver!' },
  { min: 0, level: 'Başlangıç', message: 'Her usta bir zamanlar çıraktı. Düzenli çalışmayla başarı gelecek!' },
];

export function getYDSLevel(score: number): { level: string; message: string } {
  for (const entry of YDS_LEVELS) {
    if (score >= entry.min) {
      return { level: entry.level, message: entry.message };
    }
  }
  return { level: YDS_LEVELS[YDS_LEVELS.length - 1].level, message: YDS_LEVELS[YDS_LEVELS.length - 1].message };
}

export function getYDSScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#3B82F6';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

export function calculateEstimatedYDSScore(
  questions: Question[],
  answers: ExamAnswer[],
  categoryBreakdown: CategoryBreakdown[]
): YDSScoreResult {
  if (questions.length === 0) {
    return { score: 0, level: 'Başlangıç', message: '', details: { rawPercentage: 0, difficultyBonus: 0, categoryBonus: 0 } };
  }

  // Step 1: Difficulty-weighted raw score
  let weightedCorrect = 0;
  let totalWeight = 0;
  let rawCorrect = 0;

  questions.forEach(q => {
    const weight = DIFFICULTY_WEIGHTS[q.difficulty] || 1.0;
    totalWeight += weight;
    const answer = answers.find(a => a.questionId === q.id);
    if (answer && answer.selectedAnswer === q.correctAnswer) {
      weightedCorrect += weight;
      rawCorrect++;
    }
  });

  const rawPercentage = rawCorrect / questions.length;
  const weightedPercentage = totalWeight > 0 ? weightedCorrect / totalWeight : 0;

  // difficultyBonus: how much the weighted score exceeds raw score (in points)
  const difficultyBonus = Math.round((weightedPercentage - rawPercentage) * 100 * 10) / 10;

  // Step 2: Category balance bonus
  let categoryBonus = 0;
  if (categoryBreakdown.length >= 3) {
    const allAbove50 = categoryBreakdown.every(c => c.percentage >= 50);
    const allAbove30 = categoryBreakdown.every(c => c.percentage >= 30);
    if (allAbove50) {
      categoryBonus = 3;
    } else if (allAbove30) {
      categoryBonus = 1;
    }
  }

  // Step 3: Apply YDS scoring curve
  // Slight power curve to approximate real YDS normalization
  const curvedScore = 100 * Math.pow(weightedPercentage, 0.97);
  const finalScore = Math.max(0, Math.min(100, Math.round(curvedScore + categoryBonus)));

  const { level, message } = getYDSLevel(finalScore);

  return {
    score: finalScore,
    level,
    message,
    details: {
      rawPercentage: Math.round(rawPercentage * 100),
      difficultyBonus,
      categoryBonus,
    },
  };
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
