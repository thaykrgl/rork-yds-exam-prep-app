import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, BarChart3, Target, Clock, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useStudy } from '@/providers/StudyProvider';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useSpacedRepetitionStore } from '@/stores/spacedRepetitionStore';
import { studyCategories } from '@/mocks/questions';
import SimpleBarChart from '@/components/charts/SimpleBarChart';
import SimpleLineChart from '@/components/charts/SimpleLineChart';
import { QuestionCategory } from '@/types';
import { formatDuration } from '@/utils/examUtils';

const categoryLabels: Record<QuestionCategory, string> = {
  vocabulary: 'Kelime',
  grammar: 'Dilbilgisi',
  paragraph: 'Paragraf',
  translation: 'Çeviri',
  cloze: 'Boşluk',
  reading: 'Okuma',
};

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { stats } = useStudy();
  const { getWeeklyTrend, getMonthlyTrend } = useAnalyticsStore();
  const { reviewData } = useSpacedRepetitionStore();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const weeklyData = useMemo(() => getWeeklyTrend(), []);
  const monthlyData = useMemo(() => getMonthlyTrend(), []);

  // Category accuracy data
  const categoryAccuracy = useMemo(() => {
    return studyCategories.map(cat => {
      const s = stats.categoryStats[cat.id];
      const acc = s && s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : 0;
      return { label: categoryLabels[cat.id], value: acc, color: cat.color };
    });
  }, [stats.categoryStats]);

  // Category total answered
  const categoryTotal = useMemo(() => {
    return studyCategories.map(cat => {
      const s = stats.categoryStats[cat.id];
      return { label: categoryLabels[cat.id], value: s?.answered || 0, color: cat.color };
    });
  }, [stats.categoryStats]);

  // Weak areas (accuracy < 60%)
  const weakAreas = useMemo(() => {
    return studyCategories
      .map(cat => {
        const s = stats.categoryStats[cat.id];
        const acc = s && s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : -1;
        return { ...cat, accuracy: acc, answered: s?.answered || 0 };
      })
      .filter(c => c.answered >= 5 && c.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [stats.categoryStats]);

  // Exam score trend
  const examTrend = useMemo(() => {
    return stats.examHistory
      .slice(0, 10)
      .reverse()
      .map((exam, i) => ({
        label: `#${i + 1}`,
        value: Math.round((exam.score / exam.totalQuestions) * 100),
      }));
  }, [stats.examHistory]);

  // Weekly study activity
  const weeklyActivity = useMemo(() => {
    const dayLabels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return weeklyData.map((d, i) => ({
      label: dayLabels[i % 7] || d.date.slice(-2),
      value: d.questionsAnswered,
    }));
  }, [weeklyData]);

  // Total study time
  const totalStudyMinutes = useMemo(() => {
    return Math.round(monthlyData.reduce((sum, d) => sum + d.studyTimeSeconds, 0) / 60);
  }, [monthlyData]);

  // Difficulty analysis from review data
  const difficultyStats = useMemo(() => {
    let easy = { total: 0, correct: 0 };
    let medium = { total: 0, correct: 0 };
    let hard = { total: 0, correct: 0 };

    Object.values(reviewData).forEach(r => {
      const total = r.correctCount + r.incorrectCount;
      if (r.easeFactor >= 2.3) {
        easy.total += total;
        easy.correct += r.correctCount;
      } else if (r.easeFactor >= 1.8) {
        medium.total += total;
        medium.correct += r.correctCount;
      } else {
        hard.total += total;
        hard.correct += r.correctCount;
      }
    });

    return [
      { label: 'Kolay', value: easy.total > 0 ? Math.round((easy.correct / easy.total) * 100) : 0, color: '#22C55E' },
      { label: 'Orta', value: medium.total > 0 ? Math.round((medium.correct / medium.total) * 100) : 0, color: '#F59E0B' },
      { label: 'Zor', value: hard.total > 0 ? Math.round((hard.correct / hard.total) * 100) : 0, color: '#EF4444' },
    ];
  }, [reviewData]);

  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detaylı Analiz</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.success + '15' }]}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={styles.summaryValue}>%{accuracy}</Text>
            <Text style={styles.summaryLabel}>Genel Başarı</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.primary + '15' }]}>
            <BarChart3 size={20} color={colors.primary} />
            <Text style={styles.summaryValue}>{stats.totalAnswered}</Text>
            <Text style={styles.summaryLabel}>Toplam Soru</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.warning + '15' }]}>
            <Clock size={20} color={colors.warning} />
            <Text style={styles.summaryValue}>{totalStudyMinutes}dk</Text>
            <Text style={styles.summaryLabel}>Çalışma Süresi</Text>
          </View>
        </View>

        {/* Exam Score Trend */}
        {examTrend.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sınav Puan Trendi</Text>
            <View style={styles.chartCard}>
              <SimpleLineChart data={examTrend} height={130} color={colors.accent} />
            </View>
          </View>
        )}

        {/* Category Accuracy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategori Başarı Oranları</Text>
          <View style={styles.chartCard}>
            <SimpleBarChart data={categoryAccuracy} height={130} maxValue={100} />
          </View>
        </View>

        {/* Category Total Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategori Bazlı Çözüm Sayısı</Text>
          <View style={styles.chartCard}>
            <SimpleBarChart data={categoryTotal} height={130} />
          </View>
        </View>

        {/* Difficulty Analysis */}
        {Object.keys(reviewData).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zorluk Analizi</Text>
            <View style={styles.chartCard}>
              <SimpleBarChart data={difficultyStats} height={100} maxValue={100} />
            </View>
          </View>
        )}

        {/* Weekly Activity */}
        {weeklyActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Haftalık Aktivite</Text>
            <View style={styles.chartCard}>
              <SimpleBarChart data={weeklyActivity} height={100} />
            </View>
          </View>
        )}

        {/* Weak Areas */}
        {weakAreas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zayıf Alanlar</Text>
            {weakAreas.map(area => (
              <View key={area.id} style={styles.weakCard}>
                <AlertTriangle size={18} color={colors.warning} />
                <View style={styles.weakInfo}>
                  <Text style={styles.weakTitle}>{area.titleTr}</Text>
                  <Text style={styles.weakSub}>{area.answered} soru · %{area.accuracy} doğruluk</Text>
                </View>
                <TouchableOpacity
                  style={[styles.weakButton, { backgroundColor: colors.warning }]}
                  onPress={() => router.push({ pathname: '/quiz' as any, params: { category: area.id } })}
                >
                  <Text style={styles.weakButtonText}>Çalış</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Exam History Summary */}
        {stats.examHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sınav Özeti</Text>
            <View style={styles.examSummaryCard}>
              <View style={styles.examSummaryRow}>
                <Text style={styles.examSummaryLabel}>Toplam Sınav</Text>
                <Text style={styles.examSummaryValue}>{stats.examHistory.length}</Text>
              </View>
              <View style={styles.examSummaryRow}>
                <Text style={styles.examSummaryLabel}>En Yüksek Puan</Text>
                <Text style={[styles.examSummaryValue, { color: colors.success }]}>
                  %{Math.max(...stats.examHistory.map(e => Math.round((e.score / e.totalQuestions) * 100)))}
                </Text>
              </View>
              <View style={styles.examSummaryRow}>
                <Text style={styles.examSummaryLabel}>Ortalama Puan</Text>
                <Text style={styles.examSummaryValue}>
                  %{Math.round(stats.examHistory.reduce((sum, e) => sum + (e.score / e.totalQuestions) * 100, 0) / stats.examHistory.length)}
                </Text>
              </View>
              <View style={styles.examSummaryRow}>
                <Text style={styles.examSummaryLabel}>Tahmini YDS Puanı</Text>
                <Text style={[styles.examSummaryValue, { color: colors.examAccent }]}>
                  {Math.round(stats.examHistory.reduce((sum, e) => sum + e.estimatedYDSScore, 0) / stats.examHistory.length)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: {
    flex: 1, borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 6,
  },
  summaryValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  summaryLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '500', textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  chartCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
  },
  weakCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.warning + '10', borderRadius: 12,
    padding: 14, marginBottom: 8, gap: 12,
  },
  weakInfo: { flex: 1 },
  weakTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  weakSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  weakButton: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  weakButtonText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  examSummaryCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 12,
  },
  examSummaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  examSummaryLabel: { fontSize: 14, color: colors.textSecondary },
  examSummaryValue: { fontSize: 16, fontWeight: '700', color: colors.text },
});
