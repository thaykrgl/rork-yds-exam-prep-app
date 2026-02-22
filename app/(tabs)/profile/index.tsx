import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Flame, Target, TrendingUp, RotateCcw, BookOpen } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useStudy } from '@/providers/StudyProvider';
import { studyCategories } from '@/mocks/questions';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { stats, vocabCards, resetStats } = useStudy();

  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0;
  const masteredWords = vocabCards.filter(c => c.mastered).length;

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
