import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, ChevronRight, CheckCircle, XCircle, Trophy, ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { questions } from '@/mocks/questions';
import { passages } from '@/mocks/passages';
import { useStudy } from '@/providers/StudyProvider';
import { usePremiumStore } from '@/stores/premiumStore';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { Question, QuestionCategory, ReadingQuestion } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { category, grammarTopicId } = useLocalSearchParams<{ category: string; grammarTopicId?: string }>();
  const { recordAnswer } = useStudy();
  const { isBookmarked, toggleBookmark } = useBookmarkStore();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const quizQuestions = useMemo(() => {
    let filtered = category === 'all'
      ? [...questions]
      : questions.filter(q => q.category === category);

    // Filter by grammar topic's related question IDs if provided
    if (grammarTopicId) {
      const { grammarTopics } = require('@/data/grammarTopics');
      const topic = grammarTopics.find((t: any) => t.id === grammarTopicId);
      if (topic && topic.relatedQuestionIds.length > 0) {
        filtered = filtered.filter(q => topic.relatedQuestionIds.includes(q.id));
      }
    }

    return filtered.sort(() => Math.random() - 0.5);
  }, [category, grammarTopicId]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = quizQuestions[currentIndex];
  const progress = quizQuestions.length > 0 ? (currentIndex + 1) / quizQuestions.length : 0;

  const handleSelectAnswer = useCallback((index: number) => {
    if (isAnswered) return;

    // Premium daily question limit check
    const canAnswer = usePremiumStore.getState().consumeQuestion();
    if (!canAnswer) {
      // Will be handled by PaywallScreen in the UI layer
      return;
    }

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
    if (currentIndex >= quizQuestions.length - 1) {
      setIsFinished(true);
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 0, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);

      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [currentIndex, quizQuestions.length, fadeAnim, slideAnim]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  if (isFinished) {
    const percentage = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;
    const isGreat = percentage >= 70;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={isGreat ? [colors.primary, colors.primaryLight] : [colors.primary, '#2A3A5C']}
          style={styles.resultContainer}
        >
          <View style={styles.resultContent}>
            <View style={[styles.trophyCircle, { backgroundColor: isGreat ? colors.accent + '30' : 'rgba(255,255,255,0.1)' }]}>
              <Trophy color={isGreat ? colors.accent : '#FFFFFF'} size={48} />
            </View>

            <Text style={styles.resultTitle}>
              {isGreat ? 'Harika!' : 'İyi Deneme!'}
            </Text>
            <Text style={styles.resultSubtitle}>
              {quizQuestions.length} sorudan {score} doğru
            </Text>

            <View style={styles.resultScoreCard}>
              <Text style={styles.resultPercentage}>%{percentage}</Text>
              <Text style={styles.resultLabel}>Başarı Oranı</Text>
            </View>

            <TouchableOpacity style={styles.resultButton} activeOpacity={0.8} onPress={handleClose}>
              <LinearGradient colors={[colors.accent, colors.accentLight]} style={styles.resultButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.resultButtonText}>Kapat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>Bu kategoride soru bulunamadı.</Text>
        <TouchableOpacity onPress={handleClose} style={{ marginTop: 16 }}>
          <Text style={styles.backLink}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton} testID="close-quiz">
          <X color={colors.text} size={22} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.accent }]} />
          </View>
          <Text style={styles.progressText}>{currentIndex + 1}/{quizQuestions.length}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          {/* Reading passage */}
          {(() => {
            const rq = currentQuestion as ReadingQuestion;
            const passage = rq.passageId ? passages.find(p => p.id === rq.passageId) : undefined;
            if (passage) {
              return (
                <View style={styles.passageContainer}>
                  {passage.title && <Text style={styles.passageTitle}>{passage.title}</Text>}
                  <ScrollView style={styles.passageScroll} nestedScrollEnabled>
                    <Text style={styles.passageText}>{passage.text}</Text>
                  </ScrollView>
                </View>
              );
            }
            return null;
          })()}

          <View style={styles.categoryRow}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{getCategoryLabel(currentQuestion.category)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => { toggleBookmark(currentQuestion.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={styles.bookmarkButton}
            >
              {isBookmarked(currentQuestion.id) ? (
                <BookmarkCheck size={20} color={colors.accent} />
              ) : (
                <Bookmark size={20} color={colors.textLight} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              let optionStyle = styles.option;
              let optionTextStyle = styles.optionText;

              if (isAnswered) {
                if (isCorrect) {
                  optionStyle = { ...styles.option, ...styles.optionCorrect };
                  optionTextStyle = { ...styles.optionText, ...styles.optionTextCorrect };
                } else if (isSelected && !isCorrect) {
                  optionStyle = { ...styles.option, ...styles.optionWrong };
                  optionTextStyle = { ...styles.optionText, ...styles.optionTextWrong };
                }
              } else if (isSelected) {
                optionStyle = { ...styles.option, ...styles.optionSelected };
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={optionStyle}
                  activeOpacity={isAnswered ? 1 : 0.7}
                  onPress={() => handleSelectAnswer(index)}
                  testID={`option-${index}`}
                >
                  <View style={styles.optionRow}>
                    <View style={[styles.optionLetter, isAnswered && isCorrect && styles.optionLetterCorrect, isAnswered && isSelected && !isCorrect && styles.optionLetterWrong]}>
                      <Text style={[styles.optionLetterText, isAnswered && isCorrect && styles.optionLetterTextActive, isAnswered && isSelected && !isCorrect && styles.optionLetterTextActive]}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={optionTextStyle}>{option}</Text>
                    {isAnswered && isCorrect && <CheckCircle color={colors.success} size={20} />}
                    {isAnswered && isSelected && !isCorrect && <XCircle color={colors.error} size={20} />}
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
        </Animated.View>
      </ScrollView>

      {isAnswered && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.nextButton} activeOpacity={0.8} onPress={handleNext} testID="next-question">
            <LinearGradient colors={[colors.accent, colors.accentLight]} style={styles.nextGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.nextText}>
                {currentIndex >= quizQuestions.length - 1 ? 'Sonuçları Gör' : 'Sonraki Soru'}
              </Text>
              <ChevronRight color={colors.primary} size={20} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function getCategoryLabel(cat: QuestionCategory): string {
  const labels: Record<QuestionCategory, string> = {
    vocabulary: 'Kelime Bilgisi',
    grammar: 'Dilbilgisi',
    paragraph: 'Paragraf',
    translation: 'Çeviri',
    cloze: 'Boşluk Doldurma',
    reading: 'Okuduğunu Anlama',
  };
  return labels[cat];
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: 4,
  },
  progressBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    color: colors.accent,
    fontWeight: '700' as const,
    fontSize: 14,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 20,
    paddingBottom: 100,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight + '15',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bookmarkButton: {
    padding: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primaryLight,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft + '30',
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  optionWrong: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterCorrect: {
    backgroundColor: colors.success,
  },
  optionLetterWrong: {
    backgroundColor: colors.error,
  },
  optionLetterText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textSecondary,
  },
  optionLetterTextActive: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  optionTextCorrect: {
    color: colors.success,
    fontWeight: '600' as const,
  },
  optionTextWrong: {
    color: colors.error,
  },
  explanationBox: {
    marginTop: 20,
    backgroundColor: colors.primary + '08',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    alignItems: 'center',
    padding: 30,
  },
  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: colors.headerSubtitle,
    marginBottom: 30,
  },
  resultScoreCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  resultPercentage: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: colors.accent,
  },
  resultLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  resultButton: {
    borderRadius: 14,
    overflow: 'hidden',
    width: SCREEN_WIDTH - 80,
  },
  resultButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  resultButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  passageContainer: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    maxHeight: 250,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  passageTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  passageScroll: {
    maxHeight: 200,
  },
  passageText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  backLink: {
    fontSize: 15,
    color: colors.accent,
    fontWeight: '600' as const,
  },
});
