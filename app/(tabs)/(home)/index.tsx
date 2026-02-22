import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Flame, Target, TrendingUp, BookOpen, PenTool, FileText, Languages, Puzzle, Newspaper, ChevronRight, Trophy, Clock, RefreshCw, Calendar, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useStudy } from '@/providers/StudyProvider';
import { studyCategories } from '@/mocks/questions';
import { useSpacedRepetitionStore } from '@/stores/spacedRepetitionStore';
import { useStudyPlanStore } from '@/stores/studyPlanStore';
import { QuestionCategory } from '@/types';
import { formatDuration } from '@/utils/examUtils';

const { width } = Dimensions.get('window');

const categoryIcons: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  BookOpen,
  PenTool,
  FileText,
  Languages,
  PuzzleIcon: Puzzle,
  Newspaper,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stats } = useStudy();
  const dueCount = useSpacedRepetitionStore((s) => s.getDueCount());
  const { activePlan, getTodaysTasks, getPlanProgress, getActivePlanDef } = useStudyPlanStore();
  const todaysTasks = getTodaysTasks();
  const planProgress = getPlanProgress();
  const planDef = getActivePlanDef();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const dailyPercent = Math.min(stats.dailyProgress / stats.dailyGoal, 1);
  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: dailyPercent,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dailyPercent]);

  const handleCategoryPress = (categoryId: QuestionCategory) => {
    router.push({ pathname: '/quiz' as any, params: { category: categoryId } });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.greeting}>Merhaba!</Text>
          <Text style={styles.subtitle}>YDS sınavına hazır mısın?</Text>
        </Animated.View>

        <View style={styles.dailyCard}>
          <View style={styles.dailyHeader}>
            <View style={styles.dailyLeft}>
              <Target color={Colors.accent} size={20} />
              <Text style={styles.dailyTitle}>Günlük Hedef</Text>
            </View>
            <Text style={styles.dailyCount}>
              {stats.dailyProgress}/{stats.dailyGoal}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.dailyHint}>
            {dailyPercent >= 1 ? 'Harika! Günlük hedefini tamamladın! 🎉' : `${stats.dailyGoal - stats.dailyProgress} soru daha çöz`}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
            <Flame color="#F97316" size={22} />
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Seri</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
            <TrendingUp color="#22C55E" size={22} />
            <Text style={styles.statValue}>%{accuracy}</Text>
            <Text style={styles.statLabel}>Başarı</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <BookOpen color="#3B82F6" size={22} />
            <Text style={styles.statValue}>{stats.totalAnswered}</Text>
            <Text style={styles.statLabel}>Toplam</Text>
          </View>
        </View>

        {/* Daily Review */}
        {dueCount > 0 && (
          <TouchableOpacity
            style={styles.reviewCard}
            activeOpacity={0.7}
            onPress={() => router.push('/daily-review' as any)}
          >
            <View style={styles.reviewCardLeft}>
              <View style={styles.reviewCardIcon}>
                <RefreshCw size={20} color="#14B8A6" />
              </View>
              <View>
                <Text style={styles.reviewCardTitle}>Günlük Tekrar</Text>
                <Text style={styles.reviewCardSub}>{dueCount} soru tekrar bekliyor</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}

        {/* Active Study Plan Tasks */}
        {activePlan && todaysTasks.length > 0 && (
          <TouchableOpacity
            style={styles.planCard}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/study-plan-detail' as any, params: { planId: activePlan.planId } })}
          >
            <View style={styles.planCardHeader}>
              <Calendar size={16} color={Colors.examAccent} />
              <Text style={styles.planCardLabel}>{planDef?.title}</Text>
              <Text style={styles.planCardPercent}>%{planProgress.percentage}</Text>
            </View>
            {todaysTasks.slice(0, 3).map(task => (
              <View key={task.id} style={styles.planTaskRow}>
                {task.completed ? (
                  <CheckCircle size={14} color={Colors.success} />
                ) : (
                  <View style={styles.planTaskCircle} />
                )}
                <Text style={[styles.planTaskText, task.completed && styles.planTaskDone]} numberOfLines={1}>
                  {task.title}
                </Text>
              </View>
            ))}
          </TouchableOpacity>
        )}

        {/* Exam Quick Launch */}
        <TouchableOpacity
          style={styles.examCard}
          activeOpacity={0.7}
          onPress={() => router.push('/exam' as any)}
        >
          <LinearGradient
            colors={[Colors.examAccent, Colors.examAccent + 'CC']}
            style={styles.examCardGradient}
          >
            <View style={styles.examCardLeft}>
              <Trophy size={24} color="#FFFFFF" />
              <View style={styles.examCardInfo}>
                <Text style={styles.examCardTitle}>Deneme Sınavı</Text>
                <Text style={styles.examCardSub}>YDS formatında sınav simülasyonu</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Last Exam Result */}
        {stats.examHistory.length > 0 && (() => {
          const lastExam = stats.examHistory[stats.examHistory.length - 1];
          const pct = Math.round((lastExam.score / lastExam.totalQuestions) * 100);
          return (
            <TouchableOpacity
              style={styles.lastExamCard}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/exam-result' as any, params: { examResultId: lastExam.id } })}
            >
              <View style={styles.lastExamLeft}>
                <View style={[styles.lastExamIcon, { backgroundColor: pct >= 70 ? Colors.success + '15' : Colors.warning + '15' }]}>
                  <Target size={20} color={pct >= 70 ? Colors.success : Colors.warning} />
                </View>
                <View>
                  <Text style={styles.lastExamTitle}>Son Sınav Sonucu</Text>
                  <Text style={styles.lastExamSub}>
                    {lastExam.score}/{lastExam.totalQuestions} doğru · {formatDuration(lastExam.timeSpentSeconds)}
                  </Text>
                </View>
              </View>
              <View style={[styles.lastExamBadge, { backgroundColor: pct >= 70 ? Colors.success + '15' : Colors.warning + '15' }]}>
                <Text style={[styles.lastExamPercent, { color: pct >= 70 ? Colors.success : Colors.warning }]}>%{pct}</Text>
              </View>
            </TouchableOpacity>
          );
        })()}

        <Text style={styles.sectionTitle}>Kategoriler</Text>

        {studyCategories.map((cat, index) => {
          const Icon = categoryIcons[cat.icon] || BookOpen;
          const catStat = stats.categoryStats[cat.id];
          const catAccuracy = catStat.answered > 0 ? Math.round((catStat.correct / catStat.answered) * 100) : 0;

          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress(cat.id)}
              testID={`category-${cat.id}`}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '18' }]}>
                <Icon color={cat.color} size={24} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{cat.titleTr}</Text>
                <Text style={styles.categorySubtitle}>
                  {catStat.answered > 0 ? `${catStat.answered} çözüldü · %${catAccuracy} doğru` : `${cat.questionCount} soru`}
                </Text>
              </View>
              <ChevronRight color={Colors.textLight} size={20} />
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.accentSoft,
    marginBottom: 20,
  },
  dailyCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dailyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dailyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  dailyCount: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  dailyHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 14,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  categorySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#14B8A6' + '10',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#14B8A6' + '25',
  },
  reviewCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#14B8A6' + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  reviewCardSub: {
    fontSize: 12,
    color: '#14B8A6',
    marginTop: 2,
    fontWeight: '500' as const,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planCardLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  planCardPercent: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.examAccent,
  },
  planTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planTaskCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.textLight,
  },
  planTaskText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  planTaskDone: {
    color: Colors.textLight,
    textDecorationLine: 'line-through' as const,
  },
  examCard: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  examCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 14,
  },
  examCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  examCardInfo: {
    gap: 2,
  },
  examCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  examCardSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  lastExamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  lastExamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  lastExamIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastExamTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  lastExamSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  lastExamBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lastExamPercent: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
