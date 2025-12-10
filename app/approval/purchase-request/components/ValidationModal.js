import { CloseCircle, TickCircle, Warning2, InfoCircle } from 'iconsax-react-native';
import { Button, HStack, Modal, Text, VStack } from 'native-base';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ValidationModal({
  visible,
  type = 'confirm',
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  mode = 'light',
  showCancel = true,
  loading = false,
}) {
  const isDark = mode === 'dark';

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: TickCircle,
          iconColor: isDark ? '#6ee7b7' : '#10b981',
          iconBg: isDark ? '#065f46' : '#d1fae5',
          headerBg: isDark ? '#065f46' : '#d1fae5',
          headerText: isDark ? '#ffffff' : '#065f46',
        };
      case 'error':
        return {
          icon: CloseCircle,
          iconColor: isDark ? '#fca5a5' : '#ef4444',
          iconBg: isDark ? '#991b1b' : '#fee2e2',
          headerBg: isDark ? '#991b1b' : '#fee2e2',
          headerText: isDark ? '#ffffff' : '#991b1b',
        };
      case 'warning':
        return {
          icon: Warning2,
          iconColor: isDark ? '#fbbf24' : '#f59e0b',
          iconBg: isDark ? '#92400e' : '#fef3c7',
          headerBg: isDark ? '#92400e' : '#fef3c7',
          headerText: isDark ? '#ffffff' : '#92400e',
        };
      default:
        return {
          icon: InfoCircle,
          iconColor: isDark ? '#60a5fa' : '#3b82f6',
          iconBg: isDark ? '#1e40af' : '#dbeafe',
          headerBg: isDark ? '#1e40af' : '#dbeafe',
          headerText: isDark ? '#ffffff' : '#1e40af',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Modal isOpen={visible} onClose={onCancel} size="lg">
      <Modal.Content
        maxWidth={SCREEN_WIDTH * 0.9}
        bg={isDark ? '#1f2937' : '#ffffff'}
        rounded="2xl"
      >
        <VStack space={0}>
          <VStack
            bg={config.headerBg}
            p={6}
            roundedTop="2xl"
            alignItems="center"
            space={3}
          >
            <VStack
              bg={isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'}
              p={4}
              rounded="full"
            >
              <Icon size={48} color={config.iconColor} variant="Bold" />
            </VStack>
            <Text
              fontSize="xl"
              fontFamily="Quicksand-Bold"
              color={config.headerText}
              textAlign="center"
            >
              {title}
            </Text>
          </VStack>

          <VStack p={6} space={4}>
            <Text
              fontSize="sm"
              fontFamily="Poppins-Regular"
              color={isDark ? '#e5e7eb' : '#374151'}
              textAlign="center"
              lineHeight="md"
            >
              {message}
            </Text>

            <HStack space={3} justifyContent="center">
              {showCancel && (
                <Button
                  flex={1}
                  variant="outline"
                  borderColor={isDark ? '#4b5563' : '#d1d5db'}
                  rounded="xl"
                  py={3}
                  onPress={onCancel}
                  _text={{
                    fontFamily: 'Quicksand-SemiBold',
                    fontSize: 'sm',
                    color: isDark ? '#9ca3af' : '#6b7280',
                  }}
                  _pressed={{
                    bg: isDark ? '#374151' : '#f3f4f6',
                  }}
                >
                  {cancelText}
                </Button>
              )}
              <Button
                flex={showCancel ? 1 : undefined}
                bg={
                  type === 'success'
                    ? isDark ? '#10b981' : '#059669'
                    : type === 'error'
                    ? isDark ? '#ef4444' : '#dc2626'
                    : type === 'warning'
                    ? isDark ? '#f59e0b' : '#d97706'
                    : isDark ? '#3b82f6' : '#2563eb'
                }
                rounded="xl"
                py={3}
                onPress={onConfirm}
                isLoading={loading}
                isLoadingText="Memproses..."
                _text={{
                  fontFamily: 'Quicksand-Bold',
                  fontSize: 'sm',
                  color: '#ffffff',
                }}
                _pressed={{
                  bg:
                    type === 'success'
                      ? isDark ? '#059669' : '#047857'
                      : type === 'error'
                      ? isDark ? '#dc2626' : '#b91c1c'
                      : type === 'warning'
                      ? isDark ? '#d97706' : '#b45309'
                      : isDark ? '#2563eb' : '#1e40af',
                }}
              >
                {confirmText}
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Modal.Content>
    </Modal>
  );
}
