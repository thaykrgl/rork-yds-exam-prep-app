import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  style?: ViewStyle;
}

export default function ProgressBar({
  progress,
  height = 6,
  color = Colors.accent,
  backgroundColor = Colors.border,
  animated = false,
  style,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: Math.min(Math.max(progress, 0), 1),
        duration: 1200,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, animated]);

  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { height, backgroundColor, borderRadius: height / 2 }, style]}>
      {animated ? (
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: color,
              borderRadius: height / 2,
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: color,
              borderRadius: height / 2,
              width: `${clampedProgress * 100}%`,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
