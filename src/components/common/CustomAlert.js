import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { TickCircle, CloseCircle, InfoCircle, Danger } from 'iconsax-react-native';

const { width } = Dimensions.get('window');

const CustomAlert = ({ 
  visible, 
  type = 'info',
  title, 
  message, 
  buttons = [{ text: 'OK', onPress: () => {} }],
  onDismiss,
  isDark = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <TickCircle size={56} color="#10b981" variant="Bold" />;
      case 'error':
        return <CloseCircle size={56} color="#ef4444" variant="Bold" />;
      case 'warning':
        return <Danger size={56} color="#f59e0b" variant="Bold" />;
      default:
        return <InfoCircle size={56} color="#3b82f6" variant="Bold" />;
    }
  };

  const getBackgroundColor = () => {
    if (isDark) {
      switch (type) {
        case 'success':
          return 'rgba(16, 185, 129, 0.1)';
        case 'error':
          return 'rgba(239, 68, 68, 0.1)';
        case 'warning':
          return 'rgba(245, 158, 11, 0.1)';
        default:
          return 'rgba(59, 130, 246, 0.1)';
      }
    }
    return 'transparent';
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.5)' }]}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onDismiss}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[
                styles.alertBox,
                { 
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  borderColor: getBorderColor(),
                }
              ]}>
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: getBackgroundColor() }
                ]}>
                  {getIcon()}
                </View>

                {title && (
                  <Text style={[
                    styles.title,
                    { color: isDark ? '#f3f4f6' : '#1f2937' }
                  ]}>
                    {title}
                  </Text>
                )}

                {message && (
                  <Text style={[
                    styles.message,
                    { color: isDark ? '#d1d5db' : '#6b7280' }
                  ]}>
                    {message}
                  </Text>
                )}

                <View style={styles.buttonContainer}>
                  {buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        button.style === 'cancel' ? 
                          { backgroundColor: isDark ? '#374151' : '#f3f4f6' } :
                          { backgroundColor: getBorderColor() },
                        buttons.length > 1 && index < buttons.length - 1 && { marginRight: 12 }
                      ]}
                      onPress={() => {
                        button.onPress && button.onPress();
                        onDismiss && onDismiss();
                      }}
                    >
                      <Text style={[
                        styles.buttonText,
                        button.style === 'cancel' && { 
                          color: isDark ? '#d1d5db' : '#4b5563' 
                        }
                      ]}>
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: width - 60,
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default CustomAlert;
