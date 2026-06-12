import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { VStack, HStack, Text, Center, Badge, Divider } from 'native-base';
import { ArrowLeft, Whatsapp } from 'iconsax-react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

import { AppScreen, LoadingHauler } from '../../src/components/common';
import { COLORS } from '../../src/constants/colors';
import {
  getWhatsAppPairingStatus,
  revokeWhatsAppAccount,
  sendWhatsAppOtp,
  verifyWhatsAppOtp
} from '../../src/services/api/aiGateway';
import ChatAthiMKG from './components/ChatAthiMKG';

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ActionButton = ({ label, onPress, bg, color, borderColor }) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress}>
    <Center
      px={4}
      py={3}
      rounded="xl"
      bg={bg}
      borderWidth={borderColor ? 1 : 0}
      borderColor={borderColor || 'transparent'}
      opacity={onPress ? 1 : 0.7}
    >
      <Text fontFamily="Quicksand-Bold" fontSize="sm" color={color}>
        {label}
      </Text>
    </Center>
  </TouchableOpacity>
);

export default function PairingScreen() {
  const router = useRouter();
  const mode = useSelector((state) => state.themes)?.value || 'light';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';
  const accentColor = mode === 'dark' ? '#22c55e' : '#16a34a';
  const mutedBg = mode === 'dark' ? '#111827' : '#f8fafc';
  const inputBg = mode === 'dark' ? '#0f172a' : '#ffffff';

  const activeAccount = accounts.find((account) => account?.status === 'active' && Number(account?.is_verified) === 1);

  const loadStatus = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const data = await getWhatsAppPairingStatus();
      setStatus(data);
      setAccounts(Array.isArray(data?.accounts) ? data.accounts : []);
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      Alert.alert('Gagal', error?.message || 'Tidak dapat mengambil status WhatsApp.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStatus({ silent: true });
  };

  const handleSendOtp = async () => {
    try {
      setSending(true);
      const data = await sendWhatsAppOtp();
      await loadStatus({ silent: true });
      Alert.alert('Kode Dikirim', `Kode verifikasi dikirim ke ${data?.phone_masked || status?.profile_phone_masked || 'WhatsApp Anda'}.`);
    } catch (error) {
      console.error('Error sending WhatsApp OTP:', error);
      Alert.alert('Gagal', error?.response?.data?.data?.message || error?.message || 'Tidak dapat mengirim OTP WhatsApp.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('OTP Kosong', 'Masukkan kode OTP yang dikirim ke WhatsApp Anda.');
      return;
    }

    try {
      setVerifying(true);
      await verifyWhatsAppOtp(otp.trim());
      setOtp('');
      await loadStatus({ silent: true });
      Alert.alert('Berhasil', 'WhatsApp berhasil terhubung.');
    } catch (error) {
      console.error('Error verifying WhatsApp OTP:', error);
      Alert.alert('Gagal', error?.response?.data?.data?.message || error?.message || 'OTP tidak valid atau sudah kedaluwarsa.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRevoke = (phone) => {
    Alert.alert('Putuskan Koneksi', `Putuskan nomor ${phone || '-'} dari akun ini?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Putuskan',
        style: 'destructive',
        onPress: async () => {
          try {
            await revokeWhatsAppAccount(phone);
            await loadStatus({ silent: true });
            Alert.alert('Berhasil', 'Koneksi WhatsApp berhasil diputus.');
          } catch (error) {
            console.error('Error revoking WhatsApp account:', error);
            Alert.alert('Gagal', error?.message || 'Tidak dapat memutus koneksi WhatsApp.');
          }
        }
      }
    ]);
  };

  const renderStatusBadge = (account) => {
    const active = account?.status === 'active' && Number(account?.is_verified) === 1;

    return (
      <Badge
        bg={active ? (mode === 'dark' ? '#064e3b' : '#dcfce7') : (mode === 'dark' ? '#7f1d1d' : '#fee2e2')}
        _text={{
          color: active ? accentColor : '#dc2626',
          fontSize: 11,
          fontFamily: 'Quicksand-Bold'
        }}
        rounded="full"
        px={3}
        py={1}
      >
        {active ? 'Terhubung' : 'Tidak Aktif'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <AppScreen>
        <VStack flex={1} bg={backgroundColor}>
          <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={textColor} />
            </TouchableOpacity>
            <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
              Hubungkan WhatsApp
            </Text>
          </HStack>
          <Center flex={1}>
            <LoadingHauler
              message="Memuat data pairing..."
              subMessage="Mengambil status koneksi WhatsApp"
              type="default"
            />
          </Center>
        </VStack>
      </AppScreen>
    );
  }

  if (activeAccount) {
    return (
      <AppScreen>
        <ChatAthiMKG account={activeAccount} onUnpair={handleRevoke} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <VStack flex={1} bg={backgroundColor}>
        <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor} flex={1}>
            Hubungkan WhatsApp
          </Text>
        </HStack>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={mode === 'dark' ? '#60a5fa' : '#2563eb'}
            />
          }
        >
          <VStack space={4} p={4}>
            <VStack bg={cardBg} rounded="2xl" borderWidth={1} borderColor={borderColor} p={4} space={4}>
              <HStack alignItems="center" space={3}>
                <Center w={12} h={12} rounded="xl" bg={mode === 'dark' ? '#14532d' : '#dcfce7'}>
                  <Whatsapp size={24} color={accentColor} variant="Bulk" />
                </Center>
                <VStack flex={1}>
                  <Text fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>
                    Pairing WhatsApp via OTP
                  </Text>
                  <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                    Kode dikirim ke nomor dari profil karyawan, lalu dimasukkan di aplikasi ini.
                  </Text>
                </VStack>
              </HStack>

              <VStack bg={mutedBg} rounded="xl" borderWidth={1} borderColor={borderColor} p={4} space={2}>
                <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                  Nomor WhatsApp dari profil
                </Text>
                <Text fontFamily="Quicksand-Bold" fontSize="lg" color={textColor}>
                  {status?.profile_phone_masked || status?.profile_phone || 'Belum tersedia'}
                </Text>
                {!status?.can_send_otp ? (
                  <Text fontFamily="Poppins-Regular" fontSize="xs" color="#dc2626">
                    Nomor belum tersedia. Silakan hubungi Admin/HR untuk memperbarui nomor WhatsApp.
                  </Text>
                ) : null}
              </VStack>

              {!activeAccount ? (
                <>
                  <ActionButton
                    label={sending ? 'Mengirim kode...' : 'Kirim Kode Verifikasi'}
                    onPress={sending || !status?.can_send_otp ? null : handleSendOtp}
                    bg={sending || !status?.can_send_otp ? (mode === 'dark' ? '#374151' : '#d1d5db') : accentColor}
                    color="#ffffff"
                  />

                  <VStack space={2}>
                    <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                      Masukkan OTP
                    </Text>
                    <TextInput
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholder="Contoh: 482913"
                      placeholderTextColor={subtitleColor}
                      style={{
                        backgroundColor: inputBg,
                        borderColor,
                        borderWidth: 1,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        color: textColor,
                        fontSize: 18,
                        letterSpacing: 4,
                        fontFamily: 'Quicksand-Bold'
                      }}
                    />
                    <ActionButton
                      label={verifying ? 'Memverifikasi...' : 'Verifikasi OTP'}
                      onPress={verifying ? null : handleVerifyOtp}
                      bg={mode === 'dark' ? '#1d4ed8' : '#2563eb'}
                      color="#ffffff"
                    />
                    {status?.pending_otp ? (
                      <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                        Ada OTP aktif sampai {formatDateTime(status.pending_otp.expires_at)}.
                      </Text>
                    ) : null}
                  </VStack>
                </>
              ) : null}
            </VStack>

            <VStack bg={cardBg} rounded="2xl" borderWidth={1} borderColor={borderColor} p={4} space={4}>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>
                  Nomor Terhubung
                </Text>
                <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                  {accounts.length} akun
                </Text>
              </HStack>

              {accounts.length === 0 ? (
                <VStack bg={mutedBg} rounded="xl" borderWidth={1} borderColor={borderColor} p={4} space={2}>
                  <Text fontFamily="Quicksand-Bold" fontSize="sm" color={textColor}>
                    Belum ada nomor terhubung
                  </Text>
                  <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                    Kirim kode verifikasi ke nomor profil, lalu masukkan OTP di aplikasi.
                  </Text>
                </VStack>
              ) : (
                <VStack>
                  {accounts.map((account, index) => (
                    <VStack key={account.uuid || `${account.channel_user_id}-${index}`} space={3}>
                      <VStack bg={mutedBg} rounded="xl" borderWidth={1} borderColor={borderColor} p={4} space={3}>
                        <HStack alignItems="center" justifyContent="space-between">
                          <VStack flex={1} mr={3}>
                            <Text fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>
                              {account.display_name || account.channel_user_id || '-'}
                            </Text>
                            <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                              {account.channel_user_id || '-'}
                            </Text>
                          </VStack>
                          {renderStatusBadge(account)}
                        </HStack>

                        <VStack space={1}>
                          <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                            Verified: {formatDateTime(account.verified_at)}
                          </Text>
                          <Text fontFamily="Poppins-Regular" fontSize="xs" color={subtitleColor}>
                            Terakhir dipakai: {formatDateTime(account.last_used_at)}
                          </Text>
                        </VStack>

                        <ActionButton
                          label="Putuskan Koneksi"
                          onPress={() => handleRevoke(account.channel_user_id)}
                          bg="transparent"
                          color="#dc2626"
                          borderColor="#dc2626"
                        />
                      </VStack>
                      {index < accounts.length - 1 ? <Divider bg={borderColor} /> : null}
                    </VStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </VStack>
        </ScrollView>
      </VStack>
    </AppScreen>
  );
}
