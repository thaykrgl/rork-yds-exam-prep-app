import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';

export default function TermsOfUseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kullanım Koşulları</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Son güncelleme: 3 Mart 2026</Text>

        <Text style={styles.sectionTitle}>1. Kabul</Text>
        <Text style={styles.paragraph}>
          YDS Pro 2026 uygulamasını ("Uygulama") indirerek veya kullanarak, bu Kullanım Koşullarını kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız, lütfen uygulamayı kullanmayınız.
        </Text>

        <Text style={styles.sectionTitle}>2. Hizmet Tanımı</Text>
        <Text style={styles.paragraph}>
          YDS Pro 2026, YDS (Yabancı Dil Sınavı) hazırlık sürecinde kullanıcılara yardımcı olmak amacıyla geliştirilmiş bir eğitim uygulamasıdır. Uygulama şunları sunar:{'\n'}
          • Çoktan seçmeli soru çözme ve pratik yapma{'\n'}
          • Kelime öğrenme ve kelime kartları{'\n'}
          • Deneme sınavları{'\n'}
          • Gramer kütüphanesi{'\n'}
          • Çalışma istatistikleri ve ilerleme takibi{'\n'}
          • Günlük çalışma hatırlatıcıları
        </Text>

        <Text style={styles.sectionTitle}>3. Kullanıcı Hesabı</Text>
        <Text style={styles.paragraph}>
          Uygulama, kullanıcı kaydı veya giriş gerektirmez. Tüm verileriniz cihazınızda yerel olarak saklanır. Uygulamayı sildiğinizde verileriniz kalıcı olarak silinir.
        </Text>

        <Text style={styles.sectionTitle}>4. Premium Üyelik</Text>
        <Text style={styles.paragraph}>
          Uygulama ücretsiz sınırlı erişim ve ömür boyu premium erişim seçenekleri sunar.{'\n\n'}
          <Text style={styles.bold}>Ücretsiz kullanım:</Text> Günlük sınırlı sayıda soru çözme ve sınav hakkı.{'\n\n'}
          <Text style={styles.bold}>Premium (Ömür Boyu):</Text> Tek seferlik ödeme ile tüm içeriklere sınırsız erişim. Ödeme Apple App Store üzerinden tahsil edilir.{'\n\n'}
          Premium satın alma işlemi onaylandıktan sonra iade talepleri için Apple Destek ile iletişime geçmeniz gerekmektedir. "Satın Alımları Geri Yükle" özelliği ile daha önce yaptığınız satın almaları yeni cihazınıza aktarabilirsiniz.
        </Text>

        <Text style={styles.sectionTitle}>5. Fikri Mülkiyet</Text>
        <Text style={styles.paragraph}>
          Uygulamadaki tüm içerikler (sorular, açıklamalar, gramer konuları, kelime listeleri, tasarım ve yazılım) telif hakkı ile korunmaktadır. İçeriklerin izinsiz kopyalanması, dağıtılması veya ticari amaçla kullanılması yasaktır.
        </Text>

        <Text style={styles.sectionTitle}>6. Kullanım Kuralları</Text>
        <Text style={styles.paragraph}>
          Uygulamayı kullanırken aşağıdaki kurallara uymayı kabul edersiniz:{'\n'}
          • Uygulamayı yalnızca kişisel eğitim amaçlı kullanmak{'\n'}
          • Uygulamayı tersine mühendislik veya kaynak kodunu çözümleme girişiminde bulunmamak{'\n'}
          • Uygulamanın normal çalışmasını engelleyecek eylemlerden kaçınmak
        </Text>

        <Text style={styles.sectionTitle}>7. Sorumluluk Sınırlaması</Text>
        <Text style={styles.paragraph}>
          Uygulama "olduğu gibi" sunulmaktadır. YDS sınavında belirli bir sonuç garanti edilmemektedir. Uygulamadaki sorular ve içerikler eğitim amaçlı olup, resmi ÖSYM sınav soruları değildir. Uygulama kullanımından doğabilecek doğrudan veya dolaylı zararlardan sorumluluk kabul edilmemektedir.
        </Text>

        <Text style={styles.sectionTitle}>8. Değişiklikler</Text>
        <Text style={styles.paragraph}>
          Bu kullanım koşulları önceden haber verilmeksizin güncellenebilir. Güncellenen koşullar uygulama içinde yayınlandığı anda yürürlüğe girer. Uygulamayı kullanmaya devam etmeniz, güncellenmiş koşulları kabul ettiğiniz anlamına gelir.
        </Text>

        <Text style={styles.sectionTitle}>9. Uygulanacak Hukuk</Text>
        <Text style={styles.paragraph}>
          Bu koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Herhangi bir uyuşmazlık durumunda Türkiye mahkemeleri yetkilidir.
        </Text>

        <Text style={styles.sectionTitle}>10. İletişim</Text>
        <Text style={styles.paragraph}>
          Kullanım koşulları hakkında sorularınız için ydspro2026@gmail.com adresinden bize ulaşabilirsiniz.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bold: {
    fontWeight: '600',
    color: colors.text,
  },
});
