import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, Circle, BookOpen, RefreshCw, Trophy, Layers, Trash2 } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { useStudyPlanStore } from '@/stores/studyPlanStore';
import { studyPlans } from '@/data/studyPlans';
import ProgressBar from '@/components/ProgressBar';
import { StudyPlanId, StudyPlanTask } from '@/types';

const taskTypeIcons: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  quiz: BookOpen,
  review: RefreshCw,
  exam: Trophy,
  vocabulary: Layers,
};

export default function StudyPlanDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { activePlan, completeTask, abandonPlan, getPlanProgress } = useStudyPlanStore();

  const styles = useMemo(() => createStyles(colors), [colors]);
  const plan = studyPlans.find(p => p.id === planId);
  const progress = getPlanProgress();

  const currentDay = useMemo(() => {
    if (!activePlan) return 1;
    const start = new Date(activePlan.startDate);
    const today = new Date();
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [activePlan]);

  const groupedTasks = useMemo(() => {
    if (!plan) return {};
    const groups: Record<number, StudyPlanTask[]> = {};
    plan.tasks.forEach(task => {
      if (!groups[task.day]) groups[task.day] = [];
      const completed = activePlan?.completedTasks.includes(task.id) || false;
      groups[task.day].push({ ...task, completed });
    });
    return groups;
  }, [plan, activePlan]);

  const handleCompleteTask = (task: StudyPlanTask) => {
    if (task.completed) return;

    // Navigate based on task type
    if (task.taskType === 'quiz') {
      completeTask(task.id);
      if (task.category) {
        router.push({ pathname: '/quiz' as any, params: { category: task.category } });
      } else {
        router.push({ pathname: '/quiz' as any, params: { category: 'all' } });
      }
    } else if (task.taskType === 'review') {
      completeTask(task.id);
      router.push('/daily-review' as any);
    } else if (task.taskType === 'exam') {
      completeTask(task.id);
      const config = {
        mode: task.questionCount === 80 ? 'full' : 'mini',
        questionCount: task.questionCount || 20,
        timeLimitMinutes: task.questionCount === 80 ? 150 : task.questionCount === 40 ? 75 : 40,
      };
      router.push({ pathname: '/exam' as any, params: { examConfigJson: JSON.stringify(config) } });
    } else if (task.taskType === 'vocabulary') {
      completeTask(task.id);
      router.push('/(tabs)/vocabulary' as any);
    }
  };

  const handleAbandon = () => {
    Alert.alert(
      'Planı Bırak',
      'Bu çalışma planını bırakmak istediğinden emin misin? İlerleme kaydedilmeyecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Bırak',
          style: 'destructive',
          onPress: () => { abandonPlan(); router.back(); },
        },
      ],
    );
  };

  if (!plan) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Plan bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{plan.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Summary */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>İlerleme</Text>
            <Text style={styles.progressPercent}>%{progress.percentage}</Text>
          </View>
          <ProgressBar progress={progress.percentage / 100} color={colors.accent} />
          <Text style={styles.progressSub}>
            {progress.completed}/{progress.total} görev · Gün {Math.min(currentDay, plan.durationDays)}/{plan.durationDays}
          </Text>
        </View>

        {/* Day-by-day tasks */}
        {Object.entries(groupedTasks).map(([day, tasks]) => {
          const dayNum = parseInt(day);
          const isToday = dayNum === currentDay;
          const isPast = dayNum < currentDay;
          const allCompleted = tasks.every(t => t.completed);

          return (
            <View key={day} style={[styles.daySection, isToday && styles.daySectionToday]}>
              <View style={styles.dayHeader}>
                <View style={[styles.dayBadge, isToday && styles.dayBadgeToday, isPast && allCompleted && styles.dayBadgeDone]}>
                  <Text style={[styles.dayBadgeText, (isToday || (isPast && allCompleted)) && styles.dayBadgeTextActive]}>
                    {dayNum}
                  </Text>
                </View>
                <Text style={[styles.dayTitle, isToday && styles.dayTitleToday]}>
                  Gün {dayNum} {isToday ? '(Bugün)' : ''}
                </Text>
              </View>

              {tasks.map(task => {
                const TaskIcon = taskTypeIcons[task.taskType] || BookOpen;
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
                    activeOpacity={task.completed ? 1 : 0.7}
                    onPress={() => handleCompleteTask(task)}
                  >
                    {task.completed ? (
                      <CheckCircle size={20} color={colors.success} />
                    ) : (
                      <Circle size={20} color={colors.textLight} />
                    )}
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
                        {task.title}
                      </Text>
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    </View>
                    <TaskIcon size={16} color={task.completed ? colors.textLight : colors.textSecondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {/* Abandon Plan Button */}
        {activePlan && activePlan.planId === planId && (
          <TouchableOpacity style={styles.abandonButton} onPress={handleAbandon}>
            <Trash2 size={16} color={colors.error} />
            <Text style={styles.abandonText}>Planı Bırak</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1, textAlign: 'center' },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  errorText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 16 },
  progressCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 24, gap: 8,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  progressPercent: { fontSize: 16, fontWeight: '700', color: colors.accent },
  progressSub: { fontSize: 12, color: colors.textSecondary },
  daySection: { marginBottom: 20 },
  daySectionToday: {
    backgroundColor: colors.accent + '08',
    borderRadius: 14, padding: 12, marginHorizontal: -12,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  dayBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  dayBadgeToday: { backgroundColor: colors.accent },
  dayBadgeDone: { backgroundColor: colors.success },
  dayBadgeText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  dayBadgeTextActive: { color: '#FFFFFF' },
  dayTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  dayTitleToday: { color: colors.accent, fontWeight: '700' },
  taskCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 10,
    padding: 12, marginBottom: 6, gap: 10,
  },
  taskCardCompleted: { opacity: 0.6 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textLight },
  taskDescription: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  abandonButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, marginTop: 16,
    borderRadius: 12, borderWidth: 1,
    borderColor: colors.error + '30', backgroundColor: colors.error + '08',
  },
  abandonText: { fontSize: 14, fontWeight: '600', color: colors.error },
});
