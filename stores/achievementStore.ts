import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Badge, BadgeId, UserStats, QuestionReviewData } from '@/types';
import { checkAchievements } from '@/utils/achievementChecker';
import { allBadges } from '@/data/badges';

interface AchievementStore {
  unlockedBadges: Badge[];
  newBadgeQueue: Badge[];
  checkAndUnlock: (stats: UserStats, bookmarkCount: number, reviewData: Record<string, QuestionReviewData>) => void;
  dismissBadge: () => Badge | undefined;
  isUnlocked: (badgeId: BadgeId) => boolean;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlockedBadges: [],
      newBadgeQueue: [],

      checkAndUnlock: (stats, bookmarkCount, reviewData) => {
        const alreadyUnlocked = get().unlockedBadges.map((b) => b.id);
        const newBadgeIds = checkAchievements(stats, bookmarkCount, reviewData, alreadyUnlocked);

        if (newBadgeIds.length === 0) return;

        const now = new Date().toISOString();
        const newBadges = newBadgeIds
          .map((id) => allBadges.find((b) => b.id === id))
          .filter((b): b is Badge => b !== undefined)
          .map((b) => ({ ...b, unlockedDate: now }));

        set((state) => ({
          unlockedBadges: [...state.unlockedBadges, ...newBadges],
          newBadgeQueue: [...state.newBadgeQueue, ...newBadges],
        }));
      },

      dismissBadge: () => {
        const { newBadgeQueue } = get();
        if (newBadgeQueue.length === 0) return undefined;
        const badge = newBadgeQueue[0];
        set({ newBadgeQueue: newBadgeQueue.slice(1) });
        return badge;
      },

      isUnlocked: (badgeId) => {
        return get().unlockedBadges.some((b) => b.id === badgeId);
      },
    }),
    {
      name: 'yds_achievements',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
