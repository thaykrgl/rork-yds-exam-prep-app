import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronRight, BookOpen, CheckCircle, AlertTriangle,
  Lightbulb, Target, XCircle, Play, Eye,
  GitBranch, Link, ArrowDownUp, MessageSquare, Clock, Users,
  FileText, Repeat, Volume2, ArrowRightLeft, Puzzle, PenTool, Star, Layers,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { grammarTopics } from '@/data/grammarTopics';
import { useGrammarStore } from '@/stores/grammarStore';
import { GrammarTopicId } from '@/types';

const iconMap: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  GitBranch, Link, ArrowDownUp, MessageSquare, Clock, Users,
  FileText, Repeat, Volume2, ArrowRightLeft, Puzzle, PenTool, Star, Layers, BookOpen,
};

const difficultyLabels: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

const difficultyColors: Record<string, string> = {
  beginner: '#22C55E',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
};

export default function GrammarTopicScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { markAsRead, isTopicRead, getTopicProgress } = useGrammarStore();

  const topic = useMemo(
    () => grammarTopics.find(t => t.id === topicId),
    [topicId]
  );

  if (!topic) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.errorText}>Konu bulunamadı</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.errorLink}>Geri dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const Icon = iconMap[topic.icon] || BookOpen;
  const read = isTopicRead(topic.id as GrammarTopicId);
  const progress = getTopicProgress(topic.id as GrammarTopicId);

  const handleMarkAsRead = () => {
    markAsRead(topic.id as GrammarTopicId);
  };

  const handlePractice = () => {
    if (topic.relatedQuestionIds.length > 0) {
      router.push({
        pathname: '/quiz' as any,
        params: { category: 'grammar', grammarTopicId: topic.id },
      });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[topic.color + 'DD', topic.color + '99']}
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
          <View style={{ flex: 1 }} />
          {read && (
            <View style={styles.readBadge}>
              <CheckCircle color="#FFFFFF" size={14} />
              <Text style={styles.readBadgeText}>Okundu</Text>
            </View>
          )}
        </View>

        <View style={styles.headerContent}>
          <View style={styles.headerIconWrap}>
            <Icon color="#FFFFFF" size={32} />
          </View>
          <Text style={styles.headerTitle}>{topic.titleTr}</Text>
          <Text style={styles.headerDesc}>{topic.description}</Text>
          <View style={styles.headerMeta}>
            <View style={[styles.metaBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.metaText}>
                {difficultyLabels[topic.difficulty]}
              </Text>
            </View>
            {progress && progress.readCount > 0 && (
              <View style={[styles.metaBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Eye color="#FFFFFF" size={12} />
                <Text style={styles.metaText}>{progress.readCount}x okundu</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen color={Colors.examAccent} size={18} />
            <Text style={styles.sectionTitle}>Giriş</Text>
          </View>
          <Text style={styles.introText}>{topic.content.introduction}</Text>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target color={Colors.accent} size={18} />
            <Text style={styles.sectionTitle}>Kurallar</Text>
          </View>
          {topic.content.rules.map((rule, i) => (
            <View key={i} style={styles.ruleCard}>
              <View style={styles.ruleFormulaWrap}>
                <Text style={styles.ruleFormula}>{rule.formula}</Text>
              </View>
              <Text style={styles.ruleExplanation}>{rule.explanation}</Text>
            </View>
          ))}
        </View>

        {/* Examples */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lightbulb color="#F59E0B" size={18} />
            <Text style={styles.sectionTitle}>Örnekler</Text>
          </View>
          {topic.content.examples.map((ex, i) => (
            <View key={i} style={styles.exampleCard}>
              <Text style={styles.exEnglish}>🇬🇧 {ex.english}</Text>
              <Text style={styles.exTurkish}>🇹🇷 {ex.turkish}</Text>
            </View>
          ))}
        </View>

        {/* YDS Patterns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle color="#EF4444" size={18} />
            <Text style={styles.sectionTitle}>YDS'de Çıkış Şekilleri</Text>
          </View>
          {topic.content.ydsPatterns.map((pattern, i) => (
            <View key={i} style={styles.patternItem}>
              <View style={styles.patternDot} />
              <Text style={styles.patternText}>{pattern}</Text>
            </View>
          ))}
        </View>

        {/* Common Mistakes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <XCircle color={Colors.error} size={18} />
            <Text style={styles.sectionTitle}>Sık Yapılan Hatalar</Text>
          </View>
          {topic.content.commonMistakes.map((mistake, i) => (
            <View key={i} style={styles.mistakeItem}>
              <XCircle color={Colors.error} size={14} />
              <Text style={styles.mistakeText}>{mistake}</Text>
            </View>
          ))}
        </View>

        {/* Quick Tip */}
        <View style={styles.tipCard}>
          <LinearGradient
            colors={[Colors.accent + '15', Colors.accentLight + '08']}
            style={styles.tipGradient}
          >
            <Lightbulb color={Colors.accent} size={20} />
            <View style={styles.tipContent}>
              <Text style={styles.tipLabel}>Hızlı İpucu</Text>
              <Text style={styles.tipText}>{topic.content.quickTip}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.markReadBtn]}
            onPress={handleMarkAsRead}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={read ? [Colors.success, '#34D399'] : [Colors.accent, Colors.accentLight]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <CheckCircle color={read ? '#FFFFFF' : Colors.primary} size={20} />
              <Text style={[styles.actionText, { color: read ? '#FFFFFF' : Colors.primary }]}>
                {read ? 'Tekrar Okundu ✓' : 'Okundu İşaretle'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {topic.relatedQuestionIds.length > 0 && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.practiceBtn]}
              onPress={handlePractice}
              activeOpacity={0.8}
            >
              <View style={styles.practiceBtnInner}>
                <Play color={Colors.examAccent} size={20} />
                <Text style={styles.practiceText}>
                  Pratik Yap ({topic.relatedQuestionIds.length} soru)
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorLink: {
    fontSize: 15,
    color: Colors.accent,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 12,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  ruleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  ruleFormulaWrap: {
    backgroundColor: Colors.primaryDark + '08',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  ruleFormula: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  ruleExplanation: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  exampleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 6,
  },
  exEnglish: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    lineHeight: 22,
  },
  exTurkish: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
  },
  patternDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
    marginTop: 7,
  },
  patternText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    backgroundColor: Colors.error + '08',
    borderRadius: 10,
    padding: 12,
  },
  mistakeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.text,
  },
  tipCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tipGradient: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.accent + '20',
  },
  tipContent: {
    flex: 1,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
  },
  actions: {
    gap: 12,
  },
  actionBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  markReadBtn: {},
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  practiceBtn: {},
  practiceBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.examAccent + '30',
    borderRadius: 14,
    backgroundColor: Colors.examAccent + '08',
  },
  practiceText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.examAccent,
  },
});
