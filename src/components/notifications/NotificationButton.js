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

  const badgeColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = '#FFFFFF';
  const iconColor = isDark ? '#F5F5F5' : '#2f313e';

  const displayCount = count > maxBadgeValue ? `${maxBadgeValue}+` : String(count);
  const shouldShowBadge = showBadge && count > 0;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.button}>
      <View style={styles.iconContainer}>
        <Notification size={size} variant="Bulk" color={iconColor} />
        {shouldShowBadge && (
          <View style={[styles.badge, { backgroundColor: badgeColor === '#1f2937' ? '#DC2626' : '#DC2626' }]}>
            <Text style={[styles.badgeText, { color: textColor }]}>{displayCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
