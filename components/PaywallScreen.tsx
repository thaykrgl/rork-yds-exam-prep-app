import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, Crown, Check, Infinity, BookOpen, Clock,
  BarChart3, Shield, Sparkles,
} from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { usePremiumStore } from '@/stores/premiumStore';

interface PaywallScreenProps {
  visible: boolean;
  onClose: () => void;
}

const features = [
  { icon: Infinity, text: 'Sınırsız soru çözme', sub: 'Günlük limit yok' },
  { icon: Clock, text: 'Sınırsız deneme sınavı', sub: 'İstediğin kadar pratik' },
  { icon: BookOpen, text: 'Tüm kelime kartları', sub: '40+ kelime kartına erişim' },
  { icon: BarChart3, text: 'Detaylı analiz ve raporlar', sub: 'İlerleme takibi' },
];

export default function PaywallScreen({ visible, onClose }: PaywallScreenProps) {
  const colors = useColors();
  const { purchaseLifetime, restore, isPurchasing, isRestoring, lifetimePrice } = usePremiumStore();
  const [error, setError] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePurchase = async () => {
    setError(null);
    try {
      const success = await purchaseLifetime();
      if (success) {
        onClose();
      }
    } catch (e: any) {
      setError('Satın alma işlemi başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  const handleRestore = async () => {
    setError(null);
    try {
      const restored = await restore();
      if (restored) {
        Alert.alert('Başarılı', 'Premium üyeliğiniz geri yüklendi!');
        onClose();
      } else {
        Alert.alert('Bilgi', 'Geri yüklenecek bir satın alma bulunamadı.');
      }
    } catch (e: any) {
      setError('Geri yükleme başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  const isLoading = isPurchasing || isRestoring;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          disabled={isLoading}
        >
          <X size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={[colors.accent + '20', colors.accent + '05']}
            style={styles.header}
          >
            <View style={[styles.crownContainer, { backgroundColor: colors.accent + '20' }]}>
              <Crown size={40} color={colors.accent} />
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
                <View style={[styles.featureIconContainer, { backgroundColor: colors.accent + '15' }]}>
                  <feature.icon size={20} color={colors.accent} />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureText}>{feature.text}</Text>
                  <Text style={styles.featureSub}>{feature.sub}</Text>
                </View>
                <Check size={18} color={colors.success} />
              </View>
            ))}
          </View>

          {/* Comparison */}
          <View style={styles.comparisonSection}>
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>Ücretsiz</Text>
              <View style={styles.comparisonItem}>
                <X size={14} color={colors.error} />
                <Text style={styles.comparisonItemText}>Günde 10 soru</Text>
              </View>
              <View style={styles.comparisonItem}>
                <X size={14} color={colors.error} />
                <Text style={styles.comparisonItemText}>Günde 1 sınav</Text>
              </View>
              <View style={styles.comparisonItem}>
                <X size={14} color={colors.error} />
                <Text style={styles.comparisonItemText}>Sınırlı kelime kartı</Text>
              </View>
            </View>

            <View style={[styles.comparisonCard, styles.comparisonCardPremium]}>
              <LinearGradient
                colors={[colors.accent, colors.accentLight]}
                style={styles.premiumBadge}
              >
                <Crown size={12} color={colors.primary} />
                <Text style={[styles.premiumBadgeText, { color: colors.primary }]}>PREMIUM</Text>
              </LinearGradient>
              <Text style={[styles.comparisonTitle, styles.comparisonTitlePremium]}>Premium</Text>
              <View style={styles.comparisonItem}>
                <Check size={14} color={colors.success} />
                <Text style={[styles.comparisonItemText, styles.comparisonItemTextPremium]}>
                  Sınırsız soru
                </Text>
              </View>
              <View style={styles.comparisonItem}>
                <Check size={14} color={colors.success} />
                <Text style={[styles.comparisonItemText, styles.comparisonItemTextPremium]}>
                  Sınırsız sınav
                </Text>
              </View>
              <View style={styles.comparisonItem}>
                <Check size={14} color={colors.success} />
                <Text style={[styles.comparisonItemText, styles.comparisonItemTextPremium]}>
                  40+ kelime kartı
                </Text>
              </View>
            </View>
          </View>

          {/* Lifetime Plan */}
          <View style={styles.planSection}>
            <TouchableOpacity
              style={styles.lifetimeCard}
              onPress={handlePurchase}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.accent, colors.accentLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.lifetimeGradient}
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <View style={styles.lifetimeHeader}>
                      <Sparkles size={20} color={colors.primary} />
                      <Text style={[styles.lifetimeLabel, { color: colors.primary }]}>
                        Ömür Boyu Erişim
                      </Text>
                    </View>
                    <Text style={[styles.lifetimePrice, { color: colors.primary }]}>
                      {lifetimePrice}
                    </Text>
                    <Text style={[styles.lifetimeSub, { color: colors.primary + 'BB' }]}>
                      Tek seferlik ödeme · Sonsuza kadar erişim
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.guaranteeRow}>
              <Shield size={14} color={colors.success} />
              <Text style={styles.guaranteeText}>
                Abonelik yok · Gizli ücret yok · Anında erişim
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Restore */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isLoading}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <Text style={styles.restoreText}>Satın Alımları Geri Yükle</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Ödeme, Apple ID hesabınızdan tahsil edilir. Satın alma işlemi onaylandıktan
            sonra iade için Apple Destek ile iletişime geçebilirsiniz.
          </Text>

          <View style={styles.legalLinksContainer}>
            <TouchableOpacity onPress={() => Linking.openURL('https://rork.app/pp/f5knzwux7ixo05y4m962d')}>
              <Text style={styles.legalLink}>Gizlilik Politikası</Text>
            </TouchableOpacity>
            <Text style={styles.legalLinksDivider}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://rork.app/terms/f5knzwux7ixo05y4m962d')}>
              <Text style={styles.legalLink}>Kullanım Koşulları</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    padding: 20,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  featureSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  comparisonSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  comparisonCardPremium: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '08',
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
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  comparisonTitlePremium: {
    color: colors.text,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  comparisonItemText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  comparisonItemTextPremium: {
    color: colors.text,
    fontWeight: '600',
  },
  planSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  lifetimeCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  lifetimeGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  lifetimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  lifetimeLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  lifetimePrice: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 4,
  },
  lifetimeSub: {
    fontSize: 14,
    fontWeight: '500',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  guaranteeText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '500',
  },
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.error + '15',
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  restoreButton: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  restoreText: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
    lineHeight: 16,
  },
  legalLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  legalLink: {
    fontSize: 12,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  legalLinksDivider: {
    color: colors.textLight,
    fontSize: 12,
  },
});
