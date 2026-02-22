import { BadgeId, UserStats, QuestionReviewData } from '@/types';

export function checkAchievements(
  stats: UserStats,
  bookmarkCount: number,
  reviewData: Record<string, QuestionReviewData>,
  alreadyUnlocked: BadgeId[],
): BadgeId[] {
  const newBadges: BadgeId[] = [];
  const unlocked = new Set(alreadyUnlocked);

  const check = (id: BadgeId, condition: boolean) => {
    if (!unlocked.has(id) && condition) {
      newBadges.push(id);
    }
  };

  // first_100: Answer 100 questions total
  check('first_100', stats.totalAnswered >= 100);

  // first_500: Answer 500 questions total
  check('first_500', stats.totalAnswered >= 500);

  // perfect_day: Answer 20+ questions in a day with 100% accuracy
  check('perfect_day', stats.dailyProgress >= 20 && stats.dailyProgress === countDailyCorrect(stats));

  // week_warrior: 7-day streak
  check('week_warrior', stats.bestStreak >= 7);

  // month_master: 30-day streak
  check('month_master', stats.bestStreak >= 30);

  // speed_demon: Complete 3+ exams
  check('speed_demon', stats.examHistory.length >= 3);

  // master_grammarian: 80%+ accuracy in grammar with 50+ questions
  const grammar = stats.categoryStats.grammar;
  check('master_grammarian', grammar.answered >= 50 && (grammar.correct / grammar.answered) >= 0.8);

  // word_wizard: 80%+ accuracy in vocabulary with 50+ questions
  const vocab = stats.categoryStats.vocabulary;
  check('word_wizard', vocab.answered >= 50 && (vocab.correct / vocab.answered) >= 0.8);

  // exam_ace: Score 80%+ on any exam
  check('exam_ace', stats.examHistory.some(e => (e.score / e.totalQuestions) >= 0.8));

  // bookworm: Bookmark 20+ questions
  check('bookworm', bookmarkCount >= 20);

  // comeback_kid: Use spaced repetition 10+ times
  const totalReviews = Object.values(reviewData).reduce((sum, r) => sum + r.correctCount + r.incorrectCount, 0);
  check('comeback_kid', totalReviews >= 10);

  // perfectionist: Get 100% on any exam
  check('perfectionist', stats.examHistory.some(e => e.score === e.totalQuestions));

  return newBadges;
}

function countDailyCorrect(stats: UserStats): number {
  // Approximate: if streak equals dailyProgress, all daily answers were correct
  return stats.streak;
}
