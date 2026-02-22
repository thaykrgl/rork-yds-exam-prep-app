import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GrammarTopicId, GrammarTopicProgress } from '@/types';
import { grammarTopics } from '@/data/grammarTopics';

interface GrammarStore {
  topicProgress: Record<string, GrammarTopicProgress>;

  markAsRead: (topicId: GrammarTopicId) => void;
  isTopicRead: (topicId: GrammarTopicId) => boolean;
  getReadCount: () => number;
  getTotalTopics: () => number;
  getTopicProgress: (topicId: GrammarTopicId) => GrammarTopicProgress | undefined;
}

export const useGrammarStore = create<GrammarStore>()(
  persist(
    (set, get) => ({
      topicProgress: {},

      markAsRead: (topicId: GrammarTopicId) => {
        const now = new Date().toISOString();
        set((state) => {
          const existing = state.topicProgress[topicId];
          return {
            topicProgress: {
              ...state.topicProgress,
              [topicId]: {
                topicId,
                isRead: true,
                readDate: existing?.readDate || now,
                readCount: (existing?.readCount || 0) + 1,
                lastReadDate: now,
              },
            },
          };
        });
      },

      isTopicRead: (topicId: GrammarTopicId) => {
        return get().topicProgress[topicId]?.isRead || false;
      },

      getReadCount: () => {
        return Object.values(get().topicProgress).filter((p) => p.isRead).length;
      },

      getTotalTopics: () => {
        return grammarTopics.length;
      },

      getTopicProgress: (topicId: GrammarTopicId) => {
        return get().topicProgress[topicId];
      },
    }),
    {
      name: 'yds_grammar_progress',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ topicProgress: state.topicProgress }),
    }
  )
);
