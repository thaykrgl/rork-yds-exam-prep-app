import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Flame, Target, TrendingUp, RotateCcw, BookOpen, Trophy, Clock, ChevronRight, BarChart3, Bell, BellOff, Medal, Library, Moon, Sun, Bookmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useThemeStore } from '@/stores/themeStore';
import { useStudy } from '@/providers/StudyProvider';
import { studyCategories } from '@/mocks/questions';
import { formatDuration } from '@/utils/examUtils';
import { useAchievementStore } from '@/stores/achievementStore';
import { usePersonalRecordsStore } from '@/stores/personalRecordsStore';
import { useGrammarStore } from '@/stores/grammarStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { requestNotificationPermissions } from '@/utils/notifications';
import { allBadges } from '@/data/badges';
import BadgeCard from '@/components/BadgeCard';
import XPBar from '@/components/XPBar';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { mode, toggleTheme } = useThemeStore();
  const { stats, vocabCards, resetStats, updateDailyGoal } = useStudy();

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

  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0;
  const masteredWords = vocabCards.filter(c => c.mastered).length;
  const topRecord = usePersonalRecordsStore(s => s.getTopRecords()[0]);
  const grammarReadCount = useGrammarStore(s => s.getReadCount());
  const bookmarkCount = useBookmarkStore(s => s.getBookmarkCount());
  const grammarTotalTopics = useGrammarStore(s => s.getTotalTopics());

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleReset = () => {
    Alert.alert(
      'İstatistikleri Sıfırla',
      'Tüm ilerlemen, vokal kartların ve istatistiklerin kalıcı olarak silinecek. Emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sıfırla', style: 'destructive', onPress: resetStats },
      ]
    );
  };

  const categoryData = useMemo(() => {
    return studyCategories.map(cat => {
      const s = stats.categoryStats[cat.id];
      const acc = s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : 0;
      return { ...cat, answered: s.answered, correct: s.correct, accuracy: acc };
    });
  }, [stats.categoryStats]);

  const { preferences, updatePreferences } = useNotificationStore();

  const handleToggleDaily = async () => {
    const newState = !preferences.dailyReminder;
    if (newState) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Bildirim İzni',
          'Hatırlatıcıları etkinleştirmek için ayarlardan bildirim izni vermeniz gerekmektedir.',
          [{ text: 'Tamam' }]
        );
        return;
      }
    }
    await updatePreferences({ dailyReminder: newState });
  };

  const handleToggleStreak = async () => {
    const newState = !preferences.streakReminder;
    if (newState) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Bildirim İzni',
          'Seri hatırlatıcılarını etkinleştirmek için ayarlardan bildirim izni vermeniz gerekmektedir.',
          [{ text: 'Tamam' }]
        );
        return;
      }
    }
    await updatePreferences({ streakReminder: newState });
  };

  const handleToggleMilestones = async () => {
    const newState = !preferences.milestoneNotifications;
    if (newState) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Bildirim İzni',
          'Başarı bildirimlerini etkinleştirmek için ayarlardan bildirim izni vermeniz gerekmektedir.',
          [{ text: 'Tamam' }]
        );
        return;
      }
    }
    await updatePreferences({ milestoneNotifications: newState });
  };

  const handleToggleWordOfTheDay = async () => {
    const newState = !preferences.wordOfTheDay;
    if (newState) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Bildirim İzni',
          'Günün kelimesi bildirimlerini etkinleştirmek için ayarlardan bildirim izni vermeniz gerekmektedir.',
          [{ text: 'Tamam' }]
        );
        return;
      }
    }
    await updatePreferences({ wordOfTheDay: newState });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTopActions}>
          <TouchableOpacity 
            style={styles.themeToggle} 
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {mode === 'dark' ? <Sun size={20} color="#FFFFFF" /> : <Moon size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
        <View style={styles.avatarContainer}>
          <LinearGradient colors={[colors.accent, colors.accentLight]} style={styles.avatar}>
            <Text style={styles.avatarText}>YDS</Text>
          </LinearGradient>
        </View>
        <Text style={styles.headerTitle}>YDS Hazırlık</Text>
        <Text style={styles.headerSubtitle}>İstatistiklerini takip et</Text>
        <XPBar xp={stats.xp || 0} />
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        {/* Big stats row */}
        <View style={styles.bigStatsRow}>
          <View style={styles.bigStat}>
            <View style={[styles.bigStatIcon, { backgroundColor: mode === 'dark' ? '#3D2010' : '#FFF7ED' }]}>
              <Flame color="#F97316" size={24} />
            </View>
            <Text style={styles.bigStatValue}>{stats.streak}</Text>
            <Text style={styles.bigStatLabel}>Günlük Seri</Text>
          </View>
          <View style={styles.bigStat}>
            <View style={[styles.bigStatIcon, { backgroundColor: mode === 'dark' ? '#103020' : '#F0FDF4' }]}>
              <Target color="#22C55E" size={24} />
            </View>
            <Text style={styles.bigStatValue}>%{accuracy}</Text>
            <Text style={styles.bigStatLabel}>Doğruluk Oranı</Text>
          </View>
          <View style={styles.bigStat}>
            <View style={[styles.bigStatIcon, { backgroundColor: mode === 'dark' ? '#102040' : '#EFF6FF' }]}>
              <Clock color="#3B82F6" size={24} />
            </View>
            <Text style={styles.bigStatValue}>{Math.round(stats.totalStudyTimeSeconds / 60)}</Text>
            <Text style={styles.bigStatLabel}>Dk. Çalışma</Text>
          </View>
        </View>

        {/* Vocab card */}
        <TouchableOpacity 
          style={styles.vocabCard}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/(tabs)/vocabulary', params: { initialFilter: 'mastered' } } as any)}
        >
          <BookOpen color={colors.accent} size={20} />
          <View style={styles.vocabInfo}>
            <Text style={styles.vocabTitle}>Kelime Bilgisi</Text>
            <Text style={styles.vocabSub}>{masteredWords}/{vocabCards.length} kelime öğrenildi</Text>
          </View>
          <View style={styles.vocabBadge}>
            <Text style={styles.vocabBadgeText}>%{Math.round((masteredWords / (vocabCards.length || 1)) * 100)}</Text>
          </View>
          <ChevronRight size={18} color={colors.textLight} />
        </TouchableOpacity>

        {/* Category details */}
        {categoryData.filter(c => c.answered > 0).map(cat => (
          <View key={cat.id} style={styles.categoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
            <View style={styles.categoryRowInfo}>
              <Text style={styles.categoryRowTitle}>{cat.titleTr}</Text>
              <Text style={styles.categoryRowSub}>{cat.answered} çözüldü</Text>
            </View>
            <View style={styles.categoryRowRight}>
              <Text style={[styles.categoryAccuracy, { color: cat.accuracy >= 70 ? colors.success : cat.accuracy >= 40 ? colors.warning : colors.error }]}>
                %{cat.accuracy}
              </Text>
            </View>
          </View>
        ))}

        {/* Links */}
        <TouchableOpacity
          style={styles.analyticsButton}
          activeOpacity={0.7}
          onPress={() => router.push('/analytics' as any)}
        >
          <BarChart3 size={20} color={colors.examAccent} />
          <Text style={styles.analyticsText}>Detaylı Analiz</Text>
          <ChevronRight size={18} color={colors.textLight} />
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
          <ChevronRight size={18} color={colors.textLight} />
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
          <ChevronRight size={18} color={colors.textLight} />
        </TouchableOpacity>

        {/* Bookmarked Questions */}
        {bookmarkCount > 0 && (
          <TouchableOpacity
            style={styles.analyticsButton}
            activeOpacity={0.7}
            onPress={() => router.push('/bookmarked-quiz' as any)}
          >
            <Bookmark size={20} color={colors.accent} />
            <Text style={styles.analyticsText}>
              Kaydedilen Sorular · {bookmarkCount} soru
            </Text>
            <ChevronRight size={18} color={colors.textLight} />
          </TouchableOpacity>
        )}

        {/* Daily Goal Settings */}
        <TouchableOpacity
          style={styles.analyticsButton}
          activeOpacity={0.7}
          onPress={handleUpdateGoal}
        >
          <Target size={20} color={colors.accent} />
          <Text style={styles.analyticsText}>
            Günlük Hedef · {stats.dailyGoal} Soru
          </Text>
          <ChevronRight size={18} color={colors.textLight} />
        </TouchableOpacity>

        {/* Badges */}
        <Text style={styles.sectionTitle}>Rozetler</Text>
        <View style={styles.badgeGrid}>
          {allBadges.map(badge => (
            <BadgeCard 
              key={badge.id} 
              badge={badge} 
              unlocked={useAchievementStore(s => s.isUnlocked(badge.id))} 
            />
          ))}
        </View>

        {/* Notification Settings */}
        <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>
        <View style={styles.notifCard}>
          <TouchableOpacity
            style={styles.notifRow}
            onPress={handleToggleDaily}
          >
            {preferences.dailyReminder ? (
              <Bell size={18} color={colors.accent} />
            ) : (
              <BellOff size={18} color={colors.textLight} />
            )}
            <View style={styles.notifInfo}>
              <Text style={styles.notifTitle}>Günlük Hatırlatıcı</Text>
              <Text style={styles.notifSub}>Her gün çalışma hatırlatması al</Text>
            </View>
            <View style={[styles.notifToggle, preferences.dailyReminder && styles.notifToggleActive]}>
              <View style={[styles.notifToggleDot, preferences.dailyReminder && preferences.dailyReminder && styles.notifToggleDotActive]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifRow}
            onPress={handleToggleStreak}
          >
            <Flame size={18} color={preferences.streakReminder ? colors.error : colors.textLight} />
            <View style={styles.notifInfo}>
              <Text style={styles.notifTitle}>Seri Hatırlatıcı</Text>
              <Text style={styles.notifSub}>Serin kırılmadan önce uyarıl</Text>
            </View>
            <View style={[styles.notifToggle, preferences.streakReminder && styles.notifToggleActive]}>
              <View style={[styles.notifToggleDot, preferences.streakReminder && styles.notifToggleDotActive]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifRow}
            onPress={handleToggleMilestones}
          >
            <Trophy size={18} color={preferences.milestoneNotifications ? colors.accent : colors.textLight} />
            <View style={styles.notifInfo}>
              <Text style={styles.notifTitle}>Başarı Bildirimleri</Text>
              <Text style={styles.notifSub}>Rozet ve rekor bildirimleri</Text>
            </View>
            <View style={[styles.notifToggle, preferences.milestoneNotifications && styles.notifToggleActive]}>
              <View style={[styles.notifToggleDot, preferences.milestoneNotifications && styles.notifToggleDotActive]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifRow}
            onPress={handleToggleWordOfTheDay}
          >
            <BookOpen size={18} color={preferences.wordOfTheDay ? colors.primary : colors.textLight} />
            <View style={styles.notifInfo}>
              <Text style={styles.notifTitle}>Günün Kelimesi</Text>
              <Text style={styles.notifSub}>Her gün yeni bir kelime öğren</Text>
            </View>
            <View style={[styles.notifToggle, preferences.wordOfTheDay && styles.notifToggleActive]}>
              <View style={[styles.notifToggleDot, preferences.wordOfTheDay && styles.notifToggleDotActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Exam History */}
        <Text style={styles.sectionTitle}>Sınav Geçmişi</Text>
        {stats.examHistory.length > 0 ? (
          stats.examHistory.slice().reverse().map(exam => {
            const pct = Math.round((exam.score / exam.totalQuestions) * 100);
            const modeLabel = exam.config?.mode === 'full' ? 'Tam Sınav' : 'Mini Sınav';
            return (
              <TouchableOpacity
                key={exam.id}
                style={styles.examHistoryCard}
                activeOpacity={0.7}
                onPress={() => router.push({ pathname: '/exam-result' as any, params: { examResultId: exam.id } })}
              >
                <View style={styles.examHistoryLeft}>
                  <View style={[styles.examHistoryIcon, { backgroundColor: pct >= 70 ? colors.success + '15' : colors.warning + '15' }]}>
                    <Trophy size={18} color={pct >= 70 ? colors.success : colors.warning} />
                  </View>
                  <View style={styles.examHistoryInfo}>
                    <Text style={styles.examHistoryTitle}>{modeLabel}</Text>
                    <Text style={styles.examHistorySub}>{new Date(exam.date).toLocaleDateString('tr-TR')} · {exam.score}/{exam.totalQuestions}</Text>
                  </View>
                  <View style={styles.examHistoryRight}>
                    <View style={[styles.examHistoryBadge, { backgroundColor: pct >= 70 ? colors.success + '15' : colors.warning + '15' }]}>
                      <Text style={[styles.examHistoryPercent, { color: pct >= 70 ? colors.success : colors.warning }]}>%{pct}</Text>
                    </View>
                    <ChevronRight size={16} color={colors.textLight} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={{ color: colors.textLight, fontSize: 13, textAlign: 'center', marginVertical: 10 }}>Henüz sınav geçmişi yok.</Text>
        )}

        <TouchableOpacity style={styles.resetButton} activeOpacity={0.7} onPress={handleReset} testID="reset-stats">
          <RotateCcw color={colors.error} size={18} />
          <Text style={styles.resetText}>İstatistikleri Sıfırla</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTopActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.headerSubtitle,
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
    backgroundColor: colors.surface,
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
    color: colors.text,
  },
  bigStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
  vocabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
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
    color: colors.text,
  },
  vocabSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  vocabBadge: {
    backgroundColor: colors.accent + '20', // Use 20% opacity for better contrast
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vocabBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
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
    color: colors.text,
  },
  categoryRowSub: {
    fontSize: 12,
    color: colors.textSecondary,
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
    backgroundColor: colors.examAccent + '10',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.examAccent + '25',
  },
  analyticsText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  notifCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 4,
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
    color: colors.text,
  },
  notifSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notifToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notifToggleActive: {
    backgroundColor: colors.accent,
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
    backgroundColor: colors.surface,
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
    color: colors.text,
  },
  examHistorySub: {
    fontSize: 12,
    color: colors.textSecondary,
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
    borderColor: colors.error + '30',
    backgroundColor: colors.error + '08',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.error,
  },
});
