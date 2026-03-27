import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Grid3x3, ChevronLeft, ChevronRight, Flag, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useExamStore } from '@/stores/examStore';
import { useStudy } from '@/providers/StudyProvider';
import { useSpacedRepetitionStore } from '@/stores/spacedRepetitionStore';
import { selectQuestionsForExam } from '@/utils/examUtils';
import { questions } from '@/mocks/questions';
import { passages } from '@/mocks/passages';
import { ExamConfig, ReadingQuestion } from '@/types';
import QuestionCard from '@/components/QuestionCard';
import Timer from '@/components/Timer';
import ProgressBar from '@/components/ProgressBar';

export default function ExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ examConfigJson: string }>();
  const colors = useColors();
  const { saveExamResult } = useStudy();
  const [showGrid, setShowGrid] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    isActive,
    config,
    questions: examQuestions,
    answers,
    currentIndex,
    startExam,
    setAnswer,
    toggleFlag,
    navigateTo,
    nextQuestion,
    prevQuestion,
    submitExam,
    clearExam,
  } = useExamStore();

  // Initialize exam on mount or when params change
  useEffect(() => {
    if (isActive) return;

    try {
      let examConfig: ExamConfig;
      if (params.examConfigJson) {
        examConfig = JSON.parse(params.examConfigJson);
      } else {
        // Default to full simulation if no config provided
        examConfig = {
          mode: 'full',
          questionCount: 80,
          timeLimitMinutes: 150,
        };
      }

      const selectedQuestions = selectQuestionsForExam(examConfig, questions);
      if (selectedQuestions.length === 0) {
        throw new Error('No questions available for this configuration');
      }
      startExam(examConfig, selectedQuestions);
    } catch (e) {
      console.error('Exam initialization error:', e);
      Alert.alert('Hata', 'Sınav başlatılamadı. Lütfen tekrar deneyin.');
      router.back();
    }
  }, [params.examConfigJson, isActive, startExam]);

  const handleClose = useCallback(() => {
    Alert.alert(
      'Sınavdan Çık',
      'Sınavdan çıkmak istediğinize emin misiniz? İlerlemeniz kaydedilmeyecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çık',
          style: 'destructive',
          onPress: () => {
            clearExam();
            router.back();
          },
        },
      ]
    );
  }, [clearExam, router]);

  const handleSubmit = useCallback(() => {
    const unansweredCount = answers.filter(a => a.selectedAnswer === null).length;
    const message = unansweredCount > 0
      ? `${unansweredCount} soru cevaplanmadı. Sınavı bitirmek istediğinize emin misiniz?`
      : 'Sınavı bitirmek istediğinize emin misiniz?';

    Alert.alert('Sınavı Bitir', message, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Bitir',
        onPress: () => {
          const result = submitExam();
          saveExamResult(result);
          // Batch record into spaced repetition
          const srStore = useSpacedRepetitionStore.getState();
          result.answers.forEach((a) => {
            if (a.selectedAnswer !== null) {
              const q = examQuestions.find((eq) => eq.id === a.questionId);
              if (q) srStore.recordReview(a.questionId, a.selectedAnswer === q.correctAnswer);
            }
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace({ pathname: '/exam-result' as any, params: { examResultId: result.id } });
        },
      },
    ]);
  }, [answers, submitExam, saveExamResult, router, examQuestions]);

  const handleTimerExpire = useCallback(() => {
    const result = submitExam();
    saveExamResult(result);
    // Batch record into spaced repetition
    const srStore = useSpacedRepetitionStore.getState();
    result.answers.forEach((a) => {
      if (a.selectedAnswer !== null) {
        const q = examQuestions.find((eq) => eq.id === a.questionId);
        if (q) srStore.recordReview(a.questionId, a.selectedAnswer === q.correctAnswer);
      }
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Süre Doldu', 'Sınav süreniz doldu. Sonuçlarınız hesaplanıyor.', [
      { text: 'Tamam', onPress: () => router.replace({ pathname: '/exam-result' as any, params: { examResultId: result.id } }) },
    ]);
  }, [submitExam, saveExamResult, router, examQuestions]);

  const handleSelectAnswer = useCallback((index: number) => {
    if (!examQuestions[currentIndex]) return;
    setAnswer(examQuestions[currentIndex].id, index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [currentIndex, examQuestions, setAnswer]);

  const handleToggleFlag = useCallback(() => {
    if (!examQuestions[currentIndex]) return;
    toggleFlag(examQuestions[currentIndex].id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [currentIndex, examQuestions, toggleFlag]);

  if (!isActive || !config || examQuestions.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Sınav hazırlanıyor...</Text>
      </SafeAreaView>
    );
  }

  const currentQuestion = examQuestions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const answeredCount = answers.filter(a => a.selectedAnswer !== null).length;
  const flaggedCount = answers.filter(a => a.isFlagged).length;
  const isLastQuestion = currentIndex === examQuestions.length - 1;

  // Check if reading question and get passage
  const readingQuestion = currentQuestion as ReadingQuestion;
  const passage = readingQuestion.passageId
    ? passages.find(p => p.id === readingQuestion.passageId)
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Timer
          totalSeconds={config.timeLimitMinutes * 60}
          onExpire={handleTimerExpire}
          style={styles.timer}
        />

        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1}/{examQuestions.length}
          </Text>
        </View>

        <TouchableOpacity onPress={() => setShowGrid(true)} style={styles.gridButton}>
          <Grid3x3 size={22} color="#FFFFFF" />
          {flaggedCount > 0 && (
            <View style={[styles.flagBadge, { backgroundColor: colors.warning }]}>
              <Text style={styles.flagBadgeText}>{flaggedCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={answeredCount / examQuestions.length} height={4} color={colors.accent} />
      </View>

      {/* Question Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <QuestionCard
          question={currentQuestion}
          selectedAnswer={currentAnswer?.selectedAnswer ?? null}
          isAnswered={false}
          examMode={true}
          isFlagged={currentAnswer?.isFlagged ?? false}
          onSelectAnswer={handleSelectAnswer}
          passage={passage}
        />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={prevQuestion}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} color={currentIndex === 0 ? colors.textLight : colors.text} />
          <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>Önceki</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.flagButton, currentAnswer?.isFlagged && styles.flagButtonActive]}
          onPress={handleToggleFlag}
        >
          <Flag
            size={18}
            color={currentAnswer?.isFlagged ? colors.warning : colors.textSecondary}
            fill={currentAnswer?.isFlagged ? colors.warning : 'none'}
          />
        </TouchableOpacity>

        {isLastQuestion ? (
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.accent }]} onPress={handleSubmit}>
            <Send size={18} color={colors.primary} />
            <Text style={styles.submitButtonText}>Bitir</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={nextQuestion}>
            <Text style={styles.navButtonText}>Sonraki</Text>
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Question Grid Modal */}
      <Modal visible={showGrid} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Soru Haritası</Text>
              <View style={styles.modalStats}>
                <Text style={styles.modalStatText}>{answeredCount}/{examQuestions.length} cevaplanmış</Text>
                {flaggedCount > 0 && (
                  <Text style={styles.modalFlagText}>{flaggedCount} işaretli</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowGrid(false)} style={styles.modalCloseButton}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.gridLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.surfaceAlt }]} />
                <Text style={styles.legendText}>Boş</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                <Text style={styles.legendText}>Cevaplandı</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.legendText}>İşaretli</Text>
              </View>
            </View>

            <ScrollView style={styles.gridScroll}>
              <View style={styles.grid}>
                {examQuestions.map((_, idx) => {
                  const answer = answers[idx];
                  const isAnsweredQ = answer?.selectedAnswer !== null;
                  const isFlaggedQ = answer?.isFlagged;
                  const isCurrent = idx === currentIndex;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.gridItem,
                        isAnsweredQ && styles.gridItemAnswered,
                        isFlaggedQ && styles.gridItemFlagged,
                        isCurrent && styles.gridItemCurrent,
                      ]}
                      onPress={() => {
                        navigateTo(idx);
                        setShowGrid(false);
                      }}
                    >
                      <Text style={[
                        styles.gridItemText,
                        isAnsweredQ && styles.gridItemTextAnswered,
                        isCurrent && styles.gridItemTextCurrent,
                      ]}>
                        {idx + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity style={[styles.modalDoneButton, { backgroundColor: colors.primary }]} onPress={() => setShowGrid(false)}>
              <Text style={styles.modalDoneText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  counterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  gridButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
    backgroundColor: colors.surfaceAlt,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  navButtonTextDisabled: {
    color: colors.textLight,
  },
  flagButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  flagButtonActive: {
    backgroundColor: colors.warning + '20',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 12,
  },
  modalStatText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalFlagText: {
    fontSize: 13,
    color: colors.warning,
    fontWeight: '600',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  gridLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  gridScroll: {
    maxHeight: 350,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  gridItemAnswered: {
    backgroundColor: colors.accent + '20',
  },
  gridItemFlagged: {
    borderColor: colors.warning,
  },
  gridItemCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  gridItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  gridItemTextAnswered: {
    color: colors.accent,
  },
  gridItemTextCurrent: {
    color: colors.primary,
    fontWeight: '700',
  },
  modalDoneButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
