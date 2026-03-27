import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Clock, Target, Home, RotateCcw, ChevronDown, ChevronUp, Share2, TrendingUp, Zap } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { useThemeStore } from '@/stores/themeStore';
import { shareTextResult, generateShareMessage } from '@/utils/sharing';
import { useStudy } from '@/providers/StudyProvider';
import { questions as allQuestions } from '@/mocks/questions';
import { formatDuration, getYDSLevel, getYDSScoreColor } from '@/utils/examUtils';
import { ExamResult, CategoryBreakdown } from '@/types';
import ProgressBar from '@/components/ProgressBar';

const categoryNames: Record<string, string> = {
  vocabulary: 'Kelime Bilgisi',
  grammar: 'Dilbilgisi',
  paragraph: 'Paragraf Tamamlama',
  translation: 'Çeviri',
  cloze: 'Boşluk Doldurma',
  reading: 'Okuduğunu Anlama',
};

const categoryColors: Record<string, string> = {
  vocabulary: '#3B82F6',
  grammar: '#8B5CF6',
  paragraph: '#10B981',
  translation: '#F59E0B',
  cloze: '#EF4444',
  reading: '#14B8A6',
};

export default function ExamResultScreen() {
  const router = useRouter();
  const colors = useColors();
  const { mode: themeMode } = useThemeStore();
  const params = useLocalSearchParams<{ examResultId: string }>();
  const { stats } = useStudy();
  const [showDetails, setShowDetails] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const result: ExamResult | undefined = useMemo(() => {
    return stats.examHistory.find(r => r.id === params.examResultId);
  }, [stats.examHistory, params.examResultId]);

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Sınav sonucu bulunamadı.</Text>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/(tabs)' as any)}>
            <Text style={styles.homeButtonText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const isGoodScore = percentage >= 70;
  const modeLabel = result.config.mode === 'full' ? 'Tam Simülasyon' : 'Mini Sınav';

  const ydsScore = result.estimatedYDSScore;
  const { level: ydsLevel, message: ydsMessage } = getYDSLevel(ydsScore);
  const ydsColor = getYDSScoreColor(ydsScore);

  const handleRetry = () => {
    const examConfigJson = JSON.stringify(result.config);
    router.replace({ pathname: '/exam' as any, params: { examConfigJson } });
  };

  const handleShare = async () => {
    const msg = generateShareMessage(result.score, result.totalQuestions, modeLabel);
    await shareTextResult('YDS Başarısı!', msg);
  };

  // Calculate ring progress for SVG-like circle (using View borders)
  const ringProgress = Math.min(ydsScore / 100, 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.header}
        >
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.shareIconBtn} activeOpacity={0.7}>
              <Share2 color="#FFFFFF" size={22} />
            </TouchableOpacity>
          </View>
          <View style={styles.trophyContainer}>
            <Trophy size={48} color={isGoodScore ? colors.accent : colors.textLight} />
          </View>

          <Text style={styles.resultTitle}>
            {isGoodScore ? 'Harika!' : 'İyi Deneme!'}
          </Text>
          <Text style={styles.resultSubtitle}>{modeLabel}</Text>

          {/* Score */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreBig}>
              <Text style={styles.scoreNumber}>{result.score}</Text>
              <Text style={styles.scoreDivider}>/</Text>
              <Text style={styles.scoreTotal}>{result.totalQuestions}</Text>
            </View>
            <View style={[styles.percentBadge, { backgroundColor: isGoodScore ? colors.success + '20' : colors.warning + '20' }]}>
              <Text style={[styles.percentText, { color: isGoodScore ? colors.success : colors.warning }]}>
                %{percentage}
              </Text>
            </View>
          </View>

          {/* Time */}
          <View style={styles.timeRow}>
            <Clock size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.timeText}>{formatDuration(result.timeSpentSeconds)}</Text>
          </View>
        </LinearGradient>

        {/* YDS Score Card */}
        <View style={styles.section}>
          <View style={styles.ydsCard}>
            <View style={styles.ydsCardHeader}>
              <Target size={20} color={ydsColor} />
              <Text style={styles.ydsCardTitle}>Tahmini YDS Puanı</Text>
            </View>

            {/* Circular Score Display */}
            <View style={styles.ydsScoreContainer}>
              <View style={[styles.ydsRingOuter, { borderColor: ydsColor + '25' }]}>
                <View style={[styles.ydsRingProgress, { borderColor: ydsColor, borderTopColor: ringProgress >= 0.25 ? ydsColor : 'transparent', borderRightColor: ringProgress >= 0.5 ? ydsColor : 'transparent', borderBottomColor: ringProgress >= 0.75 ? ydsColor : 'transparent' }]}>
                  <View style={[styles.ydsRingInner, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.ydsScoreNumber, { color: ydsColor }]}>{ydsScore}</Text>
                    <Text style={styles.ydsScoreLabel}>puan</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Level Badge */}
            <View style={[styles.ydsLevelBadge, { backgroundColor: ydsColor + '15' }]}>
              <TrendingUp size={16} color={ydsColor} />
              <Text style={[styles.ydsLevelText, { color: ydsColor }]}>{ydsLevel}</Text>
            </View>

            {/* Motivational Message */}
            <Text style={styles.ydsMessage}>{ydsMessage}</Text>

            {/* Score Details */}
            <View style={styles.ydsDetailsRow}>
              <View style={styles.ydsDetailItem}>
                <Zap size={14} color={colors.textLight} />
                <Text style={styles.ydsDetailText}>
                  Ham puan: %{percentage}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategori Analizi</Text>
          {result.categoryBreakdown.map((cat: CategoryBreakdown) => (
            <View key={cat.category} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryDot, { backgroundColor: categoryColors[cat.category] || colors.accent }]} />
                <Text style={styles.categoryName}>{categoryNames[cat.category] || cat.category}</Text>
                <Text style={styles.categoryScore}>
                  {cat.correct}/{cat.total}
                </Text>
                <View style={{ flex: 1 }} />
                <View style={[
                  styles.categoryPercentBadge,
                  { backgroundColor: cat.percentage >= 70 ? colors.success + '15' : cat.percentage >= 40 ? colors.warning + '15' : colors.error + '15' }
                ]}>
                  <Text style={[
                    styles.categoryPercentText,
                    { color: cat.percentage >= 70 ? colors.success : cat.percentage >= 40 ? colors.warning : colors.error }
                  ]}>
                    %{cat.percentage}
                  </Text>
                </View>
              </View>
              <ProgressBar
                progress={cat.percentage / 100}
                height={6}
                color={categoryColors[cat.category] || colors.accent}
                style={styles.categoryProgress}
              />
            </View>
          ))}
        </View>

        {/* Answer Details Toggle */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.detailsToggle}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={styles.detailsToggleText}>Soru Detayları</Text>
            {showDetails ? (
              <ChevronUp size={20} color={colors.textLight} />
            ) : (
              <ChevronDown size={20} color={colors.textLight} />
            )}
          </TouchableOpacity>

          {showDetails && result.answers.map((answer, idx) => {
            const question = allQuestions.find(q => q.id === answer.questionId);
            if (!question) return null;

            const isCorrect = answer.selectedAnswer === question.correctAnswer;
            const isUnanswered = answer.selectedAnswer === null;

            return (
              <View key={answer.questionId} style={styles.answerDetail}>
                <View style={styles.answerHeader}>
                  <Text style={styles.answerNumber}>Soru {idx + 1}</Text>
                  <View style={[
                    styles.answerBadge,
                    {
                      backgroundColor: isUnanswered
                        ? colors.textLight + '20'
                        : isCorrect
                          ? colors.success + '15'
                          : colors.error + '15'
                    }
                  ]}>
                    <Text style={[
                      styles.answerBadgeText,
                      {
                        color: isUnanswered
                          ? colors.textLight
                          : isCorrect
                            ? colors.success
                            : colors.error
                      }
                    ]}>
                      {isUnanswered ? 'Boş' : isCorrect ? 'Doğru' : 'Yanlış'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.answerQuestion} numberOfLines={2}>
                  {question.question}
                </Text>
                {!isCorrect && (
                  <Text style={styles.correctAnswerText}>
                    Doğru: {question.options[question.correctAnswer]}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <RotateCcw size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeActionButton} onPress={() => router.replace('/(tabs)' as any)}>
            <Home size={18} color={colors.primary} />
            <Text style={styles.homeActionText}>Ana Sayfa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  headerActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  shareIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  homeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  trophyContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.accentSoft,
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  scoreBig: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.accent,
  },
  scoreDivider: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.accentSoft,
    marginHorizontal: 4,
  },
  scoreTotal: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.accentSoft,
  },
  percentBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  percentText: {
    fontSize: 18,
    fontWeight: '800',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  // YDS Score Card
  ydsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  ydsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ydsCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  ydsScoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ydsRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ydsRingProgress: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ydsRingInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ydsScoreNumber: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  ydsScoreLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
    marginTop: -2,
  },
  ydsLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  ydsLevelText: {
    fontSize: 15,
    fontWeight: '800',
  },
  ydsMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  ydsDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
  },
  ydsDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ydsDetailText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  categoryRow: {
    marginBottom: 14,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryScore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 8,
  },
  categoryPercentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPercentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryProgress: {
    marginTop: 4,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailsToggleText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  answerDetail: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  answerNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  answerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  answerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  answerQuestion: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
  correctAnswerText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
    fontWeight: '600',
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  homeActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomPadding: {
    height: 40,
  },
});
