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
import Colors from '@/constants/colors';
import { Badge } from '@/types';

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

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const Icon = iconMap[badge.icon] || Award;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconCircle, { backgroundColor: badge.color + '20' }]}>
            <Icon size={48} color={badge.color} />
          </View>

          <Text style={styles.title}>Rozet Kazandın!</Text>
          <Text style={styles.badgeName}>{badge.titleTr}</Text>
          <Text style={styles.description}>{badge.description}</Text>

          <TouchableOpacity style={styles.button} onPress={onDismiss} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Harika!</Text>
          </TouchableOpacity>
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
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
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
