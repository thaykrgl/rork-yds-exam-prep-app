import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import { Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import ConfettiOverlay from '@/components/ConfettiOverlay';

interface LevelUpModalProps {
  level: number;
  visible: boolean;
  onDismiss: () => void;
}

export default function LevelUpModal({ level, visible, onDismiss }: LevelUpModalProps) {
  const colors = useColors();
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0)).current;
  const levelScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(25)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Haptic drumroll
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 150);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 450);

      Animated.sequence([
        // Overlay fade
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        // Card spring
        Animated.spring(cardScale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
        // Level number overshoot
        Animated.sequence([
          Animated.spring(levelScale, { toValue: 1.2, friction: 6, tension: 120, useNativeDriver: true }),
          Animated.timing(levelScale, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]),
        // Staggered text
        Animated.stagger(150, [
          Animated.parallel([
            Animated.timing(titleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(titleSlide, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]),
          Animated.timing(subtitleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.spring(buttonScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      overlayOpacity.setValue(0);
      cardScale.setValue(0);
      levelScale.setValue(0);
      titleOpacity.setValue(0);
      titleSlide.setValue(25);
      subtitleOpacity.setValue(0);
      buttonScale.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <ConfettiOverlay visible={visible} particleCount={50} colors={['#D4A843', '#E8C76B', '#6366F1', '#34C759', '#FF9500']} />

        <Animated.View style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}>
          <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.card}>
            {/* Icon */}
            <View style={styles.iconCircle}>
              <Zap size={32} color={colors.accent} fill={colors.accent} />
            </View>

            {/* Level number */}
            <Animated.View style={{ transform: [{ scale: levelScale }] }}>
              <Text style={styles.levelNumber}>{level}</Text>
            </Animated.View>

            {/* Title */}
            <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleSlide }] }}>
              <Text style={styles.title}>Seviye {level}!</Text>
            </Animated.View>

            {/* Subtitle */}
            <Animated.View style={{ opacity: subtitleOpacity }}>
              <Text style={styles.subtitle}>Tebrikler! Yeni seviyeye ulaştın.</Text>
            </Animated.View>

            {/* Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={onDismiss} activeOpacity={0.8}>
                <Text style={[styles.buttonText, { color: colors.primary }]}>Harika!</Text>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    width: 300,
  },
  card: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  levelNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
