import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Notification } from 'iconsax-react-native';
import { useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import useNotificationUnreadCount from '../../hooks/useNotificationUnreadCount';
import { COLORS } from '../../constants/colors';

export default function NotificationButton({ onPress, size = 24, showBadge = true, maxBadgeValue = 99 }) {
  const mode = useSelector((state) => state.themes)?.value || 'light';
  const isDark = mode === 'dark';
  const { count } = useNotificationUnreadCount();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    }
  };

  const iconColor = isDark ? '#E5E7EB' : '#1F2937';
  const displayCount = count > maxBadgeValue ? `${maxBadgeValue}+` : String(count);
  const shouldShowBadge = showBadge && count > 0;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.button}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      <View style={styles.iconContainer}>
        <Notification size={size} variant="Bulk" color={iconColor} style={styles.icon} />
        {shouldShowBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{displayCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  icon: {
    backgroundColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
