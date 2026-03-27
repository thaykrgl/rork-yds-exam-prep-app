import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookmarkEntry, Question, QuestionCategory } from '@/types';

interface BookmarkStore {
  bookmarks: BookmarkEntry[];
  isBookmarked: (questionId: string) => boolean;
  toggleBookmark: (questionId: string) => void;
  getBookmarkedQuestions: (allQuestions: Question[], category?: QuestionCategory) => Question[];
  getBookmarkCount: () => number;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      isBookmarked: (questionId: string) => {
        return get().bookmarks.some((b) => b.questionId === questionId);
      },

      toggleBookmark: (questionId: string) => {
        set((state) => {
          const exists = state.bookmarks.some((b) => b.questionId === questionId);
          if (exists) {
            return { bookmarks: state.bookmarks.filter((b) => b.questionId !== questionId) };
          }
          return {
            bookmarks: [
              ...state.bookmarks,
              { questionId, savedDate: new Date().toISOString() },
            ],
          };
        });
      },

      getBookmarkedQuestions: (allQuestions: Question[], category?: QuestionCategory) => {
        const bookmarkIds = new Set(get().bookmarks.map((b) => b.questionId));
        return allQuestions.filter((q) => {
          if (!bookmarkIds.has(q.id)) return false;
          if (category && q.category !== category) return false;
          return true;
        });
      },

      getBookmarkCount: () => get().bookmarks.length,
    }),
    {
      name: 'yds_bookmarks',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
