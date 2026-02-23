import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Flame, Target, TrendingUp, Trophy, ChevronRight, Moon, Sun, Settings2, BookOpen, PenTool, Gamepad2, Library, Calendar, CheckCircle } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { useThemeStore } from '@/stores/themeStore';
import { useStudy } from '@/providers/StudyProvider';
import { useAchievementStore } from '@/stores/achievementStore';
import { useStudyPlanStore } from '@/stores/studyPlanStore';
import { formatDuration } from '@/utils/examUtils';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { mode, toggleTheme } = useThemeStore();
  const { stats, updateDailyGoal } = useStudy();
  const unlockedBadgesCount = useAchievementStore((s) => s.unlockedBadges.length);
  const { activePlan, getTodaysTasks, getPlanProgress, getActivePlanDef } = useStudyPlanStore();
  const todaysTasks = getTodaysTasks();
  const planProgress = getPlanProgress();
  const planDef = getActivePlanDef();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => createStyles(colors, mode), [colors, mode]);

  const handleUpdateGoal = () => {
    Alert.alert(
      'Günlük Hedef',
      'Günde kaç soru çözmek istersin?',
      [
        { text: '10 Soru', onPress: () => updateDailyGoal(10) },
        { text: '20 Soru', onPress: () => updateDailyGoal(20) },
        { text: '50 Soru', onPress: () => updateDailyGoal(50) },
        { text: '100 Soru', onPress: () => updateDailyGoal(100) },
        { text: 'Vazgeç', style: 'cancel' },
      ]
    );
  };

  const dailyPercent = Math.min(stats.dailyProgress / (stats.dailyGoal || 1), 1);
  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, { toValue: dailyPercent, duration: 1200, useNativeDriver: false }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [dailyPercent]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const lastExam = stats.examHistory.length > 0 ? stats.examHistory[0] : null;

  const quickActions = [
    {
      id: 'practice',
      label: 'Soru Çöz',
      icon: PenTool,
      color: '#3B82F6',
      onPress: () => router.push({ pathname: '/quiz' as any, params: { category: 'all' } }),
    },
    {
      id: 'exam',
      label: 'Sınav',
      icon: Trophy,
      color: colors.examAccent,
      onPress: () => {
        const config = { mode: 'full', questionCount: 80, timeLimitMinutes: 150 };
        router.push({ pathname: '/exam' as any, params: { examConfigJson: JSON.stringify(config) } });
      },
    },
    {
      id: 'grammar',
      label: 'Gramer',
      icon: Library,
      color: '#8B5CF6',
      onPress: () => router.push('/grammar-library' as any),
    },
    {
      id: 'wordgame',
      label: 'Kelime Oyunu',
      icon: Gamepad2,
      color: '#14B8A6',
      onPress: () => router.push('/word-match' as any),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTopRow}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.greeting}>Merhaba! 👋</Text>
            <Text style={styles.subtitle}>YDS sınavına hazır mısın?</Text>
          </Animated.View>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme} activeOpacity={0.7}>
            {mode === 'dark' ? <Sun size={20} color="#FFFFFF" /> : <Moon size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        <View style={styles.dailyCard}>
          <View style={styles.dailyHeader}>
            <View style={styles.dailyLeft}>
              <Target color={colors.accent} size={18} />
              <Text style={styles.dailyTitle}>Günlük Hedef</Text>
            </View>
            <TouchableOpacity style={styles.dailyBadge} onPress={handleUpdateGoal} activeOpacity={0.7}>
              <Text style={styles.dailyCount}>{stats.dailyProgress}/{stats.dailyGoal}</Text>
              <Settings2 size={12} color={colors.accent} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: colors.accent }]} />
          </View>
          <Text style={styles.dailyHint}>
            {dailyPercent >= 1 ? 'Harika! Günlük hedefini tamamladın! 🎉' : `${(stats.dailyGoal || 20) - stats.dailyProgress} soru daha çöz`}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: mode === 'dark' ? '#3D2010' : '#FFF7ED' }]}>
            <Flame color="#F97316" size={20} />
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Seri</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: mode === 'dark' ? '#103020' : '#F0FDF4' }]}>
            <TrendingUp color="#22C55E" size={20} />
            <Text style={styles.statValue}>%{accuracy}</Text>
            <Text style={styles.statLabel}>Başarı</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: mode === 'dark' ? '#31104D' : '#F5F3FF' }]}>
            <Trophy color="#8B5CF6" size={20} />
            <Text style={styles.statValue}>{unlockedBadgesCount}</Text>
            <Text style={styles.statLabel}>Rozetler</Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={[styles.quickActionsGridContainer, { flex: 1 }]}>
          <View style={styles.quickActionsRow}>
            {quickActions.slice(0, 2).map(action => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionCard}
                  activeOpacity={0.7}
                  onPress={action.onPress}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                    <Icon color={action.color} size={24} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.quickActionsRow}>
            {quickActions.slice(2, 4).map(action => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionCard}
                  activeOpacity={0.7}
                  onPress={action.onPress}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                    <Icon color={action.color} size={24} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Active Study Plan */}
        {activePlan && todaysTasks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Çalışma Planı</Text>
            <TouchableOpacity
              style={styles.planCard}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/study-plan-detail' as any, params: { planId: activePlan.planId } })}
            >
              <View style={styles.planCardHeader}>
                <Calendar size={16} color={colors.examAccent} />
                <Text style={styles.planCardLabel}>{planDef?.title}</Text>
                <Text style={styles.planCardPercent}>%{planProgress.percentage}</Text>
              </View>
              {todaysTasks.slice(0, 3).map(task => (
                <View key={task.id} style={styles.planTaskRow}>
                  {task.completed ? (
                    <CheckCircle size={14} color={colors.success} />
                  ) : (
                    <View style={styles.planTaskCircle} />
                  )}
                  <Text style={[styles.planTaskText, task.completed && styles.planTaskDone]} numberOfLines={1}>
                    {task.title}
                  </Text>
                </View>
              ))}
            </TouchableOpacity>
          </>
        )}

        {/* Last Exam Result */}
        {lastExam && (
          <>
            <Text style={styles.sectionTitle}>Son Sınav</Text>
            <TouchableOpacity
              style={styles.lastExamCard}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/exam-result' as any, params: { examResultId: lastExam.id } })}
            >
              {(() => {
                const pct = Math.round((lastExam.score / lastExam.totalQuestions) * 100);
                return (
                  <>
                    <View style={styles.lastExamLeft}>
                      <View style={[styles.lastExamIcon, { backgroundColor: pct >= 70 ? colors.success + '15' : colors.warning + '15' }]}>
                        <Target size={20} color={pct >= 70 ? colors.success : colors.warning} />
                      </View>
                      <View>
                        <Text style={styles.lastExamTitle}>
                          {lastExam.score}/{lastExam.totalQuestions} doğru
                        </Text>
                        <Text style={styles.lastExamSub}>{formatDuration(lastExam.timeSpentSeconds)}</Text>
                      </View>
                    </View>
                    <View style={[styles.lastExamBadge, { backgroundColor: pct >= 70 ? colors.success + '15' : colors.warning + '15' }]}>
                      <Text style={[styles.lastExamPercent, { color: pct >= 70 ? colors.success : colors.warning }]}>%{pct}</Text>
                    </View>
                  </>
                );
              })()}
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, mode: string) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  themeToggle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  subtitle: { fontSize: 15, color: colors.headerSubtitle, marginBottom: 20 },
  dailyCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 16 },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dailyLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dailyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  dailyCount: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  dailyBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  dailyHint: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8 },
  scrollContent: { flex: 1 },
  scrollInner: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, flexGrow: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },

  // Quick Actions 2x2 Grid
  quickActionsGridContainer: {
    gap: 12,
    marginBottom: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 110,
  },
  quickActionIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'center' },

  // Study Plan
  planCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 24, gap: 10 },
  planCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planCardLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },
  planCardPercent: { fontSize: 13, fontWeight: '700', color: colors.examAccent },
  planTaskRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planTaskCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: colors.textLight },
  planTaskText: { fontSize: 13, color: colors.text, flex: 1 },
  planTaskDone: { color: colors.textLight, textDecorationLine: 'line-through' },

  // Last Exam
  lastExamCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 20 },
  lastExamLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  lastExamIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  lastExamTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  lastExamSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  lastExamBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  lastExamPercent: { fontSize: 15, fontWeight: '700' },
});
