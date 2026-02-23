import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, FlatList, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, RotateCcw, Star, Sparkles, Gamepad2, Search, Moon, Sun } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Lock, Crown } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useThemeStore } from '@/stores/themeStore';
import { useStudy } from '@/providers/StudyProvider';
import { usePremiumStore } from '@/stores/premiumStore';
import PaywallScreen from '@/components/PaywallScreen';
import { VocabularyCard } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

type FilterType = 'all' | 'learning' | 'mastered';
type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

const FREE_CARD_LIMIT = 20;

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function VocabularyScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { mode, toggleTheme } = useThemeStore();
  const router = useRouter();
  const params = useLocalSearchParams<{ initialFilter?: FilterType }>();
  const { vocabCards, toggleMastered } = useStudy();
  const isPremium = usePremiumStore(s => s.tier === 'premium');
  const [filter, setFilter] = useState<FilterType>(params.initialFilter || 'all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [showPaywall, setShowPaywall] = useState(false);

  // Sync filter when parameters change (handle navigation from other screens)
  React.useEffect(() => {
    if (params.initialFilter) {
      setFilter(params.initialFilter);
    }
  }, [params.initialFilter]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const filteredCards = useMemo(() => vocabCards.filter(card => {
    if (filter === 'learning' && card.mastered) return false;
    if (filter === 'mastered' && !card.mastered) return false;
    if (levelFilter !== 'all' && card.level !== levelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return card.word.toLowerCase().includes(q) || card.meaning.toLowerCase().includes(q);
    }
    return true;
  }), [vocabCards, filter, levelFilter, searchQuery]);

  const masteredCount = vocabCards.filter(c => c.mastered).length;

  // Word of the Day
  const wordOfTheDay = useMemo(() => {
    if (vocabCards.length === 0) return null;
    const dayIndex = getDayOfYear() % vocabCards.length;
    return vocabCards[dayIndex];
  }, [vocabCards]);

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
    const isExpanded = flippedCards.has(item.id);
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
            <View style={styles.cardRow}>
              <Lock size={18} color={colors.locked} />
              <Text style={styles.lockedText}>Premium ile Aç</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => handleFlip(item.id)}
        testID={`vocab-card-${item.id}`}
      >
        <View style={[styles.cardInner, item.mastered && styles.cardMastered]}>
          {/* Compact Row: Word + Meaning */}
          <View style={styles.cardRow}>
            <View style={styles.cardMainInfo}>
              <View style={styles.cardWordRow}>
                <Text style={styles.wordText} numberOfLines={1}>{item.word}</Text>
                <View style={[styles.levelDot, { backgroundColor: getLevelColor(item.level) }]} />
                {item.mastered && <Star color={colors.accent} size={14} fill={colors.accent} />}
              </View>
              <Text style={styles.meaningText} numberOfLines={1}>{item.meaning}</Text>
            </View>
          </View>

          {/* Expanded: Example + Master Button */}
          {isExpanded && (
            <View style={styles.cardExpanded}>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleText}>"{item.example}"</Text>
              </View>
              <View style={styles.cardExpandedRow}>
                <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) + '20' }]}>
                  <Text style={[styles.levelText, { color: getLevelColor(item.level) }]}>{getLevelLabel(item.level)}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.masterButton, item.mastered && styles.masterButtonActive]}
                  onPress={() => handleToggleMastered(item.id)}
                  activeOpacity={0.7}
                >
                  {item.mastered ? (
                    <>
                      <RotateCcw color={colors.textSecondary} size={14} />
                      <Text style={styles.masterButtonTextInactive}>Tekrar öğren</Text>
                    </>
                  ) : (
                    <>
                      <Check color="#FFFFFF" size={14} />
                      <Text style={styles.masterButtonText}>Öğrendim</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [flippedCards, handleFlip, handleToggleMastered, isPremium, colors, styles]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Kelime Kartları</Text>
            <Text style={styles.headerSubtitle}>{masteredCount}/{vocabCards.length} kelime öğrenildi</Text>
          </View>
          <TouchableOpacity
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {mode === 'dark' ? <Sun size={20} color="#FFFFFF" /> : <Moon size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${(masteredCount / (vocabCards.length || 1)) * 100}%`, backgroundColor: colors.accent }]} />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={16} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kelime veya anlam ara..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
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

      {/* Level Filters */}
      <View style={styles.levelFilterRow}>
        {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map(l => (
          <TouchableOpacity
            key={l}
            style={[styles.levelChip, levelFilter === l && { backgroundColor: l === 'all' ? colors.primary : getLevelColor(l), borderColor: l === 'all' ? colors.primary : getLevelColor(l) }]}
            onPress={() => setLevelFilter(l)}
            activeOpacity={0.7}
          >
            <Text style={[styles.levelChipText, levelFilter === l && styles.levelChipTextActive]}>
              {l === 'all' ? 'Hepsi' : l === 'beginner' ? 'Başlangıç' : l === 'intermediate' ? 'Orta' : 'İleri'}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.cardCount}>{filteredCards.length} kelime</Text>
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
          ListHeaderComponent={
            <>
              {/* Word of the Day */}
              {wordOfTheDay && filter === 'all' && (
                <TouchableOpacity
                  style={styles.wotdCard}
                  activeOpacity={0.9}
                  onPress={() => handleFlip(wordOfTheDay.id)}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryLight]}
                    style={styles.wotdGradient}
                  >
                    <View style={styles.wotdHeader}>
                      <Sparkles size={16} color="#FFFFFF" />
                      <Text style={styles.wotdLabel}>Günün Kelimesi</Text>
                    </View>
                    <Text style={styles.wotdWord}>{wordOfTheDay.word}</Text>
                    <Text style={styles.wotdMeaning}>{wordOfTheDay.meaning}</Text>
                    <View style={styles.wotdExampleBox}>
                      <Text style={styles.wotdExample}>"{wordOfTheDay.example}"</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Word Match Game Button */}
              {filter === 'all' && (
                <TouchableOpacity
                  style={styles.gameCard}
                  activeOpacity={0.7}
                  onPress={() => router.push('/word-match' as any)}
                >
                  <View style={[styles.gameIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Gamepad2 size={22} color={colors.primary} />
                  </View>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameTitle}>Kelime Eşleştirme</Text>
                    <Text style={styles.gameSub}>Kelime-anlam eşleştirerek öğren</Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          }
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
    color: colors.headerSubtitle,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
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
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  levelFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
    gap: 6,
  },
  levelChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelChipText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  levelChipTextActive: {
    color: '#FFFFFF',
  },
  cardCount: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textLight,
    marginLeft: 'auto',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 6,
  },
  cardInner: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryLight,
  },
  cardMastered: {
    borderLeftColor: colors.accent,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMainInfo: {
    flex: 1,
  },
  cardWordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardExpanded: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardExpandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  meaningText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  exampleBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
    lineHeight: 18,
  },
  masterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.success,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  masterButtonActive: {
    backgroundColor: colors.surfaceAlt,
  },
  masterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 12,
  },
  masterButtonTextInactive: {
    color: colors.textSecondary,
    fontWeight: '600' as const,
    fontSize: 12,
  },
  cardLocked: {
    borderLeftColor: colors.locked,
    backgroundColor: colors.surfaceAlt,
  },
  lockedText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.locked,
    marginLeft: 8,
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
  // Word of the Day
  wotdCard: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  wotdGradient: {
    padding: 18,
    borderRadius: 16,
  },
  wotdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  wotdLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  wotdWord: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  wotdMeaning: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  wotdExampleBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: 10,
  },
  wotdExample: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic' as const,
    lineHeight: 19,
  },
  // Game Card
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  gameIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  gameSub: {
    fontSize: 12,
    color: colors.textSecondary,
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
