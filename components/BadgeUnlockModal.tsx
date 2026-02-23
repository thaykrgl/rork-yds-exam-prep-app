import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import { Award, Star, Target, Flame, Crown, Zap, PenTool, BookOpen, Trophy, Bookmark, RefreshCw, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Badge } from '@/types';
import ConfettiOverlay from '@/components/ConfettiOverlay';

const iconMap: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  Target,
  Award,
  Star,
  Flame,
  Crown,
  Zap,
  PenTool,
  BookOpen,
  Trophy,
  Bookmark,
  RefreshCw,
  Shield,
};

interface BadgeUnlockModalProps {
  badge: Badge;
  visible: boolean;
  onDismiss: () => void;
}

export default function BadgeUnlockModal({ badge, visible, onDismiss }: BadgeUnlockModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameSlide = useRef(new Animated.Value(20)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;
  const descSlide = useRef(new Animated.Value(15)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const glowLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      // Rich haptic sequence
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 400);

      // Main animation sequence
      Animated.sequence([
        // 1. Overlay fades in
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        // 2. Card springs in
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        // 3. Staggered text + button
        Animated.stagger(120, [
          Animated.parallel([
            Animated.timing(titleOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(titleSlide, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(nameOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(nameSlide, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(descOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(descSlide, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]),
          Animated.spring(buttonScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        ]),
      ]).start();

      // Glow loop
      glowLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      );
      glowLoop.current.start();
    } else {
      // Reset all
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      glowAnim.setValue(0);
      titleOpacity.setValue(0);
      titleSlide.setValue(20);
      nameOpacity.setValue(0);
      nameSlide.setValue(20);
      descOpacity.setValue(0);
      descSlide.setValue(15);
      buttonScale.setValue(0);
      glowLoop.current?.stop();
    }
  }, [visible]);

  const Icon = iconMap[badge.icon] || Award;

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.25],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <ConfettiOverlay visible={visible} particleCount={40} colors={[badge.color, '#D4A843', '#FFFFFF', '#6366F1']} />

        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          {/* Glow behind icon */}
          <View style={styles.iconWrapper}>
            <Animated.View
              style={[
                styles.glowCircle,
                {
                  backgroundColor: badge.color + '40',
                  transform: [{ scale: glowScale }],
                  opacity: glowOpacity,
                },
              ]}
            />
            <View style={[styles.iconCircle, { backgroundColor: badge.color + '20' }]}>
              <Icon size={48} color={badge.color} />
            </View>
          </View>

          {/* Staggered text */}
          <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleSlide }] }}>
            <Text style={styles.title}>Rozet Kazandın!</Text>
          </Animated.View>

          <Animated.View style={{ opacity: nameOpacity, transform: [{ translateY: nameSlide }] }}>
            <Text style={styles.badgeName}>{badge.titleTr}</Text>
          </Animated.View>

          <Animated.View style={{ opacity: descOpacity, transform: [{ translateY: descSlide }] }}>
            <Text style={styles.description}>{badge.description}</Text>
          </Animated.View>

          {/* Button pop-in */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity style={styles.button} onPress={onDismiss} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Harika!</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    width: 300,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});
