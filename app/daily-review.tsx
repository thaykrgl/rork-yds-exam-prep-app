import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, RefreshCw, CheckCircle, XCircle, ChevronRight, Trophy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { questions } from '@/mocks/questions';
import { passages } from '@/mocks/passages';
import { useSpacedRepetitionStore } from '@/stores/spacedRepetitionStore';
import { useStudy } from '@/providers/StudyProvider';
import { Question, ReadingQuestion } from '@/types';

export default function DailyReviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { recordAnswer } = useStudy();
  const { getDueQuestions } = useSpacedRepetitionStore();

  const reviewQuestions = useMemo(() => getDueQuestions(questions), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = reviewQuestions[currentIndex];

  const handleSelectAnswer = useCallback((index: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    const isCorrect = index === currentQuestion.correctAnswer;
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(prev => prev + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    recordAnswer(currentQuestion.id, currentQuestion.category, isCorrect);
  }, [isAnswered, currentQuestion, recordAnswer]);

  const handleNext = useCallback(() => {
    if (currentIndex >= reviewQuestions.length - 1) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [currentIndex, reviewQuestions.length]);

  if (reviewQuestions.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.emptyContainer}>
          <RefreshCw size={48} color={Colors.accent} />
          <Text style={styles.emptyTitle}>Harika!</Text>
          <Text style={styles.emptyText}>Tekrar edilecek soru yok. Yeni sorular çözerek tekrar havuzunu doldur.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.back()}>
            <Text style={styles.emptyButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  if (isFinished) {
    const percentage = reviewQuestions.length > 0 ? Math.round((score / reviewQuestions.length) * 100) : 0;
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.emptyContainer}>
          <Trophy size={48} color={Colors.accent} />
          <Text style={styles.emptyTitle}>Tekrar Tamamlandı!</Text>
          <Text style={styles.emptyText}>
            {reviewQuestions.length} sorudan {score} doğru (%{percentage})
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.back()}>
            <Text style={styles.emptyButtonText}>Kapat</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  const rq = currentQuestion as ReadingQuestion;
  const passage = rq.passageId ? passages.find(p => p.id === rq.passageId) : undefined;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color={Colors.text} size={22} />
        </TouchableOpacity>
        <View style={styles.progressInfo}>
          <RefreshCw size={16} color={Colors.accent} />
          <Text style={styles.progressText}>Tekrar {currentIndex + 1}/{reviewQuestions.length}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
        {passage && (
          <View style={styles.passageContainer}>
            {passage.title && <Text style={styles.passageTitle}>{passage.title}</Text>}
            <ScrollView style={styles.passageScroll} nestedScrollEnabled>
              <Text style={styles.passageText}>{passage.text}</Text>
            </ScrollView>
          </View>
        )}

        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            let bgColor = Colors.surface;
            let borderColor = 'transparent';
            let textColor = Colors.text;

            if (isAnswered) {
              if (isCorrect) { bgColor = Colors.success + '10'; borderColor = Colors.success; textColor = Colors.success; }
              else if (isSelected) { bgColor = Colors.error + '10'; borderColor = Colors.error; textColor = Colors.error; }
            } else if (isSelected) {
              borderColor = Colors.accent;
              bgColor = Colors.accentSoft + '30';
            }

            return (
              <TouchableOpacity
                key={index}
                style={[styles.option, { backgroundColor: bgColor, borderColor }]}
                activeOpacity={isAnswered ? 1 : 0.7}
                onPress={() => handleSelectAnswer(index)}
              >
                <View style={styles.optionRow}>
                  <View style={styles.optionLetter}>
                    <Text style={styles.optionLetterText}>{String.fromCharCode(65 + index)}</Text>
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  {isAnswered && isCorrect && <CheckCircle color={Colors.success} size={20} />}
                  {isAnswered && isSelected && !isCorrect && <XCircle color={Colors.error} size={20} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {isAnswered && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>Açıklama</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {isAnswered && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient colors={[Colors.accent, Colors.accentLight]} style={styles.nextGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.nextText}>
                {currentIndex >= reviewQuestions.length - 1 ? 'Sonuçları Gör' : 'Sonraki'}
              </Text>
              <ChevronRight color={Colors.primary} size={20} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16 },
  emptyTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  emptyText: { fontSize: 16, color: Colors.accentSoft, textAlign: 'center', lineHeight: 24 },
  emptyButton: { backgroundColor: Colors.accent, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  emptyButtonText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  progressInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  scoreBadge: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  scoreText: { color: Colors.accent, fontWeight: '700', fontSize: 14 },
  scrollContent: { flex: 1 },
  scrollInner: { padding: 20, paddingBottom: 100 },
  passageContainer: { backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 16, marginBottom: 16, maxHeight: 250, borderLeftWidth: 3, borderLeftColor: Colors.accent },
  passageTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginBottom: 8 },
  passageScroll: { maxHeight: 200 },
  passageText: { fontSize: 14, lineHeight: 22, color: Colors.text },
  questionText: { fontSize: 18, fontWeight: '600', color: Colors.text, lineHeight: 26, marginBottom: 24 },
  optionsContainer: { gap: 10 },
  option: { borderRadius: 14, padding: 16, borderWidth: 2 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionLetter: { width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  optionLetterText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  optionText: { flex: 1, fontSize: 15, lineHeight: 22 },
  explanationBox: { marginTop: 20, backgroundColor: Colors.primary + '08', borderRadius: 14, padding: 16, borderLeftWidth: 3, borderLeftColor: Colors.accent },
  explanationTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginBottom: 6 },
  explanationText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  nextButton: { borderRadius: 14, overflow: 'hidden' },
  nextGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  nextText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
});
