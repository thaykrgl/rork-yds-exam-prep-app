import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Calendar, Target, Zap, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useStudyPlanStore } from '@/stores/studyPlanStore';
import { studyPlans } from '@/data/studyPlans';
import ProgressBar from '@/components/ProgressBar';
import { StudyPlanId } from '@/types';

const planIcons: Record<StudyPlanId, React.ComponentType<{ color: string; size: number }>> = {
  '2_week_intensive': Zap,
  '1_month_structured': Calendar,
  'weak_area_focused': Target,
};

const planColors: Record<StudyPlanId, string> = {
  '2_week_intensive': '#EF4444',
  '1_month_structured': '#3B82F6',
  'weak_area_focused': '#F59E0B',
};

export default function StudyPlansScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activePlan, startPlan, abandonPlan, getPlanProgress } = useStudyPlanStore();

  const progress = getPlanProgress();

  const handleStartPlan = (planId: StudyPlanId) => {
    if (activePlan) {
      Alert.alert(
        'Aktif Plan Var',
        'Mevcut planınızı bırakıp yeni bir plan başlatmak istiyor musunuz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Değiştir',
            style: 'destructive',
            onPress: () => {
              abandonPlan();
              startPlan(planId);
              router.push({ pathname: '/study-plan-detail' as any, params: { planId } });
            },
          },
        ],
      );
    } else {
      startPlan(planId);
      router.push({ pathname: '/study-plan-detail' as any, params: { planId } });
    }
  };

  const handleViewActivePlan = () => {
    if (activePlan) {
      router.push({ pathname: '/study-plan-detail' as any, params: { planId: activePlan.planId } });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Çalışma Planları</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Plan Card */}
        {activePlan && (
          <TouchableOpacity style={styles.activePlanCard} activeOpacity={0.7} onPress={handleViewActivePlan}>
            <LinearGradient
              colors={[planColors[activePlan.planId], planColors[activePlan.planId] + 'CC']}
              style={styles.activePlanGradient}
            >
              <View style={styles.activePlanHeader}>
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.activePlanLabel}>Aktif Plan</Text>
              </View>
              <Text style={styles.activePlanTitle}>
                {studyPlans.find(p => p.id === activePlan.planId)?.title}
              </Text>
              <View style={styles.activePlanProgress}>
                <ProgressBar progress={progress.percentage / 100} color="#FFFFFF" />
                <Text style={styles.activePlanProgressText}>
                  %{progress.percentage} · {progress.completed}/{progress.total} görev
                </Text>
              </View>
              <View style={styles.activePlanArrow}>
                <ChevronRight size={20} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>
          {activePlan ? 'Diğer Planlar' : 'Bir Plan Seç'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          Hedefine uygun çalışma planı ile sistematik ilerle
        </Text>

        {studyPlans.map(plan => {
          const Icon = planIcons[plan.id];
          const color = planColors[plan.id];
          const isActive = activePlan?.planId === plan.id;

          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, isActive && styles.planCardActive]}
              activeOpacity={0.7}
              onPress={() => isActive ? handleViewActivePlan() : handleStartPlan(plan.id)}
            >
              <View style={[styles.planIcon, { backgroundColor: color + '15' }]}>
                <Icon size={24} color={color} />
              </View>
              <View style={styles.planInfo}>
                <View style={styles.planTitleRow}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  {isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: color }]}>
                      <Text style={styles.activeBadgeText}>Aktif</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.planDescription}>{plan.description}</Text>
                <View style={styles.planMeta}>
                  <Calendar size={12} color={Colors.textLight} />
                  <Text style={styles.planMetaText}>{plan.durationDays} gün · {plan.tasks.length} görev</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  closeButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  activePlanCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  activePlanGradient: { padding: 20, borderRadius: 16 },
  activePlanHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  activePlanLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  activePlanTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  activePlanProgress: { gap: 6 },
  activePlanProgressText: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  activePlanArrow: { position: 'absolute', right: 16, top: '50%' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  planCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, marginBottom: 12, gap: 14,
  },
  planCardActive: { borderWidth: 2, borderColor: Colors.accent },
  planIcon: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  planInfo: { flex: 1 },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  activeBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  planDescription: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  planMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  planMetaText: { fontSize: 11, color: Colors.textLight },
});
