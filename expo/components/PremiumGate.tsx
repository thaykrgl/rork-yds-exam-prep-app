import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePremiumStore } from '@/stores/premiumStore';

interface PremiumGateProps {
  feature: 'unlimited_questions' | 'exam_mode' | 'unlimited_vocab';
  children: React.ReactNode;
  onUpgrade: () => void;
}

const featureMessages = {
  unlimited_questions: 'Sınırsız soru çözmek için Premium\'a geçin',
  exam_mode: 'Deneme sınavlarına erişmek için Premium\'a geçin',
  unlimited_vocab: 'Tüm kelimeleri görmek için Premium\'a geçin',
};

export default function PremiumGate({ feature, children, onUpgrade }: PremiumGateProps) {
  const tier = usePremiumStore(s => s.tier);

  if (tier === 'premium') {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.lockCircle}>
          <Lock size={28} color={Colors.accent} />
        </View>
        <Text style={styles.message}>{featureMessages[feature]}</Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade} activeOpacity={0.8}>
          <Text style={styles.upgradeButtonText}>Premium'a Geç</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
  },
  overlay: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '08',
  },
  lockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  upgradeButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
