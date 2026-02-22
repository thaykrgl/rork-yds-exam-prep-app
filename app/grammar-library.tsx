import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  BookOpen, Search, ChevronRight, CheckCircle, GitBranch, Link,
  ArrowDownUp, MessageSquare, Clock, Users, FileText, Repeat,
  Volume2, ArrowRightLeft, Puzzle, PenTool, Star, Layers
} from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { useThemeStore } from '@/stores/themeStore';
import { grammarTopics } from '@/data/grammarTopics';
import { useGrammarStore } from '@/stores/grammarStore';
import { GrammarTheme, GrammarDifficulty, GrammarTopic } from '@/types';

const iconMap: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  GitBranch, Link, ArrowDownUp, MessageSquare, Clock, Users,
  FileText, Repeat, Volume2, ArrowRightLeft, Puzzle, PenTool, Star, Layers, BookOpen,
};

const themeLabels: Record<GrammarTheme, string> = {
  sentence_structure: 'Cümle Yapısı',
  verb_forms: 'Fiil Biçimleri',
  clauses: 'Yan Cümle',
  special_structures: 'Özel Yapılar',
};

const difficultyLabels: Record<GrammarDifficulty, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

const difficultyColors: Record<GrammarDifficulty, string> = {
  beginner: '#22C55E',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
};

type FilterType = 'all' | GrammarTheme;

export default function GrammarLibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { mode } = useThemeStore();
  const { isTopicRead, getReadCount, getTotalTopics } = useGrammarStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const styles = useMemo(() => createStyles(colors), [colors]);

  const themeColors: Record<GrammarTheme, string> = useMemo(() => ({
    sentence_structure: '#3B82F6',
    verb_forms: '#F59E0B',
    clauses: mode === 'dark' ? '#A78BFA' : '#8B5CF6',
    special_structures: '#EF4444',
  }), [mode]);

  const readCount = getReadCount();
  const totalTopics = getTotalTopics();
  const progressPct = totalTopics > 0 ? Math.round((readCount / totalTopics) * 100) : 0;

  const filteredTopics = useMemo(() => {
    let topics = [...grammarTopics];

    if (filter !== 'all') {
      topics = topics.filter(t => t.theme === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      topics = topics.filter(
        t =>
          t.titleTr.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return topics.sort((a, b) => a.order - b.order);
  }, [filter, searchQuery]);

  const themes: Array<{ key: FilterType; label: string }> = [
    { key: 'all', label: 'Tümü' },
    { key: 'sentence_structure', label: 'Cümle Yapısı' },
    { key: 'verb_forms', label: 'Fiil Biçimleri' },
    { key: 'clauses', label: 'Yan Cümle' },
    { key: 'special_structures', label: 'Özel Yapılar' },
  ];

  const handleTopicPress = (topic: GrammarTopic) => {
    router.push({
      pathname: '/grammar-topic' as any,
      params: { topicId: topic.id },
    });
  };

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
          <Text style={styles.headerTitle}>Gramer Kütüphanesi</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>İlerleme</Text>
            <Text style={styles.progressValue}>
              {readCount}/{totalTopics} konu okundu
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[colors.accent, colors.accentLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progressPct}%` as any }]}
            />
          </View>
          <Text style={styles.progressPct}>%{progressPct}</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search color={colors.textLight} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Konu ara..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Theme Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {themes.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.filterChip,
              filter === t.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(t.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === t.key && styles.filterChipTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {filteredTopics.map(topic => {
          const Icon = iconMap[topic.icon] || BookOpen;
          const read = isTopicRead(topic.id);

          return (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicCard}
              activeOpacity={0.7}
              onPress={() => handleTopicPress(topic)}
            >
              <View style={[styles.topicIcon, { backgroundColor: topic.color + '15' }]}>
                <Icon color={topic.color} size={22} />
              </View>
              <View style={styles.topicInfo}>
                <View style={styles.topicTitleRow}>
                  <Text style={styles.topicTitle} numberOfLines={1}>
                    {topic.titleTr}
                  </Text>
                  {read && <CheckCircle color={colors.success} size={16} />}
                </View>
                <Text style={styles.topicDesc} numberOfLines={1}>
                  {topic.description}
                </Text>
                <View style={styles.topicMeta}>
                  <View
                    style={[
                      styles.diffBadge,
                      { backgroundColor: difficultyColors[topic.difficulty] + '15' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.diffText,
                        { color: difficultyColors[topic.difficulty] },
                      ]}
                    >
                      {difficultyLabels[topic.difficulty]}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.themeBadge,
                      { backgroundColor: themeColors[topic.theme] + '15' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.themeText,
                        { color: themeColors[topic.theme] },
                      ]}
                    >
                      {themeLabels[topic.theme]}
                    </Text>
                  </View>
                </View>
              </View>
              <ChevronRight color={colors.textLight} size={18} />
            </TouchableOpacity>
          );
        })}

        {filteredTopics.length === 0 && (
          <View style={styles.emptyState}>
            <Search color={colors.textLight} size={40} />
            <Text style={styles.emptyTitle}>Konu bulunamadı</Text>
            <Text style={styles.emptySub}>Farklı bir arama terimi deneyin</Text>
          </View>
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
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  progressSection: {
    marginBottom: 14,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.headerSubtitle,
    fontWeight: '500' as const,
  },
  progressValue: {
    fontSize: 13,
    color: colors.headerSubtitle,
    fontWeight: '500' as const,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressPct: {
    fontSize: 12,
    color: colors.accentLight,
    fontWeight: '600' as const,
    textAlign: 'right',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 10,
  },
  filterScroll: {
    maxHeight: 52,
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    gap: 10,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  topicIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicInfo: {
    flex: 1,
  },
  topicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
  },
  topicDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  topicMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  themeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  themeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
