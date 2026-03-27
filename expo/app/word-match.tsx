import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw, Trophy, Clock, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useThemeStore } from '@/stores/themeStore';
import { useStudy } from '@/providers/StudyProvider';

const PAIR_COUNT = 6;

interface WordPair {
  id: string;
  word: string;
  meaning: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function WordMatchScreen() {
  const router = useRouter();
  const colors = useColors();
  const { mode: themeMode } = useThemeStore();
  const { vocabCards } = useStudy();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [pairs, setPairs] = useState<WordPair[]>([]);
  const [shuffledMeanings, setShuffledMeanings] = useState<WordPair[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ word: string; meaning: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [round, setRound] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initRound = useCallback(() => {
    // Prefer unmastered cards, fallback to all
    const unmastered = vocabCards.filter(c => !c.mastered);
    const pool = unmastered.length >= PAIR_COUNT ? unmastered : vocabCards;
    const selected = shuffleArray(pool).slice(0, PAIR_COUNT).map(c => ({
      id: c.id,
      word: c.word,
      meaning: c.meaning,
    }));
    setPairs(selected);
    setShuffledMeanings(shuffleArray([...selected]));
    setSelectedWord(null);
    setSelectedMeaning(null);
    setMatched(new Set());
    setWrongPair(null);
  }, [vocabCards]);

  useEffect(() => {
    initRound();
    setStartTime(Date.now());
  }, []);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, gameOver]);

  // Check match when both selected
  useEffect(() => {
    if (!selectedWord || !selectedMeaning) return;

    const wordPair = pairs.find(p => p.id === selectedWord);
    const meaningPair = pairs.find(p => p.id === selectedMeaning);

    if (wordPair && meaningPair && wordPair.id === meaningPair.id) {
      // Correct match
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newMatched = new Set(matched);
      newMatched.add(wordPair.id);
      setMatched(newMatched);
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setSelectedWord(null);
      setSelectedMeaning(null);

      // Check if round complete
      if (newMatched.size === PAIR_COUNT) {
        setGameOver(true);
      }
    } else {
      // Wrong match
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrongPair({ word: selectedWord, meaning: selectedMeaning || '' });
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedMeaning(null);
        setWrongPair(null);
      }, 500);
    }
  }, [selectedWord, selectedMeaning]);

  const handleWordPress = (id: string) => {
    if (matched.has(id) || wrongPair) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWord(id);
  };

  const handleMeaningPress = (id: string) => {
    if (matched.has(id) || wrongPair) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMeaning(id);
  };

  const handleNewRound = () => {
    setRound(prev => prev + 1);
    setGameOver(false);
    setScore({ correct: 0, wrong: 0 });
    setStartTime(Date.now());
    setElapsed(0);
    initRound();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (gameOver) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: colors.success + '15' }]}>
            <Trophy size={48} color={colors.success} />
          </View>
          <Text style={styles.resultTitle}>Tebrikler!</Text>
          <Text style={styles.resultSub}>Tüm eşleşmeleri tamamladın</Text>

          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <CheckCircle size={20} color={colors.success} />
              <Text style={styles.resultStatValue}>{score.correct}</Text>
              <Text style={styles.resultStatLabel}>Doğru</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatValue, { color: colors.error }]}>{score.wrong}</Text>
              <Text style={styles.resultStatLabel}>Yanlış</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.resultStatValue}>{formatTime(elapsed)}</Text>
              <Text style={styles.resultStatLabel}>Süre</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.playAgainBtn} onPress={handleNewRound}>
            <RotateCcw size={18} color="#FFFFFF" />
            <Text style={styles.playAgainText}>Tekrar Oyna</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelime Eşleştirme</Text>
        <Text style={styles.headerTimer}>{formatTime(elapsed)}</Text>
      </View>

      {/* Score Bar */}
      <View style={styles.scoreBar}>
        <Text style={[styles.scoreText, { color: colors.success }]}>
          Doğru: {score.correct}
        </Text>
        <Text style={styles.matchCount}>
          {matched.size}/{PAIR_COUNT}
        </Text>
        <Text style={[styles.scoreText, { color: colors.error }]}>
          Yanlış: {score.wrong}
        </Text>
      </View>

      {/* Game Board */}
      <View style={styles.board}>
        {/* Left Column: Words */}
        <View style={styles.column}>
          <Text style={styles.columnLabel}>Kelime</Text>
          {pairs.map(pair => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedWord === pair.id;
            const isWrong = wrongPair?.word === pair.id;

            return (
              <TouchableOpacity
                key={`w_${pair.id}`}
                style={[
                  styles.tile,
                  isMatched && styles.tileMatched,
                  isSelected && styles.tileSelected,
                  isWrong && styles.tileWrong,
                ]}
                onPress={() => handleWordPress(pair.id)}
                disabled={isMatched}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tileText,
                    isMatched && styles.tileTextMatched,
                    isSelected && styles.tileTextSelected,
                    isWrong && styles.tileTextWrong,
                  ]}
                  numberOfLines={1}
                >
                  {isMatched ? '✓' : pair.word}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Column: Meanings */}
        <View style={styles.column}>
          <Text style={styles.columnLabel}>Anlam</Text>
          {shuffledMeanings.map(pair => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedMeaning === pair.id;
            const isWrong = wrongPair?.meaning === pair.id;

            return (
              <TouchableOpacity
                key={`m_${pair.id}`}
                style={[
                  styles.tile,
                  isMatched && styles.tileMatched,
                  isSelected && styles.tileSelected,
                  isWrong && styles.tileWrong,
                ]}
                onPress={() => handleMeaningPress(pair.id)}
                disabled={isMatched}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tileText,
                    styles.tileTextMeaning,
                    isMatched && styles.tileTextMatched,
                    isSelected && styles.tileTextSelected,
                    isWrong && styles.tileTextWrong,
                  ]}
                  numberOfLines={2}
                >
                  {isMatched ? '✓' : pair.meaning}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerTimer: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primary + '12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  matchCount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  board: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 10,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  tileSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  tileMatched: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  tileWrong: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  tileText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  tileTextMeaning: {
    fontSize: 13,
    fontWeight: '600',
  },
  tileTextSelected: {
    color: colors.primary,
  },
  tileTextMatched: {
    color: colors.success,
    fontSize: 20,
  },
  tileTextWrong: {
    color: colors.error,
  },
  // Result Screen
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  resultIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  resultSub: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 28,
  },
  resultStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  resultStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  resultStatLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  resultStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  playAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    marginBottom: 12,
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
