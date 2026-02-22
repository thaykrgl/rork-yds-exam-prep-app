import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, ChevronRight, CheckCircle, XCircle, Trophy, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { questions } from '@/mocks/questions';
import { useStudy } from '@/providers/StudyProvider';
import { Question, QuestionCategory } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { recordAnswer } = useStudy();

  const quizQuestions = useMemo(() => {
    const filtered = category === 'all'
      ? [...questions]
      : questions.filter(q => q.category === category);
    return filtered.sort(() => Math.random() - 0.5);
  }, [category]);

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

    setSelectedAnswer(index);
    setIsAnswered(true);

    const isCorrect = index === currentQuestion.correctAnswer;
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(prev => prev + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    recordAnswer(currentQuestion.category, isCorrect);
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
          colors={isGreat ? [Colors.primary, Colors.primaryLight] : [Colors.primary, '#2A3A5C']}
          style={styles.resultContainer}
        >
          <View style={styles.resultContent}>
            <View style={[styles.trophyCircle, { backgroundColor: isGreat ? Colors.accent + '30' : 'rgba(255,255,255,0.1)' }]}>
              <Trophy color={isGreat ? Colors.accent : Colors.textLight} size={48} />
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
              <LinearGradient colors={[Colors.accent, Colors.accentLight]} style={styles.resultButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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
          <X color={Colors.text} size={22} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{currentIndex + 1}/{quizQuestions.length}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{getCategoryLabel(currentQuestion.category)}</Text>
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
        </Animated.View>
      </ScrollView>

      {isAnswered && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.nextButton} activeOpacity={0.8} onPress={handleNext} testID="next-question">
            <LinearGradient colors={[Colors.accent, Colors.accentLight]} style={styles.nextGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.nextText}>
                {currentIndex >= quizQuestions.length - 1 ? 'Sonuçları Gör' : 'Sonraki Soru'}
              </Text>
              <ChevronRight color={Colors.primary} size={20} />
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
  };
  return labels[cat];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: 4,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  scoreBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    color: Colors.accent,
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
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight + '15',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primaryLight,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSoft + '30',
  },
  optionCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  optionWrong: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
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
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterCorrect: {
    backgroundColor: Colors.success,
  },
  optionLetterWrong: {
    backgroundColor: Colors.error,
  },
  optionLetterText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  optionLetterTextActive: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  optionTextCorrect: {
    color: Colors.success,
    fontWeight: '600' as const,
  },
  optionTextWrong: {
    color: Colors.error,
  },
  explanationBox: {
    marginTop: 20,
    backgroundColor: Colors.primary + '08',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
    color: Colors.primary,
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
    color: Colors.accentSoft,
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
    color: Colors.accent,
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
    color: Colors.primary,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '600' as const,
  },
});
