import { QuestionReviewData } from '@/types';

/**
 * SM-2 Spaced Repetition Algorithm
 * quality: 0-5 (0=complete failure, 5=perfect response)
 * For our use: correct = quality 4, incorrect = quality 1
 */
export function calculateNextReview(
  quality: number,
  currentEaseFactor: number,
  currentInterval: number,
  currentRepetitions: number,
): { easeFactor: number; interval: number; repetitions: number; nextReviewDate: string } {
  let easeFactor = currentEaseFactor;
  let interval: number;
  let repetitions: number;

  if (quality >= 3) {
    // Correct answer
    repetitions = currentRepetitions + 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }
  } else {
    // Incorrect answer - reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  return { easeFactor, interval, repetitions, nextReviewDate };
}

export function createInitialReviewData(questionId: string): QuestionReviewData {
  return {
    questionId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString().split('T')[0],
    lastAttemptDate: new Date().toISOString().split('T')[0],
    correctCount: 0,
    incorrectCount: 0,
  };
}

export function isQuestionDue(reviewData: QuestionReviewData): boolean {
  const today = new Date().toISOString().split('T')[0];
  return reviewData.nextReviewDate <= today;
}
