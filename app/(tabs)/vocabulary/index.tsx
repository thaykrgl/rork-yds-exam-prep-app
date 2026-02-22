import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, RotateCcw, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Lock, Crown } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { useStudy } from '@/providers/StudyProvider';
import { usePremiumStore } from '@/stores/premiumStore';
import PaywallScreen from '@/components/PaywallScreen';
import { VocabularyCard } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

type FilterType = 'all' | 'learning' | 'mastered';

const FREE_CARD_LIMIT = 20;

export default function VocabularyScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { vocabCards, toggleMastered } = useStudy();
  const { isPremium } = usePremiumStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [showPaywall, setShowPaywall] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const filteredCards = vocabCards.filter(card => {
    if (filter === 'learning') return !card.mastered;
    if (filter === 'mastered') return card.mastered;
    return true;
  });

  const masteredCount = vocabCards.filter(c => c.mastered).length;

  const handleFlip = useCallback((cardId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  const handleToggleMastered = useCallback((cardId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleMastered(cardId);
  }, [toggleMastered]);

  const renderCard = useCallback(({ item, index }: { item: VocabularyCard; index: number }) => {
    const isFlipped = flippedCards.has(item.id);
    const isLocked = !isPremium && index >= FREE_CARD_LIMIT;

    if (isLocked) {
      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => setShowPaywall(true)}
          testID={`vocab-card-locked-${item.id}`}
        >
          <View style={[styles.cardInner, styles.cardLocked]}>
            <View style={styles.cardFront}>
              <Lock size={28} color={colors.locked} />
              <Text style={styles.lockedText}>Premium ile Aç</Text>
              <Text style={styles.lockedHint}>Bu karta erişmek için premium'a geç</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => handleFlip(item.id)}
        testID={`vocab-card-${item.id}`}
      >
        <View style={[styles.cardInner, item.mastered && styles.cardMastered]}>
          {!isFlipped ? (
            <View style={styles.cardFront}>
              <View style={styles.cardTopRow}>
                <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) + '20' }]}>
                  <Text style={[styles.levelText, { color: getLevelColor(item.level) }]}>{getLevelLabel(item.level)}</Text>
                </View>
                {item.mastered && <Star color={colors.accent} size={18} fill={colors.accent} />}
              </View>
              <Text style={styles.wordText}>{item.word}</Text>
              <Text style={styles.flipHint}>Çevirmek için dokun</Text>
            </View>
          ) : (
            <View style={styles.cardBack}>
              <Text style={styles.meaningText}>{item.meaning}</Text>
              <div style={{ flex: 1 }} />
              <View style={styles.exampleBox}>
                <Text style={styles.exampleText}>"{item.example}"</Text>
              </View>
              <TouchableOpacity
                style={[styles.masterButton, item.mastered && styles.masterButtonActive]}
                onPress={() => handleToggleMastered(item.id)}
                activeOpacity={0.7}
              >
                {item.mastered ? (
                  <>
                    <RotateCcw color={colors.textSecondary} size={16} />
                    <Text style={styles.masterButtonTextInactive}>Tekrar öğren</Text>
                  </>
                ) : (
                  <>
                    <Check color="#FFFFFF" size={16} />
                    <Text style={styles.masterButtonText}>Öğrendim</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [flippedCards, handleFlip, handleToggleMastered, isPremium, colors, styles]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Kelime Kartları</Text>
        <Text style={styles.headerSubtitle}>{masteredCount}/{vocabCards.length} kelime öğrenildi</Text>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${(masteredCount / (vocabCards.length || 1)) * 100}%`, backgroundColor: colors.accent }]} />
        </View>
      </LinearGradient>

      <View style={styles.filterRow}>
        {(['all', 'learning', 'mastered'] as FilterType[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Tümü' : f === 'learning' ? 'Öğreniliyor' : 'Öğrenildi'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Premium Banner for free users */}
      {!isPremium && vocabCards.length > FREE_CARD_LIMIT && (
        <TouchableOpacity style={styles.premiumBanner} activeOpacity={0.7} onPress={() => setShowPaywall(true)}>
          <Crown size={16} color={colors.accent} />
          <Text style={styles.premiumBannerText}>
            İlk {FREE_CARD_LIMIT} kart ücretsiz · Premium ile tümüne eriş
          </Text>
        </TouchableOpacity>
      )}

      {filteredCards.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>
            {filter === 'mastered' ? 'Henüz öğrenilmiş kelime yok' : 'Tüm kelimeler öğrenildi!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCards}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <PaywallScreen visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </View>
  );
}

function getLevelColor(level: string): string {
  switch (level) {
    case 'beginner': return '#22C55E';
    case 'intermediate': return '#F59E0B';
    case 'advanced': return '#EF4444';
    default: return '#737373';
  }
}

function getLevelLabel(level: string): string {
  switch (level) {
    case 'beginner': return 'Başlangıç';
    case 'intermediate': return 'Orta';
    case 'advanced': return 'İleri';
    default: return level;
  }
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
    color: colors.accentSoft,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 12,
  },
  cardInner: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryLight,
  },
  cardMastered: {
    borderLeftColor: colors.accent,
  },
  cardFront: {
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  cardBack: {
    minHeight: 120,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  wordText: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  flipHint: {
    fontSize: 12,
    color: colors.textLight,
  },
  meaningText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 12,
  },
  exampleBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  exampleText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
  masterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.success,
    paddingVertical: 10,
    borderRadius: 10,
  },
  masterButtonActive: {
    backgroundColor: colors.surfaceAlt,
  },
  masterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 14,
  },
  masterButtonTextInactive: {
    color: colors.textSecondary,
    fontWeight: '600' as const,
    fontSize: 14,
  },
  cardLocked: {
    borderLeftColor: colors.locked,
    backgroundColor: colors.surfaceAlt,
  },
  lockedText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.locked,
    marginTop: 8,
  },
  lockedHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.accent + '12',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  premiumBannerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
});
