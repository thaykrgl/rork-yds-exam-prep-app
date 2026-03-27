import React, { useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ChevronRight, Trophy, Flame, Target, Zap, FileText,
  PenTool, BookOpen, TrendingUp, TrendingDown, Minus, Award,
} from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { useStudy } from '@/providers/StudyProvider';
import { usePersonalRecordsStore, WeeklyComparison } from '@/stores/personalRecordsStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';

const recordIcons: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  Trophy, Flame, Target, Zap, FileText, PenTool, BookOpen, Award,
};

export default function PersonalRecordsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { stats } = useStudy();
  const { updateRecords, getTopRecords, getMilestones, getWeeklyComparison } = usePersonalRecordsStore();
  const dailyRecords = useAnalyticsStore(s => s.dailyRecords);

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Update records whenever stats change
  useEffect(() => {
    updateRecords(stats, dailyRecords);
  }, [stats, dailyRecords]);

  const records = getTopRecords();
  const milestones = getMilestones();
  const weekly: WeeklyComparison = getWeeklyComparison(dailyRecords);

  const weeklyItems = useMemo(() => [
    {
      label: 'Soru Sayısı',
      current: weekly.currentWeek.questionsAnswered,
      change: weekly.changes.questionsChange,
      format: (v: number) => `${v}`,
    },
    {
      label: 'Doğruluk',
      current: weekly.currentWeek.accuracy,
      change: weekly.changes.accuracyChange,
      format: (v: number) => `%${Math.round(v)}`,
    },
    {
      label: 'Çalışma Süresi',
      current: weekly.currentWeek.studyTimeSeconds,
      change: weekly.changes.studyTimeChange,
      format: (v: number) => {
        const min = Math.round(v / 60);
        return min < 60 ? `${min}dk` : `${Math.floor(min / 60)}s ${min % 60}dk`;
      },
    },
  ], [weekly]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronRight
              color="#FFFFFF"
              size={22}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kişisel Rekorlar</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.headerSub}>En iyi performanslarını takip et</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly Comparison */}
        <Text style={styles.sectionTitle}>Haftalık Karşılaştırma</Text>
        <View style={styles.weeklyRow}>
          {weeklyItems.map((item, i) => {
            const isUp = item.change > 0;
            const isDown = item.change < 0;
            const ChangeIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
            const changeColor = isUp ? colors.success : isDown ? colors.error : colors.textLight;

            return (
              <View key={i} style={styles.weeklyCard}>
                <Text style={styles.weeklyLabel}>{item.label}</Text>
                <Text style={styles.weeklyValue}>{item.format(item.current)}</Text>
                <View style={styles.weeklyChange}>
                  <ChangeIcon color={changeColor} size={14} />
                  <Text style={[styles.weeklyChangeTxt, { color: changeColor }]}>
                    {isUp ? '+' : ''}{Math.round(item.change)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Records */}
        <Text style={styles.sectionTitle}>Rekorlar</Text>
        {records.length > 0 ? (
          <View style={styles.recordGrid}>
            {records.map((record, index) => {
              const Icon = recordIcons[record.icon] || Trophy;
              return (
                <View
                  key={record.id}
                  style={[
                    styles.recordCard,
                    index === 0 && styles.recordCardFirst,
                  ]}
                >
                  {index === 0 && (
                    <LinearGradient
                      colors={[colors.accent + '20', colors.accentLight + '08']}
                      style={styles.recordFirstGradient}
                    />
                  )}
                  <View style={[styles.recordIcon, { backgroundColor: record.color + '15' }]}>
                    <Icon color={record.color} size={index === 0 ? 26 : 20} />
                  </View>
                  <Text style={[styles.recordTitle, index === 0 && styles.recordTitleFirst]}>
                    {record.titleTr}
                  </Text>
                  <Text style={[styles.recordValue, index === 0 && styles.recordValueFirst]}>
                    {record.displayValue}
                  </Text>
                  <Text style={styles.recordDate}>
                    {new Date(record.achievedDate).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Trophy color={colors.textLight} size={40} />
            <Text style={styles.emptyTitle}>Henüz rekor yok</Text>
            <Text style={styles.emptySub}>Soru çözerek rekor kırmaya başla!</Text>
          </View>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Son Başarılar</Text>
            {milestones.slice(0, 10).map((ms) => {
              const Icon = recordIcons[ms.icon] || Award;
              return (
                <View key={ms.id} style={styles.milestoneCard}>
                  <View style={[styles.milestoneIcon, { backgroundColor: ms.color + '15' }]}>
                    <Icon color={ms.color} size={18} />
                  </View>
                  <View style={styles.milestoneInfo}>
                    <Text style={styles.milestoneTitle}>{ms.titleTr}</Text>
                    <Text style={styles.milestoneSub}>
                      {ms.oldValue} → {ms.newValue}
                    </Text>
                  </View>
                  <Text style={styles.milestoneDate}>
                    {new Date(ms.achievedDate).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 14,
    color: colors.headerSubtitle,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 14,
    marginTop: 8,
  },
  weeklyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  weeklyCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  weeklyLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  weeklyValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  weeklyChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  weeklyChangeTxt: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  recordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  recordCard: {
    width: '47%' as any,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    flexGrow: 1,
  },
  recordCardFirst: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.accent + '30',
  },
  recordFirstGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordTitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recordTitleFirst: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  recordValueFirst: {
    fontSize: 24,
    color: colors.accent,
  },
  recordDate: {
    fontSize: 10,
    color: colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  milestoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  milestoneSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  milestoneDate: {
    fontSize: 11,
    color: colors.textLight,
  },
});
