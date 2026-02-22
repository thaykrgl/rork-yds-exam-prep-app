import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PremiumTier } from '@/types';

interface PremiumStore {
  tier: PremiumTier;
  dailyQuestionsAnswered: number;
  dailyQuestionLimit: number;
  dailyExamsCompleted: number;
  dailyExamLimit: number;
  lastResetDate: string;
  setTier: (tier: PremiumTier) => void;
  consumeQuestion: () => boolean;
  consumeExam: () => boolean;
  resetDailyCounters: () => void;
  checkAndResetDaily: () => void;
  restore: () => Promise<void>;
}

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => ({
      tier: 'free',
      dailyQuestionsAnswered: 0,
      dailyQuestionLimit: 10,
      dailyExamsCompleted: 0,
      dailyExamLimit: 1,
      lastResetDate: new Date().toISOString().split('T')[0],

      setTier: (tier) => {
        set({
          tier,
          dailyQuestionLimit: tier === 'premium' ? Infinity : 10,
          dailyExamLimit: tier === 'premium' ? Infinity : 1,
        });
      },

      consumeQuestion: () => {
        const state = get();
        if (state.tier === 'premium') return true;
        if (state.dailyQuestionsAnswered >= state.dailyQuestionLimit) return false;
        set({ dailyQuestionsAnswered: state.dailyQuestionsAnswered + 1 });
        return true;
      },

      consumeExam: () => {
        const state = get();
        if (state.tier === 'premium') return true;
        if (state.dailyExamsCompleted >= state.dailyExamLimit) return false;
        set({ dailyExamsCompleted: state.dailyExamsCompleted + 1 });
        return true;
      },

      resetDailyCounters: () => {
        set({
          dailyQuestionsAnswered: 0,
          dailyExamsCompleted: 0,
          lastResetDate: new Date().toISOString().split('T')[0],
        });
      },

      checkAndResetDaily: () => {
        const today = new Date().toISOString().split('T')[0];
        if (get().lastResetDate !== today) {
          get().resetDailyCounters();
        }
      },

      restore: async () => {
        // Stub for Phase 1 - RevenueCat integration will be added later
        // const customerInfo = await Purchases.restorePurchases();
        // if (customerInfo.activeSubscriptions.length > 0) get().setTier('premium');
        console.log('[Premium] Restore called - RevenueCat not yet integrated');
      },
    }),
    {
      name: 'yds_premium',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
