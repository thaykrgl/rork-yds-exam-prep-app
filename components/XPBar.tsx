import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { calculateLevel } from '@/utils/xpSystem';

interface XPBarProps {
  xp: number;
}

export default function XPBar({ xp }: XPBarProps) {
  const { level, xpInCurrentLevel, xpForNextLevel, progressPercent } = calculateLevel(xp);

  return (
    <View style={styles.container}>
      <View style={styles.levelBadge}>
        <Zap size={14} color={Colors.accent} />
        <Text style={styles.levelText}>Seviye {level}</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${Math.min(progressPercent * 100, 100)}%` }]} />
      </View>
      <Text style={styles.xpText}>{xpInCurrentLevel}/{xpForNextLevel} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  xpText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});
