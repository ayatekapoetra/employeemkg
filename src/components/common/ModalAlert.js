import React from 'react';
import { Modal, VStack, HStack, Text, Button, Center, Box, Pressable, IconButton } from 'native-base';
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
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <TickCircle size={32} color="#10B981" />;
      case 'error':
        return <Danger size={32} color="#EF4444" />;
      case 'warning':
        return <Warning2 size={32} color="#F59E0B" />;
      default:
        return <InfoCircle size={32} color="#3B82F6" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'success':
        return '#D1FAE5';
      case 'error':
        return '#FEE2E2';
      case 'warning':
        return '#FEF3C7';
      default:
        return '#DBEAFE';
    }
  };

  const renderButtons = () => {
    if (buttons.length === 0) {
      return (
        <Button 
          onPress={onClose}
          bg="#3B82F6"
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
            bg={button.type === 'destructive' ? '#EF4444' : (button.type === 'cancel' ? '#6B7280' : '#3B82F6')}
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
        <View style={styles.modalContainer}>
          {/* Header with Icon */}
          <VStack space={4} alignItems="center" mb={4}>
            <Box
              width={64}
              height={64}
              rounded="full"
              bg={getIconBgColor()}
              justifyContent="center"
              alignItems="center"
              style={styles.iconContainer}>
              {getIcon()}
            </Box>
            
            <Text
              fontSize={20}
              fontFamily="Quicksand-Bold"
              color="#1F2937"
              textAlign="center">
              {title}
            </Text>
          </VStack>

          {/* Message */}
          <Text
            fontSize={14}
            fontFamily="Quicksand-Regular"
            color="#6B7280"
            textAlign="center"
            mb={6}
            lineHeight={20}>
            {message}
          </Text>

          {/* Buttons */}
          {renderButtons()}

          {/* Close Button */}
          {showCloseButton && (
            <Pressable
              onPress={onClose}
              style={styles.closeButton}>
              <CloseSquare size={20} color="#6B7280" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});

export default ModalAlert;