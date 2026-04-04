import { Link, Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from 'react-native';
import { AppScreen, HeaderScreen } from '../src/components/common';
import { COLORS } from '../src/constants/colors';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

export default function NotFoundScreen() {
  const router = useRouter();
  const mode = useSelector((state) => state.themes)?.value || 'light';

  const commonSolutions = [
    { title: 'Periksa URL', description: 'Pastikan tidak ada kesalahan ketik di address bar' },
    { title: 'Gunakan Pencarian', description: 'Coba cari apa yang Anda butuhkan' },
    { title: 'Kembali', description: 'Kembali ke halaman sebelumnya' },
    { title: 'Kunjungi Beranda', description: 'Mulai dari halaman utama aplikasi' }
  ];

  // Theme-based colors
  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const cardColor = mode === 'dark' ? '#1f2937' : '#ffffff';
  const cardBorder = mode === 'dark' ? '#2f3247' : '#e5e7eb';
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';

  return (
    <AppScreen>
      <HeaderScreen 
          title="Fitur Belum Tersedia" 
          onThemes={true}
          onNotification={true}
      />
      <ScrollView contentContainerStyle={[
        styles.scrollContent,
        { backgroundColor }
      ]}>
        {/* Illustration Section */}
        <View style={styles.illustrationContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.errorCode}>404</Text>
          <Text style={[styles.errorTitle, { color: textColor }]}>Ups! Halaman Tidak Ditemukan</Text>
          <Text style={[styles.errorDescription, { color: subtitleColor }]}>
            Halaman yang Anda cari mungkin telah dihapus, berubah nama, atau tidak tersedia untuk sementara.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonEmoji}>🏠</Text>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.primaryButtonText}>Ke Beranda</Text>
                  <Text style={styles.buttonSubtextPrimary}>Halaman utama</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: cardColor }]}
            onPress={() => router.back()}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonEmoji}>←</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={[styles.secondaryButtonText, { color: textColor }]}>Kembali</Text>
                <Text style={styles.buttonSubtextSecondary}>Back Halaman</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

{/* Solutions Card */}
          <View style={[styles.card, { backgroundColor: cardColor, borderColor: cardBorder }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Apa yang bisa Anda lakukan?</Text>

            {commonSolutions.map((solution, index) => (
              <View key={index} style={styles.solutionItem}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <View style={styles.solutionContent}>
                  <Text style={[styles.solutionTitle, { color: textColor }]}>{solution.title}</Text>
                  <Text style={[styles.solutionDescription, { color: subtitleColor }]}>{solution.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Search Section */}
          <View style={[styles.card, { backgroundColor: cardColor, borderColor: cardBorder }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Pencarian Cepat</Text>
            <View style={[styles.searchContainer, { backgroundColor: mode === 'dark' ? '#374151' : '#f9fafb', borderColor: cardBorder }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={[styles.searchPlaceholder, { color: subtitleColor }]}>Cari di aplikasi...</Text>
            </View>
          </View>

{/* Support Info */}
          <View style={[styles.infoContainer, { 
            backgroundColor: mode === 'dark' ? (COLORS.primary || '#1d4ed8') + '20' : (COLORS.primary || '#1d4ed8') + '10' 
          }]}>
            <Text style={styles.infoIcon}>🔄</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: textColor }]}>Masih tidak menemukan?</Text>
              <Text style={[styles.infoText, { color: subtitleColor }]}>
                Hubungi tim support atau coba refresh halaman. Terkadang masalah ini bersifat sementara.
              </Text>
            </View>
          </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.danger || '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  iconText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  errorCode: {
    fontSize: width * 0.15, // Responsive font size
    fontWeight: '800',
    color: COLORS.danger || '#ef4444',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: width * 0.8,
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary || '#1d4ed8',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#1d4ed8',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  secondaryButtonText: {
    color: COLORS.primary || '#1d4ed8',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonTextContainer: {
    marginLeft: 12,
  },
  buttonEmoji: {
    fontSize: 24,
    width: 28,
    textAlign: 'center',
    color: COLORS.darkGray || '#6b7280',
  },
  buttonSubtextPrimary: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonSubtextSecondary: {
    fontSize: 12,
    color: COLORS.darkGray || '#6b7280',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text || '#1f2937',
    marginBottom: 16,
  },
  solutionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: (COLORS.primary || '#1d4ed8') + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary || '#1d4ed8',
  },
  solutionContent: {
    flex: 1,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text || '#1f2937',
    marginBottom: 4,
  },
  solutionDescription: {
    fontSize: 14,
    color: COLORS.darkGray || '#6b7280',
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
    fontSize: 20,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: COLORS.darkGray || '#6b7280',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text || '#1f2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray || '#6b7280',
    lineHeight: 20,
  },
});
