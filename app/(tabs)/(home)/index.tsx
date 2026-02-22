import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Flame, Target, TrendingUp, BookOpen, PenTool, FileText, Languages, Puzzle, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useStudy } from '@/providers/StudyProvider';
import { studyCategories } from '@/mocks/questions';
import { QuestionCategory } from '@/types';

const { width } = Dimensions.get('window');

const categoryIcons: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  BookOpen,
  PenTool,
  FileText,
  Languages,
  PuzzleIcon: Puzzle,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stats } = useStudy();
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
});
