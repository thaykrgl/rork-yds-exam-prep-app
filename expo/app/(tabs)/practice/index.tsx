import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Play, BookOpen, PenTool, FileText, Languages, Puzzle,
  Shuffle, Timer, Clock, Newspaper, Calendar, ChevronRight,
  Library, Moon, Sun, Zap,
} from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { useThemeStore } from '@/stores/themeStore';
import { studyCategories, questions } from '@/mocks/questions';
import { useStudy } from '@/providers/StudyProvider';
import { usePremiumStore } from '@/stores/premiumStore';
import { useStudyPlanStore } from '@/stores/studyPlanStore';
import { useGrammarStore } from '@/stores/grammarStore';
import { QuestionCategory, ExamConfig } from '@/types';
import { getExamTimeLimitMinutes } from '@/utils/examUtils';
import PaywallScreen from '@/components/PaywallScreen';

const categoryIcons: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  BookOpen, PenTool, FileText, Languages, PuzzleIcon: Puzzle, Newspaper,
};

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { mode, toggleTheme } = useThemeStore();
  const { stats } = useStudy();
  const { activePlan, getPlanProgress, getActivePlanDef } = useStudyPlanStore();
  const grammarReadCount = useGrammarStore(s => s.getReadCount());
  const grammarTotalTopics = useGrammarStore(s => s.getTotalTopics());
  const [showPaywall, setShowPaywall] = useState(false);

  const styles = useMemo(() => createStyles(colors, mode), [colors, mode]);

  const handleStartExam = (examMode: 'full' | 'mini', qCount: 20 | 40 | 80 = 80) => {
    const canStart = usePremiumStore.getState().consumeExam();
    if (!canStart) {
      setShowPaywall(true);
      return;
    }
    const config: ExamConfig = {
      mode: examMode,
      questionCount: examMode === 'full' ? 80 : qCount,
      timeLimitMinutes: examMode === 'full' ? 150 : getExamTimeLimitMinutes(qCount),
    };
    router.push({ pathname: '/exam' as any, params: { examConfigJson: JSON.stringify(config) } });
  };

  const handleMiniExam = () => {
    Alert.alert('Mini Sınav', 'Kaç soru çözmek istiyorsun?', [
      { text: '20 Soru', onPress: () => handleStartExam('mini', 20) },
      { text: '40 Soru', onPress: () => handleStartExam('mini', 40) },
      { text: '80 Soru', onPress: () => handleStartExam('mini', 80) },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const handleCategoryPress = (categoryId: QuestionCategory) => {
    router.push({ pathname: '/quiz' as any, params: { category: categoryId } });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Pratik Yap</Text>
            <Text style={styles.headerSubtitle}>Çalışma modunu seç ve başla</Text>
          </View>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {mode === 'dark' ? <Sun size={20} color="#FFFFFF" /> : <Moon size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>

        {/* ── Section 1: Sınav Modu ── */}
        <Text style={styles.sectionTitle}>Sınav Modu</Text>
        <View style={styles.examRow}>
          <TouchableOpacity style={styles.examCard} activeOpacity={0.7} onPress={() => handleStartExam('full')}>
            <View style={[styles.examIconBox, { backgroundColor: colors.examAccent + '15' }]}>  
              <Timer color={colors.examAccent} size={24} />
            </View>
            <Text style={styles.examCardTitle}>Tam Simülasyon</Text>
            <Text style={styles.examCardDesc}>80 soru · 150 dk</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.examCard} activeOpacity={0.7} onPress={handleMiniExam}>
            <View style={[styles.examIconBox, { backgroundColor: colors.accent + '15' }]}>
              <Clock color={colors.accent} size={24} />
            </View>
            <Text style={styles.examCardTitle}>Mini Sınav</Text>
            <Text style={styles.examCardDesc}>20/40/80 soru</Text>
          </TouchableOpacity>
        </View>

        {/* ── Section 2: Soru Çöz ── */}
        <Text style={styles.sectionTitle}>Soru Çöz</Text>

        {/* All questions button */}
        <TouchableOpacity
          style={styles.allQuestionsCard}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/quiz' as any, params: { category: 'all' } })}
        >
          <LinearGradient
            colors={[colors.accent, colors.accentLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.allQuestionsGradient}
          >
            <Shuffle color={colors.primary} size={20} />
            <Text style={styles.allQuestionsText}>Karışık Soru Çöz ({questions.length} soru)</Text>
            <ChevronRight color={colors.primary} size={18} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Category chips */}
        <View style={styles.categoryGrid}>
          {studyCategories.map(cat => {
            const Icon = categoryIcons[cat.icon] || BookOpen;
            const catStat = stats.categoryStats[cat.id];
            const catQuestions = questions.filter(q => q.category === cat.id).length;

            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                activeOpacity={0.7}
                onPress={() => handleCategoryPress(cat.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                  <Icon color={cat.color} size={20} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>{cat.titleTr}</Text>
                  <Text style={styles.categorySub}>
                    {catStat && catStat.answered > 0
                      ? `${catStat.answered} çözüldü`
                      : `${catQuestions} soru`}
                  </Text>
                </View>
                <ChevronRight color={colors.textLight} size={16} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Section 3: Kaynaklar ── */}
        <Text style={styles.sectionTitle}>Kaynaklar</Text>

        {/* Study Plans */}
        <TouchableOpacity
          style={styles.resourceCard}
          activeOpacity={0.7}
          onPress={() => router.push('/study-plans' as any)}
        >
          <View style={[styles.resourceIcon, { backgroundColor: colors.examAccent + '15' }]}>
            <Calendar size={20} color={colors.examAccent} />
          </View>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceTitle}>Çalışma Planları</Text>
            <Text style={styles.resourceSub}>
              {activePlan ? `${getActivePlanDef()?.title} · %${getPlanProgress().percentage}` : 'Sistematik hazırlık için plan seç'}
            </Text>
          </View>
          <ChevronRight size={16} color={colors.textLight} />
        </TouchableOpacity>

        {/* Grammar Library */}
        <TouchableOpacity
          style={styles.resourceCard}
          activeOpacity={0.7}
          onPress={() => router.push('/grammar-library' as any)}
        >
          <View style={[styles.resourceIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
            <Library size={20} color="#8B5CF6" />
          </View>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceTitle}>Gramer Kütüphanesi</Text>
            <Text style={styles.resourceSub}>{grammarReadCount}/{grammarTotalTopics} konu okundu</Text>
          </View>
          <ChevronRight size={16} color={colors.textLight} />
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      <PaywallScreen visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </View>
  );
}

const createStyles = (colors: any, mode: string) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: colors.headerSubtitle },
  themeToggle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  contentInner: { padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12, marginTop: 4 },

  // Exam Cards
  examRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  examCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  examIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  examCardTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  examCardDesc: { fontSize: 12, color: colors.textSecondary },

  // All Questions
  allQuestionsCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  allQuestionsGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, gap: 10 },
  allQuestionsText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.primary },

  // Category Grid
  categoryGrid: { gap: 8, marginBottom: 24 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  categoryIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  categoryInfo: { flex: 1 },
  categoryTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  categorySub: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },

  // Resource Cards
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  resourceIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resourceInfo: { flex: 1 },
  resourceTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  resourceSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
