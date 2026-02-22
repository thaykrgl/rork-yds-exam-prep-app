import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Colors from '@/constants/colors';

interface TimerProps {
  totalSeconds: number;
  onExpire: () => void;
  onTick?: (secondsRemaining: number) => void;
  isPaused?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Timer({
  totalSeconds,
  onExpire,
  onTick,
  isPaused = false,
  style,
  textStyle,
}: TimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onExpireRef.current = onExpire;
    onTickRef.current = onTick;
  }, [onExpire, onTick]);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        const next = prev - 1;
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onExpireRef.current();
          return 0;
        }
        onTickRef.current?.(next);
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const isUrgent = secondsRemaining <= 60;

  return (
    <View style={[styles.container, isUrgent && styles.urgentContainer, style]}>
      <Text style={[styles.text, isUrgent && styles.urgentText, textStyle]}>
        {formatTime(secondsRemaining)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  urgentContainer: {
    backgroundColor: Colors.error + '15',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  urgentText: {
    color: Colors.error,
  },
});
