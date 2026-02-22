import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Flame, Target, TrendingUp, RotateCcw, BookOpen, Trophy, Clock, ChevronRight, BarChart3, Bell, BellOff, Medal, Library } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useStudy } from '@/providers/StudyProvider';
import { studyCategories } from '@/mocks/questions';
import { formatDuration } from '@/utils/examUtils';
import { useAchievementStore } from '@/stores/achievementStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { allBadges } from '@/data/badges';
import BadgeCard from '@/components/BadgeCard';
import XPBar from '@/components/XPBar';
import { usePersonalRecordsStore } from '@/stores/personalRecordsStore';
import { useGrammarStore } from '@/stores/grammarStore';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stats, vocabCards, resetStats } = useStudy();

  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0;
  const masteredWords = vocabCards.filter(c => c.mastered).length;
  const topRecord = usePersonalRecordsStore(s => s.getTopRecords()[0]);
  const grammarReadCount = useGrammarStore(s => s.getReadCount());
  const grammarTotalTopics = useGrammarStore(s => s.getTotalTopics());

  const handleReset = () => {
    Alert.alert(
      'İstatistikleri Sıfırla',
      'Tüm istatistiklerini sıfırlamak istediğinden emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sıfırla', style: 'destructive', onPress: resetStats },
      ],
    );
  };

  const categoryData = useMemo(() => {
    return studyCategories.map(cat => {
      const s = stats.categoryStats[cat.id];
      const acc = s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : 0;
      return { ...cat, answered: s.answered, correct: s.correct, accuracy: acc };
    });
  }, [stats.categoryStats]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.avatarContainer}>
          <LinearGradient colors={[Colors.accent, Colors.accentLight]} style={styles.avatar}>
            <Text style={styles.avatarText}>YDS</Text>
          </LinearGradient>
        </View>
        <Text style={styles.headerTitle}>YDS Hazırlık</Text>
        <Text style={styles.headerSubtitle}>İstatistiklerini takip et</Text>
        <XPBar xp={stats.xp || 0} />
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        <View style={styles.bigStatsRow}>
          <View style={styles.bigStat}>
            <View style={[styles.bigStatIcon, { backgroundColor: '#FFF7ED' }]}>
              <Flame color="#F97316" size={24} />
            </View>
            <Text style={styles.bigStatValue}>{stats.bestStreak}</Text>
            <Text style={styles.bigStatLabel}>En İyi Seri</Text>
          </View>
          <View style={styles.bigStat}>
            <View style={[styles.bigStatIcon, { backgroundColor: '#F0FDF4' }]}>
              <TrendingUp color="#22C55E" size={24} />
            </View>
            <Text style={styles.bigStatValue}>%{accuracy}</Text>
            <Text style={styles.bigStatLabel}>Başarı Oranı</Text>
          </View>
          <View style={styles.bigStat}>
            <View style={[styles.bigStatIcon, { backgroundColor: '#EFF6FF' }]}>
              <Award color="#3B82F6" size={24} />
            </View>
            <Text style={styles.bigStatValue}>{stats.totalAnswered}</Text>
            <Text style={styles.bigStatLabel}>Toplam Soru</Text>
          </View>
        </View>

        <View style={styles.vocabCard}>
          <BookOpen color={Colors.accent} size={20} />
          <View style={styles.vocabInfo}>
            <Text style={styles.vocabTitle}>Kelime Bilgisi</Text>
            <Text style={styles.vocabSub}>{masteredWords}/{vocabCards.length} kelime öğrenildi</Text>
          </View>
          <View style={styles.vocabBadge}>
            <Text style={styles.vocabBadgeText}>%{Math.round((masteredWords / vocabCards.length) * 100)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Kategori Detayları</Text>

        {categoryData.map(cat => (
          <View key={cat.id} style={styles.categoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
            <View style={styles.categoryRowInfo}>
              <Text style={styles.categoryRowTitle}>{cat.titleTr}</Text>
              <Text style={styles.categoryRowSub}>{cat.answered} çözüldü</Text>
            </View>
            <View style={styles.categoryRowRight}>
              <Text style={[styles.categoryAccuracy, { color: cat.accuracy >= 70 ? Colors.success : cat.accuracy >= 40 ? Colors.warning : Colors.error }]}>
                %{cat.accuracy}
              </Text>
            </View>
          </View>
        ))}

        {/* Analytics Button */}
        <TouchableOpacity
          style={styles.analyticsButton}
          activeOpacity={0.7}
          onPress={() => router.push('/analytics' as any)}
        >
          <BarChart3 size={20} color={Colors.examAccent} />
          <Text style={styles.analyticsText}>Detaylı Analiz</Text>
          <ChevronRight size={18} color={Colors.textLight} />
        </TouchableOpacity>

        {/* Personal Records */}
        <TouchableOpacity
          style={styles.analyticsButton}
          activeOpacity={0.7}
          onPress={() => router.push('/personal-records' as any)}
        >
          <Medal size={20} color="#F59E0B" />
          <Text style={styles.analyticsText}>
            Kişisel Rekorlar{topRecord ? ` · ${topRecord.displayValue}` : ''}
          </Text>
          <ChevronRight size={18} color={Colors.textLight} />
        </TouchableOpacity>

        {/* Grammar Library */}
        <TouchableOpacity
          style={styles.analyticsButton}
          activeOpacity={0.7}
          onPress={() => router.push('/grammar-library' as any)}
        >
          <Library size={20} color="#8B5CF6" />
          <Text style={styles.analyticsText}>
            Gramer Kütüphanesi · {grammarReadCount}/{grammarTotalTopics}
          </Text>
          <ChevronRight size={18} color={Colors.textLight} />
        </TouchableOpacity>

        {/* Badges */}
        <Text style={styles.sectionTitle}>Rozetler</Text>
        <View style={styles.badgeGrid}>
          {allBadges.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              unlocked={useAchievementStore.getState().isUnlocked(badge.id)}
            />
          ))}
        </View>

        {/* Notification Settings */}
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        <View style={styles.notifCard}>
          <TouchableOpacity
            style={styles.notifRow}
            onPress={() => {
              const store = useNotificationStore.getState();
              store.updatePreferences({ dailyReminder: !store.preferences.dailyReminder });
            }}
          >
            {useNotificationStore.getState().preferences.dailyReminder ? (
              <Bell size={18} color={Colors.accent} />
            ) : (
              <BellOff size={18} color={Colors.textLight} />
            )}
            <View style={styles.notifInfo}>
              <Text style={styles.notifTitle}>Günlük Hatırlatıcı</Text>
              <Text style={styles.notifSub}>Her gün çalışma hatırlatması al</Text>
            </View>
            <View style={[styles.notifToggle, useNotificationStore.getState().preferences.dailyReminder && styles.notifToggleActive]}>
              <View style={[styles.notifToggleDot, useNotificationStore.getState().preferences.dailyReminder && styles.notifToggleDotActive]} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notifRow}
            onPress={() => {
              const store = useNotificationStore.getState();
              store.updatePreferences({ milestoneNotifications: !store.preferences.milestoneNotifications });
            }}
          >
            <Trophy size={18} color={useNotificationStore.getState().preferences.milestoneNotifications ? Colors.accent : Colors.textLight} />
            <View style={styles.notifInfo}>
              <Text style={styles.notifTitle}>Başarı Bildirimleri</Text>
              <Text style={styles.notifSub}>Rozet ve milestone bildirimleri</Text>
            </View>
            <View style={[styles.notifToggle, useNotificationStore.getState().preferences.milestoneNotifications && styles.notifToggleActive]}>
              <View style={[styles.notifToggleDot, useNotificationStore.getState().preferences.milestoneNotifications && styles.notifToggleDotActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Exam History */}
        {stats.examHistory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Sınav Geçmişi</Text>
            {stats.examHistory.slice(-5).reverse().map((exam) => {
              const pct = Math.round((exam.score / exam.totalQuestions) * 100);
              const modeLabel = exam.config.mode === 'full' ? 'Tam Simülasyon' : 'Mini Sınav';
              const date = new Date(exam.date);
              const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
              return (
                <TouchableOpacity
                  key={exam.id}
                  style={styles.examHistoryCard}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/exam-result' as any, params: { examResultId: exam.id } })}
                >
                  <View style={styles.examHistoryLeft}>
                    <View style={[styles.examHistoryIcon, { backgroundColor: pct >= 70 ? Colors.success + '15' : Colors.warning + '15' }]}>
                      <Trophy size={18} color={pct >= 70 ? Colors.success : Colors.warning} />
                    </View>
                    <View style={styles.examHistoryInfo}>
                      <Text style={styles.examHistoryTitle}>{modeLabel}</Text>
                      <Text style={styles.examHistorySub}>{dateStr} · {exam.score}/{exam.totalQuestions} · {formatDuration(exam.timeSpentSeconds)}</Text>
                    </View>
                  </View>
                  <View style={styles.examHistoryRight}>
                    <View style={[styles.examHistoryBadge, { backgroundColor: pct >= 70 ? Colors.success + '15' : Colors.warning + '15' }]}>
                      <Text style={[styles.examHistoryPercent, { color: pct >= 70 ? Colors.success : Colors.warning }]}>%{pct}</Text>
                    </View>
                    <ChevronRight size={16} color={Colors.textLight} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <TouchableOpacity style={styles.resetButton} activeOpacity={0.7} onPress={handleReset} testID="reset-stats">
          <RotateCcw color={Colors.error} size={18} />
          <Text style={styles.resetText}>İstatistikleri Sıfırla</Text>
        </TouchableOpacity>

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
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.accentSoft,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },
  bigStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  bigStat: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  bigStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  bigStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
  vocabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  vocabInfo: {
    flex: 1,
  },
  vocabTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  vocabSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vocabBadge: {
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vocabBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  categoryRowInfo: {
    flex: 1,
  },
  categoryRowTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  categoryRowSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  categoryRowRight: {
    alignItems: 'flex-end',
  },
  categoryAccuracy: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.examAccent + '10',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.examAccent + '25',
  },
  analyticsText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  notifCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  notifInfo: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  notifSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notifToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notifToggleActive: {
    backgroundColor: Colors.accent,
  },
  notifToggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  notifToggleDotActive: {
    alignSelf: 'flex-end',
  },
  examHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  examHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  examHistoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examHistoryInfo: {
    flex: 1,
  },
  examHistoryTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  examHistorySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  examHistoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examHistoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  examHistoryPercent: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error + '30',
    backgroundColor: Colors.error + '08',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.error,
  },
});
