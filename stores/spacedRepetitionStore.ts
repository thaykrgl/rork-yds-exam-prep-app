import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionReviewData, Question } from '@/types';
import { calculateNextReview, createInitialReviewData, isQuestionDue } from '@/utils/spacedRepetition';

interface SpacedRepetitionStore {
  reviewData: Record<string, QuestionReviewData>;
  recordReview: (questionId: string, isCorrect: boolean) => void;
  getDueQuestions: (allQuestions: Question[]) => Question[];
  getDueCount: () => number;
}

export const useSpacedRepetitionStore = create<SpacedRepetitionStore>()(
  persist(
    (set, get) => ({
      reviewData: {},

      recordReview: (questionId: string, isCorrect: boolean) => {
        set((state) => {
          const existing = state.reviewData[questionId] || createInitialReviewData(questionId);
          const quality = isCorrect ? 4 : 1;
          const { easeFactor, interval, repetitions, nextReviewDate } = calculateNextReview(
            quality,
            existing.easeFactor,
            existing.interval,
            existing.repetitions,
          );

          return {
            reviewData: {
              ...state.reviewData,
              [questionId]: {
                ...existing,
                easeFactor,
                interval,
                repetitions,
                nextReviewDate,
                lastAttemptDate: new Date().toISOString().split('T')[0],
                correctCount: existing.correctCount + (isCorrect ? 1 : 0),
                incorrectCount: existing.incorrectCount + (isCorrect ? 0 : 1),
              },
            },
          };
        });
      },

      getDueQuestions: (allQuestions: Question[]) => {
        const { reviewData } = get();
        return allQuestions.filter((q) => {
          const data = reviewData[q.id];
          if (!data) return false;
          return isQuestionDue(data);
        });
      },

      getDueCount: () => {
        const { reviewData } = get();
        const today = new Date().toISOString().split('T')[0];
        return Object.values(reviewData).filter((r) => r.nextReviewDate <= today).length;
      },
    }),
    {
      name: 'yds_spaced_repetition',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
