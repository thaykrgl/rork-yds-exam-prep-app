import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Target, Trophy, ChevronRight, Check } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { useSettingsStore } from '@/stores/settingsStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'YDS Sınavına\nEn İyi Şekilde Hazırlan',
    description: 'Binlerce soru, güncel gramer konuları ve gerçek sınav simülasyonları ile hedefine ulaş.',
    icon: BookOpen,
    colors: ['#4F46E5', '#312E81'] as const,
  },
  {
    id: '2',
    title: 'Akıllı Takip ve\nAnaliz Sistemi',
    description: 'Zayıf olduğun konuları belirle, gelişimini detaylı grafiklerle takip et ve eksiklerini kapat.',
    icon: Target,
    colors: ['#0891B2', '#164E63'] as const,
  },
  {
    id: '3',
    title: 'Başarıya\nBir Adım Daha Yaklaş',
    description: 'Kelime hazineni geliştir, rozetler kazan ve çalışma disiplini oluştur.',
    icon: Trophy,
    colors: ['#D97706', '#78350F'] as const,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const setHasSeenOnboarding = useSettingsStore(s => s.setHasSeenOnboarding);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      setHasSeenOnboarding(true);
      router.replace('/(tabs)/(home)');
    }
  };

  const skip = () => {
    setHasSeenOnboarding(true);
    router.replace('/(tabs)/(home)');
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => {
    const Icon = item.icon;
    return (
      <View style={styles.slide}>
        <LinearGradient colors={item.colors} style={styles.iconContainer}>
          <Icon size={120} color="#FFFFFF" strokeWidth={1.5} />
        </LinearGradient>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {SLIDES.map((_, i) => {
          const width = scrollX.interpolate({
            inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width, opacity, backgroundColor: colors.accent }]}
            />
          );
        })}
      </View>

      {/* Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity onPress={skip} style={styles.skipButton}>
          <Text style={styles.skipText}>Atla</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={[colors.accent, colors.accentLight]}
            style={styles.nextGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {currentIndex === SLIDES.length - 1 ? (
              <>
                <Text style={styles.nextText}>Başla</Text>
                <Check size={20} color={colors.primary} strokeWidth={2.5} />
              </>
            ) : (
              <>
                <Text style={styles.nextText}>Devam Et</Text>
                <ChevronRight size={20} color={colors.primary} strokeWidth={2.5} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.15,
  },
  iconContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  textContainer: {
    marginTop: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.22,
    width: '100%',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  nextButton: {
    width: 140,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  nextGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
  },
});
