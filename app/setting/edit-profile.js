import React, { useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { VStack, HStack, Text, Button, Center, Divider } from 'native-base';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Call, Edit, InfoCircle, Sms, TickCircle } from 'iconsax-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppScreen, OtpVerificationCard } from '../../src/components/common';
import { COLORS } from '../../src/constants/colors';
import { requestUpdateContactOtp, updateEmployeeContact, verifyUpdateContactOtp } from '../../src/services/api/profileContact';
import { patchContactData } from '../../src/store/slices/authSlice';

const normalizeValue = (value) => {
  if (value === undefined || value === null || value === '-') {
    return '';
  }

  return String(value).trim();
};

const isValidEmail = (value) => {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isValidPhone = (value) => {
  if (!value) return false;

  const sanitized = value.replace(/[^0-9+]/g, '');
  return sanitized.length >= 10;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const userAuth = useSelector(state => state.auth)?.user || {};
  const karyawan = useSelector(state => state.auth)?.karyawan || {};

  const initialValuesRef = useRef({
    email: normalizeValue(karyawan?.email || userAuth?.email),
    phone: normalizeValue(karyawan?.phone || userAuth?.karyawan?.phone || userAuth?.phone),
  });

  const initialEmail = initialValuesRef.current.email;
  const initialPhone = initialValuesRef.current.phone;

  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [otpRetryAfterAt, setOtpRetryAfterAt] = useState(null);
  const [otpRequestCount, setOtpRequestCount] = useState(0);
  const [otpMaxRequest, setOtpMaxRequest] = useState(5);
  const [otpError, setOtpError] = useState('');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';
  const inputBg = mode === 'dark' ? '#111827' : '#f9fafb';

  const trimmedEmail = email.trim();
  const trimmedPhone = phone.trim();
  const karyawanId = karyawan?.id || userAuth?.karyawan?.id || null;
  const normalizedInitialPhone = normalizeValue(initialPhone).replace(/[^0-9]/g, '');
  const normalizedCurrentPhone = normalizeValue(trimmedPhone).replace(/[^0-9]/g, '');
  const hasChanges = trimmedEmail !== initialEmail || trimmedPhone !== initialPhone;
  const phoneChanged = normalizedCurrentPhone !== normalizedInitialPhone;

  const validation = useMemo(() => {
    if (!trimmedEmail) {
      return { valid: false, message: 'Email wajib diisi.' };
    }

    if (!isValidEmail(trimmedEmail)) {
      return { valid: false, message: 'Format email tidak valid.' };
    }

    if (phoneChanged && !trimmedPhone) {
      return { valid: false, message: 'Nomor handphone wajib diisi.' };
    }

    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      return { valid: false, message: 'Nomor handphone minimal 10 digit.' };
    }

    return { valid: true, message: '' };
  }, [trimmedEmail, trimmedPhone, phoneChanged]);

  const canSubmit = validation.valid && hasChanges && (!phoneChanged || otpVerified);

  const resetOtpState = () => {
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpModalVisible(false);
    setOtpExpiresAt(null);
    setOtpRetryAfterAt(null);
    setOtpRequestCount(0);
    setOtpMaxRequest(5);
    setOtpError('');
  };

  const handleEmailChange = (value) => {
    setEmail(value);
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    resetOtpState();
  };

  const persistContactUpdate = async (nextEmail, nextPhone) => {
    const nextUser = {
      ...userAuth,
      email: nextEmail,
      phone: nextPhone,
      karyawan: userAuth?.karyawan ? {
        ...userAuth.karyawan,
        phone: nextPhone,
      } : userAuth?.karyawan,
    };

    const nextEmployee = {
      ...karyawan,
      email: nextEmail,
      phone: nextPhone,
    };

    await AsyncStorage.setItem('@user', JSON.stringify(nextUser));
    await AsyncStorage.setItem('@employee', JSON.stringify(nextEmployee));
    dispatch(patchContactData({ email: nextEmail, phone: nextPhone }));
  };

  const handleRequestOtp = async () => {
    if (!karyawanId) {
      Alert.alert('Gagal', 'Data karyawan tidak ditemukan. Silakan login ulang.');
      return;
    }

    if (!phoneChanged) {
      Alert.alert('Info', 'Ubah nomor handphone terlebih dahulu untuk meminta OTP.');
      return;
    }

    if (!trimmedPhone || !isValidPhone(trimmedPhone)) {
      Alert.alert('Validasi Gagal', 'Masukkan nomor handphone baru yang valid terlebih dahulu.');
      return;
    }

    try {
      setRequestingOtp(true);
      setOtpError('');
      const resp = await requestUpdateContactOtp(karyawanId, {
        phone: trimmedPhone,
        email: trimmedEmail,
      });
      setOtpSent(true);
      setOtpVerified(false);
      setOtpModalVisible(true);
      setOtpExpiresAt(resp?.expires_at || null);
      setOtpRetryAfterAt(resp?.retry_after_at || null);
      setOtpRequestCount(Number(resp?.request_count_24h || 0));
      setOtpMaxRequest(Number(resp?.max_request_24h || 5));
      Alert.alert('OTP Dikirim', `Kode verifikasi telah dibuat untuk nomor ${resp?.phone || trimmedPhone}.`);
    } catch (error) {
      const payload = error?.response?.data?.rows || {};
      if (payload?.expires_at) {
        setOtpSent(true);
        setOtpModalVisible(true);
        setOtpExpiresAt(payload.expires_at);
      }
      if (payload?.retry_after_at) {
        setOtpRetryAfterAt(payload.retry_after_at);
      }
      if (payload?.request_count_24h !== undefined) {
        setOtpRequestCount(Number(payload.request_count_24h || 0));
      }
      if (payload?.max_request_24h !== undefined) {
        setOtpMaxRequest(Number(payload.max_request_24h || 5));
      }
      Alert.alert('Gagal', error?.response?.data?.diagnostic?.message || error?.response?.data?.message || error?.message || 'Tidak dapat mengirim OTP.');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!karyawanId) {
      Alert.alert('Gagal', 'Data karyawan tidak ditemukan. Silakan login ulang.');
      return;
    }

    if (!otp.trim()) {
      setOtpError('Masukkan OTP terlebih dahulu.');
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError('');
      const resp = await verifyUpdateContactOtp(karyawanId, {
        phone: trimmedPhone,
        otp: otp.trim(),
      });
      setOtpVerified(Boolean(resp?.verified));
      setOtpModalVisible(false);
      setOtpRetryAfterAt(null);
      Alert.alert('Berhasil', 'Nomor handphone baru berhasil diverifikasi.');
    } catch (error) {
      setOtpVerified(false);
      setOtpError(error?.response?.data?.diagnostic?.message || error?.response?.data?.message || error?.message || 'OTP tidak valid.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async () => {
    if (!validation.valid) {
      Alert.alert('Validasi Gagal', validation.message);
      return;
    }

    if (!hasChanges) {
      Alert.alert('Tidak Ada Perubahan', 'Ubah email atau nomor handphone terlebih dahulu.');
      return;
    }

    if (phoneChanged && !otpVerified) {
      Alert.alert('OTP Belum Diverifikasi', 'Verifikasi OTP untuk nomor handphone baru sebelum menyimpan perubahan.');
      return;
    }

    try {
      setSubmitting(true);
      const resp = await updateEmployeeContact(karyawanId, {
        email: trimmedEmail,
        phone: trimmedPhone,
      });

      await persistContactUpdate(resp?.email || trimmedEmail, resp?.phone || trimmedPhone);
      Alert.alert('Berhasil', 'Informasi kontak berhasil diperbarui.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Gagal', error?.response?.data?.diagnostic?.message || error?.response?.data?.message || error?.message || 'Tidak dapat memperbarui kontak.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <VStack flex={1} bg={backgroundColor}>
          <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={textColor} />
            </TouchableOpacity>
            <VStack flex={1}>
              <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
                Ubah Kontak
              </Text>
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                Perbarui email dan nomor handphone Anda
              </Text>
            </VStack>
          </HStack>

          <ScrollView keyboardShouldPersistTaps="handled">
            <VStack space={4} p={4}>
              <VStack
                bg={mode === 'dark' ? '#1e3a8a' : '#eff6ff'}
                rounded="2xl"
                p={4}
                borderWidth={1}
                borderColor={mode === 'dark' ? '#1d4ed8' : '#bfdbfe'}
                space={3}
              >
                <HStack space={3} alignItems="flex-start">
                  <Center
                    w={10}
                    h={10}
                    rounded="full"
                    bg={mode === 'dark' ? '#2563eb' : '#dbeafe'}
                  >
                    <InfoCircle size={20} color={mode === 'dark' ? '#dbeafe' : '#2563eb'} />
                  </Center>
                  <VStack flex={1} space={1}>
                    <Text fontSize="sm" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#eff6ff' : '#1e3a8a'}>
                      Informasi Kontak
                    </Text>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#dbeafe' : '#1d4ed8'}>
                      Pastikan email dan nomor handphone yang Anda masukkan aktif agar memudahkan komunikasi dan notifikasi akun.
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <VStack
                bg={cardBg}
                p={4}
                rounded="2xl"
                borderWidth={1}
                borderColor={borderColor}
                space={4}
              >
                <HStack space={3} alignItems="center">
                  <Center
                    w={10}
                    h={10}
                    rounded="lg"
                    bg={mode === 'dark' ? '#374151' : '#eff6ff'}
                  >
                    <Edit size={20} color={mode === 'dark' ? '#93c5fd' : '#2563eb'} />
                  </Center>
                  <VStack flex={1}>
                    <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                      Form Kontak
                    </Text>
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                      Hanya email dan nomor handphone yang dapat diubah.
                    </Text>
                  </VStack>
                </HStack>

                <Divider bg={borderColor} />

                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                    Email
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: inputBg,
                      borderColor,
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      color: textColor,
                      fontSize: 14,
                      fontFamily: 'Poppins-Regular'
                    }}
                    placeholder="nama@email.com"
                    placeholderTextColor={subtitleColor}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={handleEmailChange}
                  />
                </VStack>

                <VStack space={2}>
                  <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                    Nomor Handphone
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: inputBg,
                      borderColor,
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      color: textColor,
                      fontSize: 14,
                      fontFamily: 'Poppins-Regular'
                    }}
                    placeholder="08xxxxxxxxxx"
                    placeholderTextColor={subtitleColor}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={handlePhoneChange}
                  />
                  {phoneChanged ? (
                    <TouchableOpacity onPress={requestingOtp ? null : handleRequestOtp} disabled={requestingOtp}>
                      <Center
                        px={4}
                        py={3}
                        rounded="xl"
                        bg={requestingOtp ? (mode === 'dark' ? '#374151' : '#cbd5e1') : (mode === 'dark' ? '#1d4ed8' : '#2563eb')}
                        opacity={requestingOtp ? 0.8 : 1}
                      >
                        <Text fontFamily="Quicksand-Bold" fontSize="sm" color="#ffffff">
                          {requestingOtp ? 'Mengirim OTP...' : (otpSent ? 'Kirim Ulang OTP' : 'Kirim OTP ke Nomor Baru')}
                        </Text>
                      </Center>
                    </TouchableOpacity>
                  ) : null}
                </VStack>
              </VStack>

              {phoneChanged && otpSent ? (
                <OtpVerificationCard
                  mode={mode}
                  value={otp}
                  onChangeText={setOtp}
                  onVerify={handleVerifyOtp}
                  verifying={verifyingOtp}
                  disabled={verifyingOtp}
                  expiresAt={otpExpiresAt}
                  errorMessage={otpError}
                  isOpen={otpModalVisible}
                  onClose={() => setOtpModalVisible(false)}
                  onOpen={() => setOtpModalVisible(true)}
                  verified={otpVerified}
                  onResend={handleRequestOtp}
                  resending={requestingOtp}
                  resendAvailableAt={otpRetryAfterAt}
                  requestCount={otpRequestCount}
                  maxRequest={otpMaxRequest}
                  description="Kode OTP dikirim ke nomor handphone baru Anda. Verifikasi terlebih dahulu sebelum menyimpan perubahan kontak."
                />
              ) : null}

              {phoneChanged && otpVerified ? (
                <Text fontSize="xs" fontFamily="Poppins-Light" color="#16a34a">
                  Nomor handphone baru telah diverifikasi dan siap disimpan.
                </Text>
              ) : null}

              <VStack
                bg={cardBg}
                p={4}
                rounded="2xl"
                borderWidth={1}
                borderColor={borderColor}
                space={3}
              >
                <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                  Informasi Saat Ini
                </Text>
                <VStack space={2}>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                    Email saat ini
                  </Text>
                  <HStack space={2} alignItems="center">
                    <Sms size={18} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
                    <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                      {initialEmail || '-'}
                    </Text>
                  </HStack>
                </VStack>
                <VStack space={2}>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                    Nomor handphone saat ini
                  </Text>
                  <HStack space={2} alignItems="center">
                    <Call size={18} color={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
                    <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                      {initialPhone || '-'}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>

              {!validation.valid && (
                <Text fontSize="xs" fontFamily="Poppins-Light" color="#ef4444">
                  {validation.message}
                </Text>
              )}

              <VStack h={6} />
            </VStack>
          </ScrollView>

          <VStack p={4} borderTopWidth={1} borderTopColor={borderColor} bg={backgroundColor}>
            <Button
              bg={mode === 'dark' ? '#60a5fa' : '#2563eb'}
              _pressed={{ bg: mode === 'dark' ? '#3b82f6' : '#1d4ed8' }}
              _disabled={{ bg: mode === 'dark' ? '#374151' : '#cbd5e1' }}
              onPress={handleSubmit}
              isLoading={submitting}
              isDisabled={submitting || !canSubmit}
              leftIcon={<TickCircle size={20} color="#ffffff" />}
              rounded="xl"
            >
              <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                Simpan Perubahan
              </Text>
            </Button>
          </VStack>
        </VStack>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
