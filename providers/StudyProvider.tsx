import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { UserStats, QuestionCategory, VocabularyCard } from '@/types';
import { vocabularyCards as initialVocab } from '@/mocks/questions';

const STATS_KEY = 'yds_user_stats';
const VOCAB_KEY = 'yds_vocab_cards';

const defaultStats: UserStats = {
  totalAnswered: 0,
  correctAnswers: 0,
  streak: 0,
  bestStreak: 0,
  dailyGoal: 20,
  dailyProgress: 0,
  categoryStats: {
    vocabulary: { answered: 0, correct: 0 },
    grammar: { answered: 0, correct: 0 },
    paragraph: { answered: 0, correct: 0 },
    translation: { answered: 0, correct: 0 },
    cloze: { answered: 0, correct: 0 },
  },
  lastStudyDate: new Date().toISOString().split('T')[0],
};

export const [StudyProvider, useStudy] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [vocabCards, setVocabCards] = useState<VocabularyCard[]>(initialVocab);

  const statsQuery = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserStats;
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastStudyDate !== today) {
          parsed.dailyProgress = 0;
          parsed.lastStudyDate = today;
        }
        return parsed;
      }
      return defaultStats;
    },
  });

  const vocabQuery = useQuery({
    queryKey: ['vocabCards'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(VOCAB_KEY);
      return stored ? (JSON.parse(stored) as VocabularyCard[]) : initialVocab;
    },
  });

  const saveStatsMutation = useMutation({
    mutationFn: async (newStats: UserStats) => {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
      return newStats;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
  });

  const saveVocabMutation = useMutation({
    mutationFn: async (cards: VocabularyCard[]) => {
      await AsyncStorage.setItem(VOCAB_KEY, JSON.stringify(cards));
      return cards;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabCards'] });
    },
  });

  useEffect(() => {
    if (statsQuery.data) setStats(statsQuery.data);
  }, [statsQuery.data]);

  useEffect(() => {
    if (vocabQuery.data) setVocabCards(vocabQuery.data);
  }, [vocabQuery.data]);

  const recordAnswer = useCallback((category: QuestionCategory, isCorrect: boolean) => {
    setStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const updated: UserStats = {
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        dailyProgress: prev.dailyProgress + 1,
        lastStudyDate: new Date().toISOString().split('T')[0],
        categoryStats: {
          ...prev.categoryStats,
          [category]: {
            answered: prev.categoryStats[category].answered + 1,
            correct: prev.categoryStats[category].correct + (isCorrect ? 1 : 0),
          },
        },
      };
      saveStatsMutation.mutate(updated);
      return updated;
    });
  }, [saveStatsMutation]);

  const toggleMastered = useCallback((cardId: string) => {
    setVocabCards(prev => {
      const updated = prev.map(c => c.id === cardId ? { ...c, mastered: !c.mastered } : c);
      saveVocabMutation.mutate(updated);
      return updated;
    });
  }, [saveVocabMutation]);

  const resetStats = useCallback(() => {
    setStats(defaultStats);
    saveStatsMutation.mutate(defaultStats);
  }, [saveStatsMutation]);

  return {
    stats,
    vocabCards,
    recordAnswer,
    toggleMastered,
    resetStats,
    isLoading: statsQuery.isLoading || vocabQuery.isLoading,
  };
});
