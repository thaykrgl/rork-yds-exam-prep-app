import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Crown, Check, Infinity, BookOpen, Clock, BarChart3 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePremiumStore } from '@/stores/premiumStore';

interface PaywallScreenProps {
  visible: boolean;
  onClose: () => void;
}

const features = [
  { icon: Infinity, text: 'Sınırsız soru çözme' },
  { icon: Clock, text: 'Sınırsız deneme sınavı' },
  { icon: BookOpen, text: 'Tüm kelime kartları' },
  { icon: BarChart3, text: 'Detaylı analiz ve raporlar' },
];

export default function PaywallScreen({ visible, onClose }: PaywallScreenProps) {
  const { restore } = usePremiumStore();

  const handleSubscribe = (plan: string) => {
    // Stub for Phase 1 - RevenueCat integration will be added later
    console.log(`[Premium] Subscribe to ${plan} - RevenueCat not yet integrated`);
    // For testing, you can temporarily enable premium:
    // usePremiumStore.getState().setTier('premium');
    onClose();
  };

  const handleRestore = async () => {
    await restore();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={[Colors.accent + '20', Colors.accent + '05']}
            style={styles.header}
          >
            <View style={styles.crownContainer}>
              <Crown size={40} color={Colors.accent} />
            </View>
            <Text style={styles.title}>YDS Premium</Text>
            <Text style={styles.subtitle}>
              Sınava en iyi şekilde hazırlan
            </Text>
          </LinearGradient>

          {/* Features */}
          <View style={styles.featuresSection}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIconContainer}>
                  <feature.icon size={20} color={Colors.accent} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
                <Check size={18} color={Colors.success} />
              </View>
            ))}
          </View>

          {/* Comparison */}
          <View style={styles.comparisonSection}>
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>Ücretsiz</Text>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonItemText}>Günde 10 soru</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonItemText}>Günde 1 mini sınav</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonItemText}>20 kelime kartı</Text>
              </View>
            </View>

            <View style={[styles.comparisonCard, styles.comparisonCardPremium]}>
              <LinearGradient
                colors={[Colors.accent, Colors.accentLight]}
                style={styles.premiumBadge}
              >
                <Crown size={12} color={Colors.primary} />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </LinearGradient>
              <Text style={[styles.comparisonTitle, styles.comparisonTitlePremium]}>Premium</Text>
              <View style={styles.comparisonItem}>
                <Text style={[styles.comparisonItemText, styles.comparisonItemTextPremium]}>Sınırsız soru</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={[styles.comparisonItemText, styles.comparisonItemTextPremium]}>Sınırsız sınav</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={[styles.comparisonItemText, styles.comparisonItemTextPremium]}>40+ kelime kartı</Text>
              </View>
            </View>
          </View>

          {/* Plans */}
          <View style={styles.plansSection}>
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => handleSubscribe('monthly')}
            >
              <View>
                <Text style={styles.planName}>Aylık</Text>
                <Text style={styles.planPrice}>₺79.99/ay</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planCard, styles.planCardPopular]}
              onPress={() => handleSubscribe('yearly')}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>En Popüler</Text>
              </View>
              <View>
                <Text style={[styles.planName, styles.planNamePopular]}>Yıllık</Text>
                <Text style={[styles.planPrice, styles.planPricePopular]}>₺499.99/yıl</Text>
                <Text style={styles.planSaving}>%48 tasarruf</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.planCard}
              onPress={() => handleSubscribe('lifetime')}
            >
              <View>
                <Text style={styles.planName}>Ömür Boyu</Text>
                <Text style={styles.planPrice}>₺999.99</Text>
                <Text style={styles.planSaving}>Tek seferlik ödeme</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Restore */}
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreText}>Satın Alımları Geri Yükle</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Abonelik süresince otomatik olarak yenilenir. İstediğiniz zaman App Store üzerinden iptal edebilirsiniz.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  crownContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    padding: 20,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  comparisonSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  comparisonCardPremium: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '08',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  comparisonTitlePremium: {
    color: Colors.text,
  },
  comparisonItem: {
    marginBottom: 8,
  },
  comparisonItemText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  comparisonItemTextPremium: {
    color: Colors.text,
    fontWeight: '600',
  },
  plansSection: {
    paddingHorizontal: 20,
    gap: 10,
  },
  planCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  planCardPopular: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '08',
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  planNamePopular: {
    color: Colors.text,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
  planPricePopular: {
    color: Colors.accent,
  },
  planSaving: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  restoreButton: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  restoreText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
    lineHeight: 16,
  },
});
