import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Play, BookOpen, PenTool, FileText, Languages, Puzzle, Shuffle, Clock, Zap, Timer, Newspaper, Bookmark, Calendar, ChevronRight, Library } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { studyCategories, questions } from '@/mocks/questions';
import { useStudy } from '@/providers/StudyProvider';
import { usePremiumStore } from '@/stores/premiumStore';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useStudyPlanStore } from '@/stores/studyPlanStore';
import { useGrammarStore } from '@/stores/grammarStore';
import { QuestionCategory, ExamConfig } from '@/types';
import { getExamTimeLimitMinutes } from '@/utils/examUtils';
import PaywallScreen from '@/components/PaywallScreen';

const categoryIcons: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  BookOpen,
  PenTool,
  FileText,
  Languages,
  PuzzleIcon: Puzzle,
  Newspaper,
};

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { stats } = useStudy();
  const bookmarkCount = useBookmarkStore((s) => s.getBookmarkCount());
  const { activePlan, getPlanProgress, getActivePlanDef } = useStudyPlanStore();
  const grammarReadCount = useGrammarStore(s => s.getReadCount());
  const grammarTotalTopics = useGrammarStore(s => s.getTotalTopics());
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [showPaywall, setShowPaywall] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const questionCount = useMemo(() => {
    if (selectedCategory === 'all') return questions.length;
    return questions.filter(q => q.category === selectedCategory).length;
  }, [selectedCategory]);

  const handleStart = () => {
    router.push({ pathname: '/quiz' as any, params: { category: selectedCategory } });
  };

  const handleStartExam = (mode: 'full' | 'mini', qCount: 20 | 40 | 80 = 80) => {
    const canStart = usePremiumStore.getState().consumeExam();
    if (!canStart) {
      setShowPaywall(true);
      return;
    }

    const config: ExamConfig = {
      mode,
      questionCount: mode === 'full' ? 80 : qCount,
      timeLimitMinutes: mode === 'full' ? 150 : getExamTimeLimitMinutes(qCount),
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

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Pratik Yap</Text>
        <Text style={styles.headerSubtitle}>Kategori seç ve soru çözmeye başla</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        {/* Exam Mode Section */}
        <Text style={styles.sectionTitle}>Sınav Modu</Text>
        <View style={styles.examCards}>
          <TouchableOpacity
            style={styles.examCard}
            activeOpacity={0.7}
            onPress={() => handleStartExam('full')}
          >
            <LinearGradient
              colors={[colors.examAccent + '15', colors.examAccent + '05']}
              style={styles.examCardGradient}
            >
              <Timer color={colors.examAccent} size={24} />
              <View style={styles.examCardContent}>
                <Text style={styles.examCardTitle}>Tam Simülasyon</Text>
                <Text style={styles.examCardDesc}>80 soru · 150 dakika</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.examCard}
            activeOpacity={0.7}
            onPress={handleMiniExam}
          >
            <LinearGradient
              colors={[colors.accent + '15', colors.accent + '05']}
              style={styles.examCardGradient}
            >
              <Clock color={colors.accent} size={24} />
              <View style={styles.examCardContent}>
                <Text style={styles.examCardTitle}>Mini Sınav</Text>
                <Text style={styles.examCardDesc}>20/40/80 soru · sen seç</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Study Plans */}
        <TouchableOpacity
          style={styles.studyPlanCard}
          activeOpacity={0.7}
          onPress={() => router.push('/study-plans' as any)}
        >
          <View style={styles.studyPlanLeft}>
            <View style={[styles.studyPlanIcon, { backgroundColor: colors.examAccent + '15' }]}>
              <Calendar size={20} color={colors.examAccent} />
            </View>
            <View style={styles.studyPlanInfo}>
              <Text style={styles.studyPlanTitle}>Çalışma Planları</Text>
              <Text style={styles.studyPlanSub}>
                {activePlan ? `${getActivePlanDef()?.title} · %${getPlanProgress().percentage}` : 'Sistematik hazırlık için plan seç'}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textLight} />
        </TouchableOpacity>

        {/* Bookmarked Questions */}
        {bookmarkCount > 0 && (
          <TouchableOpacity
            style={styles.bookmarkCard}
            activeOpacity={0.7}
            onPress={() => router.push('/bookmarked-quiz' as any)}
          >
            <View style={styles.studyPlanLeft}>
              <View style={[styles.studyPlanIcon, { backgroundColor: colors.accent + '15' }]}>
                <Bookmark size={20} color={colors.accent} />
              </View>
              <View style={styles.studyPlanInfo}>
                <Text style={styles.studyPlanTitle}>Kaydedilen Sorular</Text>
                <Text style={styles.studyPlanSub}>{bookmarkCount} kayıtlı soru</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textLight} />
          </TouchableOpacity>
        )}

        {/* Grammar Library */}
        <TouchableOpacity
          style={styles.studyPlanCard}
          activeOpacity={0.7}
          onPress={() => router.push('/grammar-library' as any)}
        >
          <View style={styles.studyPlanLeft}>
            <View style={[styles.studyPlanIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
              <Library size={20} color={'#8B5CF6'} />
            </View>
            <View style={styles.studyPlanInfo}>
              <Text style={styles.studyPlanTitle}>Gramer Kütüphanesi</Text>
              <Text style={styles.studyPlanSub}>{grammarReadCount}/{grammarTotalTopics} konu okundu</Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textLight} />
        </TouchableOpacity>

        {/* Practice Mode */}
        <Text style={styles.sectionTitle}>Pratik Modu</Text>

        <View style={styles.modeCards}>
          <TouchableOpacity
            style={[styles.modeCard, selectedCategory === 'all' && styles.modeCardActive]}
            activeOpacity={0.7}
            onPress={() => setSelectedCategory('all')}
          >
            <Shuffle color={selectedCategory === 'all' ? colors.accent : colors.textSecondary} size={24} />
            <Text style={[styles.modeTitle, selectedCategory === 'all' && styles.modeTitleActive]}>Karışık</Text>
            <Text style={[styles.modeCount, selectedCategory === 'all' && styles.modeCountActive]}>{questions.length} soru</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Kategoriler</Text>

        <View style={styles.categoryGrid}>
          {studyCategories.map(cat => {
            const Icon = categoryIcons[cat.icon] || BookOpen;
            const isSelected = selectedCategory === cat.id;
            const catQuestions = questions.filter(q => q.category === cat.id).length;

            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isSelected && { backgroundColor: cat.color + '20', borderColor: cat.color }]}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Icon color={isSelected ? cat.color : colors.textSecondary} size={18} />
                <Text style={[styles.chipText, isSelected && { color: cat.color }]}>{cat.titleTr}</Text>
                <Text style={[styles.chipCount, isSelected && { color: cat.color }]}>{catQuestions}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Clock color={colors.textSecondary} size={16} />
            <Text style={styles.infoText}>Süre sınırı yok - rahatça çöz</Text>
          </View>
          <View style={styles.infoRow}>
            <Zap color={colors.accent} size={16} />
            <Text style={styles.infoText}>Her doğru cevap serini artırır</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} activeOpacity={0.8} onPress={handleStart} testID="start-quiz">
          <LinearGradient colors={[colors.accent, colors.accentLight]} style={styles.startGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Play color={colors.primary} size={22} />
            <Text style={styles.startText}>Başla ({questionCount} soru)</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      <PaywallScreen visible={showPaywall} onClose={() => setShowPaywall(false)} />
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  examCards: {
    gap: 10,
    marginBottom: 24,
  },
  examCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  examCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  examCardContent: {
    flex: 1,
  },
  examCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  examCardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  studyPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  bookmarkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  studyPlanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  studyPlanIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyPlanInfo: {
    flex: 1,
  },
  studyPlanTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  studyPlanSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modeCards: {
    marginBottom: 24,
  },
  modeCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft + '40',
  },
  modeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  modeTitleActive: {
    color: colors.primary,
  },
  modeCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modeCountActive: {
    color: colors.accent,
    fontWeight: '600' as const,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
  chipCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  startButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  startText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.primary,
  },
});
