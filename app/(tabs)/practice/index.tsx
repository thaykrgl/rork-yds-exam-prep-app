import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Play, BookOpen, PenTool, FileText, Languages, Puzzle, Shuffle, Clock, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { studyCategories, questions } from '@/mocks/questions';
import { useStudy } from '@/providers/StudyProvider';
import { QuestionCategory } from '@/types';

const categoryIcons: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  BookOpen,
  PenTool,
  FileText,
  Languages,
  PuzzleIcon: Puzzle,
};

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stats } = useStudy();
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');

  const questionCount = useMemo(() => {
    if (selectedCategory === 'all') return questions.length;
    return questions.filter(q => q.category === selectedCategory).length;
  }, [selectedCategory]);

  const handleStart = () => {
    router.push({ pathname: '/quiz' as any, params: { category: selectedCategory } });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Pratik Yap</Text>
        <Text style={styles.headerSubtitle}>Kategori seç ve soru çözmeye başla</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        <View style={styles.modeCards}>
          <TouchableOpacity
            style={[styles.modeCard, selectedCategory === 'all' && styles.modeCardActive]}
            activeOpacity={0.7}
            onPress={() => setSelectedCategory('all')}
          >
            <Shuffle color={selectedCategory === 'all' ? Colors.accent : Colors.textSecondary} size={24} />
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
                <Icon color={isSelected ? cat.color : Colors.textSecondary} size={18} />
                <Text style={[styles.chipText, isSelected && { color: cat.color }]}>{cat.titleTr}</Text>
                <Text style={[styles.chipCount, isSelected && { color: cat.color }]}>{catQuestions}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Clock color={Colors.textSecondary} size={16} />
            <Text style={styles.infoText}>Süre sınırı yok - rahatça çöz</Text>
          </View>
          <View style={styles.infoRow}>
            <Zap color={Colors.accent} size={16} />
            <Text style={styles.infoText}>Her doğru cevap serini artırır</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} activeOpacity={0.8} onPress={handleStart} testID="start-quiz">
          <LinearGradient colors={[Colors.accent, Colors.accentLight]} style={styles.startGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Play color={Colors.primary} size={22} />
            <Text style={styles.startText}>Başla ({questionCount} soru)</Text>
          </LinearGradient>
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
    color: Colors.accentSoft,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },
  modeCards: {
    marginBottom: 24,
  },
  modeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSoft + '40',
  },
  modeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  modeTitleActive: {
    color: Colors.primary,
  },
  modeCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modeCountActive: {
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  chipCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  infoSection: {
    backgroundColor: Colors.surface,
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
    color: Colors.textSecondary,
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
    color: Colors.primary,
  },
});
