import { useRef, useState, useCallback } from 'react';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

export function useAnswerFeedback() {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [flashColor, setFlashColor] = useState('#34C759');
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerFeedback = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      // Green flash
      setFlashColor('#34C759');
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 0.3, duration: 150, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      // Confetti
      setShowConfetti(true);

      // Rich haptic: double tap
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 150);
    } else {
      // Red flash
      setFlashColor('#FF3B30');
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 0.25, duration: 100, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();

      // Shake
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 35, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 35, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 30, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
      ]).start();

      // Rich haptic: error + heavy
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);
    }
  }, [flashOpacity, shakeAnim]);

  const dismissConfetti = useCallback(() => {
    setShowConfetti(false);
  }, []);

  return {
    shakeAnim,
    flashOpacity,
    flashColor,
    showConfetti,
    triggerFeedback,
    dismissConfetti,
  };
}
