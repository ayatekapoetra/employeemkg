import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { Center, HStack, Modal, Text, VStack } from 'native-base';
import { ShieldSecurity, TickCircle } from 'iconsax-react-native';

const OtpVerificationCard = ({
  mode = 'light',
  title = 'Verifikasi OTP',
  description = 'Masukkan OTP yang diterima untuk melanjutkan proses verifikasi.',
  value,
  onChangeText,
  onVerify,
  verifying = false,
  disabled = false,
  expiresAt = null,
  errorMessage = '',
  placeholder = 'Contoh: 482913',
  maxLength = 6,
  buttonLabel = 'Verifikasi OTP',
  isOpen = false,
  onClose,
  onOpen,
  verified = false,
  onResend,
  resending = false,
  resendAvailableAt = null,
  requestCount = 0,
  maxRequest = 5
}) => {
  const inputRef = useRef(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [resendRemainingMs, setResendRemainingMs] = useState(0);
  const textColor = mode === 'dark' ? '#F5F5F5' : '#2f313e';
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';
  const primaryColor = mode === 'dark' ? '#60a5fa' : '#2563eb';
  const mutedBg = mode === 'dark' ? '#0f172a' : '#eff6ff';

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      return;
    }

    const getRemaining = () => {
      const target = new Date(expiresAt).getTime();
      if (Number.isNaN(target)) return 0;
      return Math.max(0, target - Date.now());
    };

    setRemainingMs(getRemaining());

    const timer = setInterval(() => {
      setRemainingMs(getRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (!resendAvailableAt) {
      setResendRemainingMs(0);
      return;
    }

    const getRemaining = () => {
      const target = new Date(resendAvailableAt).getTime();
      if (Number.isNaN(target)) return 0;
      return Math.max(0, target - Date.now());
    };

    setResendRemainingMs(getRemaining());

    const timer = setInterval(() => {
      setResendRemainingMs(getRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [resendAvailableAt]);

  const otpSlots = useMemo(() => {
    const current = String(value || '');
    return Array.from({ length: maxLength }, (_, index) => current[index] || '');
  }, [value, maxLength]);

  const formatRemaining = (milliseconds) => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isExpired = Boolean(expiresAt) && remainingMs <= 0;
  const resendLocked = Boolean(resendAvailableAt) && resendRemainingMs > 0;
  const canResend = Boolean(onResend) && isExpired && !resendLocked && !resending;

  const formatDateTime = (input) => {
    if (!input) return '-';

    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return input;

    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <VStack
        bg={cardBg}
        p={4}
        rounded="2xl"
        borderWidth={1}
        borderColor={borderColor}
        space={4}
      >
        <HStack alignItems="center" space={3}>
          <Center
            w={10}
            h={10}
            rounded="lg"
            bg={mode === 'dark' ? '#1e3a8a' : '#dbeafe'}
          >
            <ShieldSecurity size={20} color={primaryColor} />
          </Center>
          <VStack flex={1}>
            <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
              {title}
            </Text>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              {description}
            </Text>
          </VStack>
        </HStack>

        {expiresAt ? (
          <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
            OTP aktif sampai {formatDateTime(expiresAt)}.
          </Text>
        ) : null}

        <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
          Pengiriman OTP: {Math.min(requestCount || 0, maxRequest)}/{maxRequest} dalam 24 jam
        </Text>

        {expiresAt ? (
          <Text fontSize="xs" fontFamily="Poppins-Light" color={isExpired ? '#ef4444' : subtitleColor}>
            Countdown OTP: {formatRemaining(remainingMs)}
          </Text>
        ) : null}

        {resendLocked ? (
          <Text fontSize="xs" fontFamily="Poppins-Light" color="#ef4444">
            Kirim ulang tersedia dalam {formatRemaining(resendRemainingMs)}
          </Text>
        ) : null}

        {verified ? (
          <Text fontSize="xs" fontFamily="Poppins-Light" color="#16a34a">
            OTP sudah diverifikasi.
          </Text>
        ) : null}

        {errorMessage ? (
          <Text fontSize="xs" fontFamily="Poppins-Light" color="#ef4444">
            {errorMessage}
          </Text>
        ) : null}

        <TouchableOpacity onPress={onOpen} disabled={!onOpen}>
          <Center
            px={4}
            py={3}
            rounded="xl"
            bg={primaryColor}
          >
            <Text fontFamily="Quicksand-Bold" fontSize="sm" color="#ffffff">
              {verified ? 'Buka Ulang OTP' : 'Masukkan OTP di Modal'}
            </Text>
          </Center>
        </TouchableOpacity>

        {isExpired ? (
          <TouchableOpacity onPress={canResend ? onResend : null} disabled={!canResend}>
            <Center
              px={4}
              py={3}
              rounded="xl"
              bg={canResend ? (mode === 'dark' ? '#14532d' : '#16a34a') : (mode === 'dark' ? '#374151' : '#cbd5e1')}
              opacity={canResend ? 1 : 0.8}
            >
              <Text fontFamily="Quicksand-Bold" fontSize="sm" color="#ffffff">
                {resending ? 'Mengirim Ulang OTP...' : resendLocked ? 'Batas Kirim OTP Tercapai' : 'Kirim Ulang OTP'}
              </Text>
            </Center>
          </TouchableOpacity>
        ) : null}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <Modal.Content maxWidth="380" bg={cardBg} borderRadius={20}>
          <Modal.CloseButton />
          <Modal.Header bg={cardBg} borderBottomWidth={1} borderBottomColor={borderColor}>
            <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
              {title}
            </Text>
          </Modal.Header>
          <Modal.Body bg={cardBg}>
            <VStack space={4}>
              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
                {description}
              </Text>

              <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}>
                <VStack space={3}>
                  <HStack justifyContent="space-between">
                    {otpSlots.map((digit, index) => (
                      <Center
                        key={`otp-slot-${index}`}
                        w="14%"
                        minW="44px"
                        maxW="52px"
                        h="52px"
                        rounded="xl"
                        bg={mutedBg}
                        borderWidth={1}
                        borderColor={errorMessage ? '#ef4444' : borderColor}
                      >
                        <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>
                          {digit || '-'}
                        </Text>
                      </Center>
                    ))}
                  </HStack>
                  <TextInput
                    ref={inputRef}
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      width: 1,
                      height: 1,
                    }}
                    placeholder={placeholder}
                    placeholderTextColor={subtitleColor}
                    keyboardType="number-pad"
                    maxLength={maxLength}
                    value={value}
                    onChangeText={onChangeText}
                    autoFocus={isOpen}
                  />
                </VStack>
              </TouchableOpacity>

              {expiresAt ? (
                <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center">
                  OTP aktif sampai {formatDateTime(expiresAt)}.
                </Text>
              ) : null}

              {expiresAt ? (
                <Text fontSize="sm" fontFamily="Quicksand-Bold" color={isExpired ? '#ef4444' : primaryColor} textAlign="center">
                  {isExpired ? 'OTP telah kedaluwarsa' : `Sisa waktu: ${formatRemaining(remainingMs)}`}
                </Text>
              ) : null}

              <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor} textAlign="center">
                Pengiriman OTP: {Math.min(requestCount || 0, maxRequest)}/{maxRequest} dalam 24 jam
              </Text>

              {resendLocked ? (
                <Text fontSize="xs" fontFamily="Poppins-Light" color="#ef4444" textAlign="center">
                  Kirim ulang tersedia dalam {formatRemaining(resendRemainingMs)}
                </Text>
              ) : null}

              {errorMessage ? (
                <Text fontSize="xs" fontFamily="Poppins-Light" color="#ef4444" textAlign="center">
                  {errorMessage}
                </Text>
              ) : null}
            </VStack>
          </Modal.Body>
          <Modal.Footer bg={cardBg} borderTopWidth={1} borderTopColor={borderColor}>
            <TouchableOpacity onPress={disabled || isExpired ? null : onVerify} disabled={disabled || isExpired} style={{ width: '100%' }}>
              <Center
                px={4}
                py={3}
                rounded="xl"
                bg={disabled || isExpired ? (mode === 'dark' ? '#374151' : '#cbd5e1') : primaryColor}
                opacity={disabled || isExpired ? 0.8 : 1}
              >
                <HStack alignItems="center" space={2}>
                  <TickCircle size={18} color="#ffffff" />
                  <Text fontFamily="Quicksand-Bold" fontSize="sm" color="#ffffff">
                    {isExpired ? 'OTP Kedaluwarsa' : verifying ? 'Memverifikasi...' : buttonLabel}
                  </Text>
                </HStack>
              </Center>
            </TouchableOpacity>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
};

export default OtpVerificationCard;
