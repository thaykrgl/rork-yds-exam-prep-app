import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyStudyRecord, QuestionCategory } from '@/types';

const MAX_DAILY_RECORDS = 90;

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

interface AnalyticsStore {
  dailyRecords: DailyStudyRecord[];
  currentSessionStart: number | null;
  startSession: () => void;
  endSession: () => void;
  recordStudyActivity: (category: QuestionCategory, correct: boolean) => void;
  getWeeklyTrend: () => DailyStudyRecord[];
  getMonthlyTrend: () => DailyStudyRecord[];
  getTodayRecord: () => DailyStudyRecord | undefined;
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      dailyRecords: [],
      currentSessionStart: null,

      startSession: () => {
        set({ currentSessionStart: Date.now() });
      },

      endSession: () => {
        const { currentSessionStart } = get();
        if (!currentSessionStart) return;

        const elapsed = Math.round((Date.now() - currentSessionStart) / 1000);
        const today = getToday();

        set((state) => {
          const records = [...state.dailyRecords];
          const todayIdx = records.findIndex((r) => r.date === today);

          if (todayIdx >= 0) {
            records[todayIdx] = {
              ...records[todayIdx],
              studyTimeSeconds: records[todayIdx].studyTimeSeconds + elapsed,
            };
          } else {
            records.push({
              date: today,
              questionsAnswered: 0,
              questionsCorrect: 0,
              studyTimeSeconds: elapsed,
              categoriesStudied: [],
            });
          }

          return {
            dailyRecords: records.slice(-MAX_DAILY_RECORDS),
            currentSessionStart: null,
          };
        });
      },

      recordStudyActivity: (category, correct) => {
        const today = getToday();
        set((state) => {
          const records = [...state.dailyRecords];
          const todayIdx = records.findIndex((r) => r.date === today);

          if (todayIdx >= 0) {
            const record = { ...records[todayIdx] };
            record.questionsAnswered += 1;
            if (correct) record.questionsCorrect += 1;
            if (!record.categoriesStudied.includes(category)) {
              record.categoriesStudied = [...record.categoriesStudied, category];
            }
            records[todayIdx] = record;
          } else {
            records.push({
              date: today,
              questionsAnswered: 1,
              questionsCorrect: correct ? 1 : 0,
              studyTimeSeconds: 0,
              categoriesStudied: [category],
            });
          }

          return { dailyRecords: records.slice(-MAX_DAILY_RECORDS) };
        });
      },

      getWeeklyTrend: () => {
        const records = get().dailyRecords;
        return records.slice(-7);
      },

      getMonthlyTrend: () => {
        const records = get().dailyRecords;
        return records.slice(-30);
      },

      getTodayRecord: () => {
        const today = getToday();
        return get().dailyRecords.find((r) => r.date === today);
      },
    }),
    {
      name: 'yds_analytics',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        dailyRecords: state.dailyRecords,
      }),
    },
  ),
);
