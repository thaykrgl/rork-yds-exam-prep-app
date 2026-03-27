import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award, Star, Target, Flame, Crown, Zap, PenTool, BookOpen, Trophy, Bookmark, RefreshCw, Shield, Lock } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { Badge } from '@/types';

const iconMap: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  Target, Award, Star, Flame, Crown, Zap, PenTool, BookOpen, Trophy, Bookmark, RefreshCw, Shield,
};

interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
}

export default function BadgeCard({ badge, unlocked }: BadgeCardProps) {
  const colors = useColors();
  const Icon = iconMap[badge.icon] || Award;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, !unlocked && styles.locked]}>
      <View style={[styles.iconCircle, { backgroundColor: unlocked ? badge.color + '20' : colors.border + '40' }]}>
        {unlocked ? (
          <Icon size={24} color={badge.color} />
        ) : (
          <Lock size={18} color={colors.locked} />
        )}
      </View>
      <Text style={[styles.title, { color: colors.text }, !unlocked && { color: colors.locked }]} numberOfLines={1}>
        {badge.titleTr}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }, !unlocked && { color: colors.locked }]} numberOfLines={2}>
        {badge.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '31%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  locked: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  description: {
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 12,
  },
});
