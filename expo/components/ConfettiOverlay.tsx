import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, Dimensions, StyleSheet, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_COLORS = ['#D4A843', '#34C759', '#6366F1', '#FF9500', '#FF3B30', '#E8C76B', '#AF52DE'];

interface ConfettiOverlayProps {
  visible: boolean;
  particleCount?: number;
  duration?: number;
  colors?: string[];
  onComplete?: () => void;
}

interface ParticleConfig {
  startX: number;
  startY: number;
  color: string;
  size: number;
  isCircle: boolean;
  targetRotation: number;
  horizontalDrift: number;
  duration: number;
}

function generateParticles(count: number, colors: string[]): ParticleConfig[] {
  const particles: ParticleConfig[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      startX: Math.random() * SCREEN_WIDTH,
      startY: -(Math.random() * 60 + 10),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 6,
      isCircle: Math.random() > 0.5,
      targetRotation: Math.random() * 720,
      horizontalDrift: (Math.random() - 0.5) * 120,
      duration: 1200 + Math.random() * 600,
    });
  }
  return particles;
}

export default function ConfettiOverlay({
  visible,
  particleCount = 35,
  duration = 1500,
  colors = DEFAULT_COLORS,
  onComplete,
}: ConfettiOverlayProps) {
  const prevVisible = useRef(false);
  const animValues = useRef<Animated.Value[]>([]);
  const particles = useMemo(() => generateParticles(particleCount, colors), [particleCount, colors]);

  // Initialize animated values
  if (animValues.current.length !== particleCount) {
    animValues.current = Array.from({ length: particleCount }, () => new Animated.Value(0));
  }

  useEffect(() => {
    if (visible && !prevVisible.current) {
      // Reset all values
      animValues.current.forEach(v => v.setValue(0));

      // Staggered animation
      const animations = animValues.current.map((val, i) =>
        Animated.timing(val, {
          toValue: 1,
          duration: particles[i].duration,
          easing: Easing.quad,
          useNativeDriver: true,
        })
      );

      Animated.stagger(30, animations).start(() => {
        onComplete?.();
      });
    }

    prevVisible.current = visible;

    return () => {
      if (!visible) {
        animValues.current.forEach(v => v.stopAnimation());
      }
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => {
        const anim = animValues.current[i];
        if (!anim) return null;

        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [p.startY, SCREEN_HEIGHT + 50],
        });

        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [p.startX, p.startX + p.horizontalDrift],
        });

        const rotate = anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.targetRotation}deg`],
        });

        const opacity = anim.interpolate({
          inputRange: [0, 0.1, 0.75, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: p.isCircle ? p.size / 2 : 2,
              backgroundColor: p.color,
              transform: [{ translateX }, { translateY }, { rotate }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});
