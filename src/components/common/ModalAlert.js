import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Modal, VStack, HStack, Text, Button, Box, Pressable } from 'native-base';
import { View, StyleSheet } from 'react-native';
import { Danger, TickCircle, InfoCircle, Warning2, CloseSquare } from 'iconsax-react-native';

const ModalAlert = ({ 
  isVisible, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  buttons = [],
  showCloseButton = true 
}) => {
  const mode = useSelector(state => state.themes?.value) || 'light';

  const palette = useMemo(() => {
    const isDark = mode === 'dark';
    const tone = {
      success: { icon: '#34D399', bg: isDark ? '#064E3B' : '#D1FAE5' },
      error: { icon: '#F87171', bg: isDark ? '#7F1D1D' : '#FEE2E2' },
      warning: { icon: '#FBBF24', bg: isDark ? '#78350F' : '#FEF3C7' },
      info: { icon: '#60A5FA', bg: isDark ? '#1E3A8A' : '#DBEAFE' },
    };

    return {
      text: isDark ? '#E5E7EB' : '#111827',
      subtitle: isDark ? '#CBD5E1' : '#4B5563',
      surface: isDark ? '#0F172A' : '#FFFFFF',
      border: isDark ? '#1F2937' : '#E5E7EB',
      accent: isDark ? '#60A5FA' : '#3B82F6',
      tone,
    };
  }, [mode]);
  const getIcon = () => {
    const colors = palette.tone[type] || palette.tone.info;
    switch (type) {
      case 'success':
        return <TickCircle size={32} color={colors.icon} />;
      case 'error':
        return <Danger size={32} color={colors.icon} />;
      case 'warning':
        return <Warning2 size={32} color={colors.icon} />;
      default:
        return <InfoCircle size={32} color={colors.icon} />;
    }
  };

  const getIconBgColor = () => {
    const colors = palette.tone[type] || palette.tone.info;
    return colors.bg;
  };

  const renderButtons = () => {
    if (buttons.length === 0) {
      return (
        <Button 
          onPress={onClose}
          bg={palette.accent}
          _text={{ color: 'white', fontFamily: 'Quicksand-Bold' }}
          rounded="lg"
          size="md">
          OK
        </Button>
      );
    }

    return (
      <HStack space={3}>
        {buttons.map((button, index) => (
          <Button
            key={index}
            onPress={button.onPress || onClose}
            bg={button.type === 'destructive' 
              ? '#EF4444' 
              : (button.type === 'cancel' 
                ? (mode === 'dark' ? '#4B5563' : '#6B7280') 
                : palette.accent)}
            _text={{ 
              color: 'white', 
              fontFamily: 'Quicksand-Bold',
              fontSize: button.size === 'sm' ? 12 : 14
            }}
            rounded="lg"
            size={button.size || 'md'}
            flex={button.flex || 1}>
            {button.text}
          </Button>
        ))}
      </HStack>
    );
  };

  return (
    <Modal
      isOpen={isVisible}
      onClose={onClose}
      animationType="slide"
      transparent={true}>
      <View style={styles.overlay}>        
        <View style={[styles.modalContainer, { backgroundColor: palette.surface, borderColor: palette.border }]}>          
          <Box style={[styles.accentBar, { backgroundColor: palette.accent }]} />
          {/* Header with Icon */}
          <VStack space={3} alignItems="center" mb={3}>
            <Box
              width={36}
              height={36}
              rounded="full"
              bg={getIconBgColor()}
              justifyContent="center"
              alignItems="center"
              style={styles.iconContainer}>
              {getIcon()}
            </Box>

            <Text
              fontSize={18}
              fontFamily="Quicksand-Bold"
              color={palette.text}
              textAlign="center">
              {title}
            </Text>
          </VStack>

          {/* Message */}
          <Text
            fontSize={13}
            fontFamily="Quicksand-Regular"
            color={palette.subtitle}
            textAlign="center"
            mb={5}
            lineHeight={19}>
            {message}
          </Text>

          {/* Buttons */}
          {renderButtons()}

          {/* Close Button */}
            {showCloseButton && (
              <Pressable
                onPress={onClose}
                style={styles.closeButton}>
              <CloseSquare size={20} color={palette.subtitle} />
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 16,
    padding: 20,
    width: '78%',
    maxWidth: 300,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  iconContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});

export default ModalAlert;
