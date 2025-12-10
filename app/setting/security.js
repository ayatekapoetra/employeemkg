import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Modal,
  ActivityIndicator 
} from 'react-native';
import { 
  VStack, 
  HStack, 
  Text, 
  Input, 
  Button,
  Icon,
  Center,
  Divider 
} from 'native-base';
import { AppScreen } from '../../src/components/common';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Eye, 
  EyeSlash,
  Lock,
  User,
  InfoCircle,
  TickCircle,
  CloseCircle,
  Warning2,
  ShieldSecurity
} from 'iconsax-react-native';
import { COLORS } from '../../src/constants/colors';
import apiClient from '../../src/services/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../src/store/slices/authSlice';

export default function SecurityScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const user = useSelector(state => state.auth)?.user || {};
  
  const [loading, setLoading] = useState(false);
  const [showUpdateUsername, setShowUpdateUsername] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  // Form States
  const [usernameForm, setUsernameForm] = useState({
    current_password: '',
    new_username: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false,
  });

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'OK',
    showCancel: false,
  });

  const showModal = (type, title, message, onConfirm = null, confirmText = 'OK', showCancel = false) => {
    setModalConfig({ type, title, message, onConfirm, confirmText, showCancel });
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const clearAllLocalData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = keys.filter(key => 
        !key.includes('theme') && 
        !key.includes('language') &&
        !key.includes('onboarding')
      );
      await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.error('Error clearing local data:', error);
      throw error;
    }
  };

  const forceLogout = async () => {
    try {
      await clearAllLocalData();
      dispatch(logout());
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      showModal('error', 'Error', 'Gagal logout. Silakan coba lagi.');
    }
  };

  const handleUpdateUsername = async () => {
    // Validation
    if (!usernameForm.current_password.trim()) {
      showModal('warning', 'Validasi', 'Password saat ini wajib diisi');
      return;
    }

    if (!usernameForm.new_username.trim()) {
      showModal('warning', 'Validasi', 'Username baru wajib diisi');
      return;
    }

    if (usernameForm.new_username.length < 4) {
      showModal('warning', 'Validasi', 'Username minimal 4 karakter');
      return;
    }

    // Validate username format (only letters and numbers)
    if (!/^[a-zA-Z0-9]+$/.test(usernameForm.new_username)) {
      showModal('warning', 'Validasi', 'Username hanya boleh mengandung huruf dan angka');
      return;
    }

    if (usernameForm.new_username === user?.username) {
      showModal('warning', 'Validasi', 'Username baru sama dengan username lama');
      return;
    }

    showModal(
      'warning',
      'Konfirmasi',
      'Setelah mengubah username, Anda akan logout otomatis dan semua data lokal akan dihapus. Lanjutkan?',
      async () => {
        hideModal();
        setLoading(true);
        try {
          const response = await apiClient.post('/mobile/account/update-username', {
            current_password: usernameForm.current_password,
            new_username: usernameForm.new_username,
          });

          if (response.data.success) {
            showModal(
              'success',
              'Berhasil',
              'Username berhasil diubah. Silakan login kembali dengan username baru.',
              () => {
                hideModal();
                forceLogout();
              },
              'Login',
              false
            );
          } else {
            const errorMsg = response.data.message || 'Gagal mengubah username';
            showModal('error', 'Gagal Mengubah Username', errorMsg);
          }
        } catch (error) {
          let errorMessage = 'Terjadi kesalahan saat mengubah username';
          let errorDetails = '';
          
          if (error.response?.data) {
            const data = error.response.data;
            errorMessage = data.message || errorMessage;
            
            // Extract first error detail from errors object
            if (data.errors) {
              const firstError = Object.values(data.errors)[0];
              errorDetails = Array.isArray(firstError) ? firstError[0] : firstError;
            }
          }
          
          if (error.response?.status === 401) {
            // Password salah atau sesi tidak valid
            const msg = errorDetails || errorMessage || 'Password saat ini salah';
            showModal('warning', 'Autentikasi Gagal', msg);
          } else if (error.response?.status === 422) {
            // Validasi gagal
            const msg = errorDetails || errorMessage;
            showModal('warning', 'Validasi Gagal', msg);
          } else if (error.response?.status === 404) {
            // User tidak ditemukan
            showModal(
              'warning',
              'Sesi Tidak Valid',
              'Sesi Anda telah berakhir. Silakan login kembali.',
              () => {
                hideModal();
                forceLogout();
              },
              'Login',
              false
            );
          } else if (error.response?.status === 500) {
            showModal('error', 'Server Error', 'Terjadi kesalahan pada server. Silakan coba lagi nanti atau hubungi administrator.');
          } else {
            showModal('error', 'Error', errorDetails || errorMessage);
          }
        } finally {
          setLoading(false);
        }
      },
      'Lanjutkan',
      true
    );
  };

  const handleUpdatePassword = async () => {
    // Validation
    if (!passwordForm.current_password.trim()) {
      showModal('warning', 'Validasi', 'Password saat ini wajib diisi');
      return;
    }

    if (!passwordForm.new_password.trim()) {
      showModal('warning', 'Validasi', 'Password baru wajib diisi');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      showModal('warning', 'Validasi', 'Password baru minimal 6 karakter');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showModal('warning', 'Validasi', 'Password baru dan konfirmasi password tidak sama');
      return;
    }

    if (passwordForm.new_password === passwordForm.current_password) {
      showModal('warning', 'Validasi', 'Password baru tidak boleh sama dengan password lama');
      return;
    }

    showModal(
      'warning',
      'Konfirmasi',
      'Setelah mengubah password, Anda akan logout otomatis dan semua data lokal akan dihapus. Lanjutkan?',
      async () => {
        hideModal();
        setLoading(true);
        try {
          const response = await apiClient.post('/mobile/account/update-password', {
            current_password: passwordForm.current_password,
            new_password: passwordForm.new_password,
            confirm_password: passwordForm.confirm_password,
          });

          if (response.data.success) {
            showModal(
              'success',
              'Berhasil',
              'Password berhasil diubah. Silakan login kembali dengan password baru.',
              () => {
                hideModal();
                forceLogout();
              },
              'Login',
              false
            );
          } else {
            const errorMsg = response.data.message || 'Gagal mengubah password';
            showModal('error', 'Gagal Mengubah Password', errorMsg);
          }
        } catch (error) {
          let errorMessage = 'Terjadi kesalahan saat mengubah password';
          let errorDetails = '';
          
          if (error.response?.data) {
            const data = error.response.data;
            errorMessage = data.message || errorMessage;
            
            // Extract first error detail from errors object
            if (data.errors) {
              const firstError = Object.values(data.errors)[0];
              errorDetails = Array.isArray(firstError) ? firstError[0] : firstError;
            }
          }
          
          if (error.response?.status === 401) {
            // Password salah atau sesi tidak valid
            const msg = errorDetails || errorMessage || 'Password saat ini salah';
            showModal('warning', 'Autentikasi Gagal', msg);
          } else if (error.response?.status === 422) {
            // Validasi gagal
            const msg = errorDetails || errorMessage;
            showModal('warning', 'Validasi Gagal', msg);
          } else if (error.response?.status === 404) {
            // User tidak ditemukan
            showModal(
              'warning',
              'Sesi Tidak Valid',
              'Sesi Anda telah berakhir. Silakan login kembali.',
              () => {
                hideModal();
                forceLogout();
              },
              'Login',
              false
            );
          } else if (error.response?.status === 500) {
            showModal('error', 'Server Error', 'Terjadi kesalahan pada server. Silakan coba lagi nanti atau hubungi administrator.');
          } else {
            showModal('error', 'Error', errorDetails || errorMessage);
          }
        } finally {
          setLoading(false);
        }
      },
      'Lanjutkan',
      true
    );
  };

  const getModalIcon = () => {
    const iconProps = { size: 60 };
    const colors = {
      success: mode === 'dark' ? '#10b981' : '#059669',
      error: mode === 'dark' ? '#ef4444' : '#dc2626',
      warning: mode === 'dark' ? '#f59e0b' : '#d97706',
      info: mode === 'dark' ? '#3b82f6' : '#2563eb',
    };

    switch (modalConfig.type) {
      case 'success':
        return <TickCircle {...iconProps} color={colors.success} variant="Bold" />;
      case 'error':
        return <CloseCircle {...iconProps} color={colors.error} variant="Bold" />;
      case 'warning':
        return <Warning2 {...iconProps} color={colors.warning} variant="Bold" />;
      default:
        return <InfoCircle {...iconProps} color={colors.info} variant="Bold" />;
    }
  };

  return (
    <AppScreen>
      <VStack flex={1} bg={backgroundColor}>
        {/* Header */}
        <HStack p={4} alignItems="center" space={3} borderBottomWidth={1} borderBottomColor={borderColor}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>
            Keamanan Akun
          </Text>
        </HStack>

        <KeyboardAvoidingView
          flex={1}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <VStack space={4} p={4}>
              {/* Info Banner */}
              <VStack
                bg={mode === 'dark' ? '#1e3a8a' : '#dbeafe'}
                p={4}
                rounded="xl"
                borderWidth={1}
                borderColor={mode === 'dark' ? '#3b82f6' : '#93c5fd'}
              >
                <HStack space={3} alignItems="flex-start">
                  <ShieldSecurity 
                    size={24} 
                    color={mode === 'dark' ? '#93c5fd' : '#1e40af'} 
                    variant="Bold" 
                  />
                  <VStack flex={1}>
                    <Text
                      fontSize="sm"
                      fontFamily="Quicksand-Bold"
                      color={mode === 'dark' ? '#dbeafe' : '#1e3a8a'}
                    >
                      Keamanan Akun
                    </Text>
                    <Text
                      fontSize="xs"
                      fontFamily="Poppins-Light"
                      color={mode === 'dark' ? '#bfdbfe' : '#1e40af'}
                      mt={1}
                    >
                      Perubahan username/password akan menghapus semua data lokal dan logout otomatis
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              {/* Current User Info */}
              <VStack
                bg={cardBg}
                p={4}
                rounded="xl"
                borderWidth={1}
                borderColor={borderColor}
                space={3}
              >
                <HStack space={3} alignItems="center">
                  <User size={24} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
                  <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                    Informasi Akun
                  </Text>
                </HStack>
                <Divider />
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontFamily="Poppins-Light" color={subtitleColor}>
                    Username:
                  </Text>
                  <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                    {user?.username || '-'}
                  </Text>
                </HStack>
              </VStack>

              {/* Update Username Section */}
              <VStack
                bg={cardBg}
                p={4}
                rounded="xl"
                borderWidth={1}
                borderColor={borderColor}
                space={3}
              >
                <TouchableOpacity onPress={() => setShowUpdateUsername(!showUpdateUsername)}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={3} alignItems="center" flex={1}>
                      <User size={24} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
                      <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                        Ubah Username
                      </Text>
                    </HStack>
                    <Icon
                      as={showUpdateUsername ? ArrowLeft : ArrowLeft}
                      size={5}
                      color={subtitleColor}
                      transform={[{ rotate: showUpdateUsername ? '90deg' : '-90deg' }]}
                    />
                  </HStack>
                </TouchableOpacity>

                {showUpdateUsername && (
                  <>
                    <Divider />
                    <VStack space={4}>
                      <VStack space={2}>
                        <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                          Password Saat Ini *
                        </Text>
                        <Input
                          bg={mode === 'dark' ? '#111827' : '#f9fafb'}
                          borderColor={borderColor}
                          color={textColor}
                          placeholderTextColor={subtitleColor}
                          placeholder="Masukkan password saat ini"
                          value={usernameForm.current_password}
                          onChangeText={(text) => setUsernameForm({ ...usernameForm, current_password: text })}
                          type={showPasswords.current_password ? 'text' : 'password'}
                          InputRightElement={
                            <TouchableOpacity
                              onPress={() => setShowPasswords({ ...showPasswords, current_password: !showPasswords.current_password })}
                              style={{ marginRight: 12 }}
                            >
                              {showPasswords.current_password ? 
                                <EyeSlash size={20} color={subtitleColor} /> : 
                                <Eye size={20} color={subtitleColor} />
                              }
                            </TouchableOpacity>
                          }
                          isDisabled={loading}
                        />
                      </VStack>

                      <VStack space={2}>
                        <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                          Username Baru *
                        </Text>
                        <Input
                          bg={mode === 'dark' ? '#111827' : '#f9fafb'}
                          borderColor={borderColor}
                          color={textColor}
                          placeholderTextColor={subtitleColor}
                          placeholder="Masukkan username baru"
                          value={usernameForm.new_username}
                          onChangeText={(text) => setUsernameForm({ ...usernameForm, new_username: text })}
                          autoCapitalize="none"
                          isDisabled={loading}
                        />
                      </VStack>

                      <Button
                        bg={mode === 'dark' ? '#60a5fa' : '#2563eb'}
                        _pressed={{ bg: mode === 'dark' ? '#3b82f6' : '#1d4ed8' }}
                        onPress={handleUpdateUsername}
                        isLoading={loading}
                        isDisabled={loading}
                        leftIcon={<TickCircle size={20} color="#ffffff" />}
                      >
                        <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                          Ubah Username
                        </Text>
                      </Button>
                    </VStack>
                  </>
                )}
              </VStack>

              {/* Update Password Section */}
              <VStack
                bg={cardBg}
                p={4}
                rounded="xl"
                borderWidth={1}
                borderColor={borderColor}
                space={3}
              >
                <TouchableOpacity onPress={() => setShowUpdatePassword(!showUpdatePassword)}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={3} alignItems="center" flex={1}>
                      <Lock size={24} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} />
                      <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
                        Ubah Password
                      </Text>
                    </HStack>
                    <Icon
                      as={showUpdatePassword ? ArrowLeft : ArrowLeft}
                      size={5}
                      color={subtitleColor}
                      transform={[{ rotate: showUpdatePassword ? '90deg' : '-90deg' }]}
                    />
                  </HStack>
                </TouchableOpacity>

                {showUpdatePassword && (
                  <>
                    <Divider />
                    <VStack space={4}>
                      <VStack space={2}>
                        <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                          Password Saat Ini *
                        </Text>
                        <Input
                          bg={mode === 'dark' ? '#111827' : '#f9fafb'}
                          borderColor={borderColor}
                          color={textColor}
                          placeholderTextColor={subtitleColor}
                          placeholder="Masukkan password saat ini"
                          value={passwordForm.current_password}
                          onChangeText={(text) => setPasswordForm({ ...passwordForm, current_password: text })}
                          type={showPasswords.current_password ? 'text' : 'password'}
                          InputRightElement={
                            <TouchableOpacity
                              onPress={() => setShowPasswords({ ...showPasswords, current_password: !showPasswords.current_password })}
                              style={{ marginRight: 12 }}
                            >
                              {showPasswords.current_password ? 
                                <EyeSlash size={20} color={subtitleColor} /> : 
                                <Eye size={20} color={subtitleColor} />
                              }
                            </TouchableOpacity>
                          }
                          isDisabled={loading}
                        />
                      </VStack>

                      <VStack space={2}>
                        <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                          Password Baru *
                        </Text>
                        <Input
                          bg={mode === 'dark' ? '#111827' : '#f9fafb'}
                          borderColor={borderColor}
                          color={textColor}
                          placeholderTextColor={subtitleColor}
                          placeholder="Minimal 6 karakter"
                          value={passwordForm.new_password}
                          onChangeText={(text) => setPasswordForm({ ...passwordForm, new_password: text })}
                          type={showPasswords.new_password ? 'text' : 'password'}
                          InputRightElement={
                            <TouchableOpacity
                              onPress={() => setShowPasswords({ ...showPasswords, new_password: !showPasswords.new_password })}
                              style={{ marginRight: 12 }}
                            >
                              {showPasswords.new_password ? 
                                <EyeSlash size={20} color={subtitleColor} /> : 
                                <Eye size={20} color={subtitleColor} />
                              }
                            </TouchableOpacity>
                          }
                          isDisabled={loading}
                        />
                      </VStack>

                      <VStack space={2}>
                        <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                          Konfirmasi Password Baru *
                        </Text>
                        <Input
                          bg={mode === 'dark' ? '#111827' : '#f9fafb'}
                          borderColor={borderColor}
                          color={textColor}
                          placeholderTextColor={subtitleColor}
                          placeholder="Ulangi password baru"
                          value={passwordForm.confirm_password}
                          onChangeText={(text) => setPasswordForm({ ...passwordForm, confirm_password: text })}
                          type={showPasswords.confirm_password ? 'text' : 'password'}
                          InputRightElement={
                            <TouchableOpacity
                              onPress={() => setShowPasswords({ ...showPasswords, confirm_password: !showPasswords.confirm_password })}
                              style={{ marginRight: 12 }}
                            >
                              {showPasswords.confirm_password ? 
                                <EyeSlash size={20} color={subtitleColor} /> : 
                                <Eye size={20} color={subtitleColor} />
                              }
                            </TouchableOpacity>
                          }
                          isDisabled={loading}
                        />
                      </VStack>

                      <Button
                        bg={mode === 'dark' ? '#60a5fa' : '#2563eb'}
                        _pressed={{ bg: mode === 'dark' ? '#3b82f6' : '#1d4ed8' }}
                        onPress={handleUpdatePassword}
                        isLoading={loading}
                        isDisabled={loading}
                        leftIcon={<TickCircle size={20} color="#ffffff" />}
                      >
                        <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                          Ubah Password
                        </Text>
                      </Button>
                    </VStack>
                  </>
                )}
              </VStack>

              {/* Warning Notice */}
              <VStack
                bg={mode === 'dark' ? '#7f1d1d' : '#fee2e2'}
                p={4}
                rounded="xl"
                borderWidth={1}
                borderColor={mode === 'dark' ? '#dc2626' : '#ef4444'}
              >
                <HStack space={3} alignItems="flex-start">
                  <Warning2 
                    size={20} 
                    color={mode === 'dark' ? '#fca5a5' : '#dc2626'} 
                    variant="Bold" 
                  />
                  <VStack flex={1}>
                    <Text
                      fontSize="sm"
                      fontFamily="Quicksand-Bold"
                      color={mode === 'dark' ? '#fca5a5' : '#991b1b'}
                    >
                      Peringatan Penting
                    </Text>
                    <Text
                      fontSize="xs"
                      fontFamily="Poppins-Light"
                      color={mode === 'dark' ? '#fecaca' : '#dc2626'}
                      mt={1}
                      lineHeight={20}
                    >
                      • Setelah perubahan, Anda akan logout otomatis{'\n'}
                      • Semua data lokal akan dihapus dari perangkat{'\n'}
                      • Login kembali dengan kredensial baru Anda{'\n'}
                      • Pastikan Anda mengingat username/password baru
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <VStack h={6} />
            </VStack>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={hideModal}
        >
          <Center flex={1} bg="rgba(0,0,0,0.5)" px={5}>
            <VStack
              bg={cardBg}
              p={6}
              rounded="2xl"
              w="full"
              maxW={400}
              space={4}
              alignItems="center"
            >
              <Center
                w={100}
                h={100}
                rounded="full"
                bg={
                  modalConfig.type === 'success' ? (mode === 'dark' ? '#064e3b' : '#d1fae5') :
                  modalConfig.type === 'error' ? (mode === 'dark' ? '#7f1d1d' : '#fee2e2') :
                  modalConfig.type === 'warning' ? (mode === 'dark' ? '#78350f' : '#fef3c7') :
                  (mode === 'dark' ? '#1e3a8a' : '#dbeafe')
                }
              >
                {getModalIcon()}
              </Center>

              <Text
                fontSize="xl"
                fontFamily="Quicksand-Bold"
                color={textColor}
                textAlign="center"
              >
                {modalConfig.title}
              </Text>

              <Text
                fontSize="sm"
                fontFamily="Poppins-Light"
                color={subtitleColor}
                textAlign="center"
                lineHeight={22}
              >
                {modalConfig.message}
              </Text>

              <HStack space={3} w="full">
                {modalConfig.showCancel && (
                  <Button
                    flex={1}
                    variant="outline"
                    borderColor={borderColor}
                    onPress={hideModal}
                  >
                    <Text fontSize="sm" fontFamily="Quicksand-SemiBold" color={textColor}>
                      Batal
                    </Text>
                  </Button>
                )}
                <Button
                  flex={modalConfig.showCancel ? 1 : undefined}
                  bg={
                    modalConfig.type === 'success' ? '#10b981' :
                    modalConfig.type === 'error' ? '#ef4444' :
                    modalConfig.type === 'warning' ? '#f59e0b' :
                    mode === 'dark' ? '#60a5fa' : '#2563eb'
                  }
                  _pressed={{
                    bg: modalConfig.type === 'success' ? '#059669' :
                        modalConfig.type === 'error' ? '#dc2626' :
                        modalConfig.type === 'warning' ? '#d97706' :
                        mode === 'dark' ? '#3b82f6' : '#1d4ed8'
                  }}
                  onPress={() => {
                    if (modalConfig.onConfirm) {
                      modalConfig.onConfirm();
                    } else {
                      hideModal();
                    }
                  }}
                  minW={modalConfig.showCancel ? undefined : 120}
                >
                  <Text fontSize="sm" fontFamily="Quicksand-Bold" color="#ffffff">
                    {modalConfig.confirmText}
                  </Text>
                </Button>
              </HStack>
            </VStack>
          </Center>
        </Modal>
      </VStack>
    </AppScreen>
  );
}
