import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.headerTitle}>Gizlilik Politikası</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Son güncelleme: 3 Mart 2026</Text>

        <Text style={styles.sectionTitle}>1. Giriş</Text>
        <Text style={styles.paragraph}>
          YDS Pro 2026 ("Uygulama") olarak gizliliğinize önem veriyoruz. Bu Gizlilik Politikası, uygulamamızı kullanırken bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
        </Text>

        <Text style={styles.sectionTitle}>2. Toplanan Veriler</Text>
        <Text style={styles.subTitle}>2.1 Cihazınızda Saklanan Veriler</Text>
        <Text style={styles.paragraph}>
          Uygulama, çalışma istatistiklerinizi (çözülen soru sayısı, doğruluk oranı, çalışma süresi, günlük seri), kelime kartı ilerlemenizi, sınav geçmişinizi, rozet ve başarı durumunuzu ve uygulama ayarlarınızı (tema tercihi, bildirim ayarları, günlük hedef) yalnızca cihazınızda (AsyncStorage) saklar. Bu veriler sunucularımıza gönderilmez.
        </Text>

        <Text style={styles.subTitle}>2.2 Satın Alma Bilgileri</Text>
        <Text style={styles.paragraph}>
          Premium satın alma işlemleri Apple App Store üzerinden gerçekleştirilir ve RevenueCat altyapısı aracılığıyla yönetilir. Satın alma durumunuz (premium/ücretsiz) doğrulama amacıyla RevenueCat sunucularında işlenir. Ödeme bilgileriniz (kredi kartı vb.) tarafımızca toplanmaz veya saklanmaz; bu bilgiler yalnızca Apple tarafından işlenir.
        </Text>

        <Text style={styles.subTitle}>2.3 Bildirimler</Text>
        <Text style={styles.paragraph}>
          Bildirim izni vermeniz halinde, çalışma hatırlatıcıları ve günün kelimesi gibi yerel bildirimler gönderilir. Bu bildirimler tamamen cihazınızda planlanır ve herhangi bir sunucuya veri iletilmez.
        </Text>

        <Text style={styles.sectionTitle}>3. Verilerin Kullanım Amacı</Text>
        <Text style={styles.paragraph}>
          Toplanan veriler yalnızca şu amaçlarla kullanılır:{'\n'}
          • Çalışma ilerlemenizi takip etmek ve istatistiklerinizi göstermek{'\n'}
          • Kişiselleştirilmiş çalışma deneyimi sunmak{'\n'}
          • Satın alma durumunuzu doğrulamak{'\n'}
          • İstediğiniz bildirimleri zamanında göndermek
        </Text>

        <Text style={styles.sectionTitle}>4. Üçüncü Taraf Hizmetler</Text>
        <Text style={styles.paragraph}>
          Uygulama aşağıdaki üçüncü taraf hizmetlerini kullanmaktadır:{'\n'}
          • <Text style={styles.bold}>RevenueCat:</Text> Uygulama içi satın alma yönetimi. RevenueCat'in gizlilik politikası için: revenuecat.com/privacy{'\n'}
          • <Text style={styles.bold}>Apple App Store:</Text> Ödeme işlemleri ve uygulama dağıtımı.
        </Text>

        <Text style={styles.sectionTitle}>5. Veri Güvenliği</Text>
        <Text style={styles.paragraph}>
          Verileriniz cihazınızda yerel olarak saklandığından, cihazınızın güvenlik önlemleri (şifre, Face ID, Touch ID) ile korunmaktadır. Uygulamayı sildiğinizde tüm yerel verileriniz kalıcı olarak silinir.
        </Text>

        <Text style={styles.sectionTitle}>6. Çocukların Gizliliği</Text>
        <Text style={styles.paragraph}>
          Uygulamamız 13 yaşın altındaki çocuklara yönelik değildir ve bu yaş grubundan bilerek kişisel veri toplamaz.
        </Text>

        <Text style={styles.sectionTitle}>7. Haklarınız</Text>
        <Text style={styles.paragraph}>
          Cihazınızda saklanan tüm verilerinizi uygulama ayarlarından kontrol edebilirsiniz. Uygulamayı silmek, tüm yerel verilerinizi kalıcı olarak kaldıracaktır. Satın alma geçmişiniz Apple hesabınız üzerinden yönetilmektedir.
        </Text>

        <Text style={styles.sectionTitle}>8. Değişiklikler</Text>
        <Text style={styles.paragraph}>
          Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler uygulama içi bildirim ile duyurulacaktır.
        </Text>

        <Text style={styles.sectionTitle}>9. İletişim</Text>
        <Text style={styles.paragraph}>
          Gizlilik politikamız hakkında sorularınız için ydspro2026@gmail.com adresinden bize ulaşabilirsiniz.
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
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 6,
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
