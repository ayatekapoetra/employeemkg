import { useCallback, useState, useEffect } from 'react';
import { AppState, Platform, DeviceEventEmitter } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useSelector } from 'react-redux';
import { getNotificationUnreadCount } from '../services/api/notificationInbox';

const NOTIFICATION_BADGE_EVENT = 'notification_badge_refresh';

export default function useNotificationUnreadCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastValidCount, setLastValidCount] = useState(0);
  
  const authToken = useSelector((state) => state.auth?.token);
  const hasAuthToken = Boolean(authToken && !String(authToken).startsWith('demo-token'));

  const fetchCount = useCallback(async () => {
    if (!hasAuthToken) {
      setCount(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await getNotificationUnreadCount();
      setCount(result);
      setLastValidCount(result);

      if (Platform.OS === 'ios') {
        const permissions = await Notifications.getPermissionsAsync();
        if (permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
          await Notifications.setBadgeCountAsync(result);
        }
      }
    } catch (err) {
      setError(err);
      setCount(lastValidCount);
    } finally {
      setLoading(false);
    }
  }, [hasAuthToken, lastValidCount]);

  useEffect(() => {
    let active = true;

    const loadCount = async () => {
      if (!active) return;
      await fetchCount();
    };

    void loadCount();

    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && active) {
        void fetchCount();
      }
    });

    const badgeRefreshSubscription = DeviceEventEmitter.addListener(NOTIFICATION_BADGE_EVENT, () => {
      if (active) {
        void fetchCount();
      }
    });

    return () => {
      active = false;
      appStateSubscription?.remove();
      badgeRefreshSubscription?.remove();
    };
  }, [fetchCount, authToken]);

  const refreshCount = useCallback(async () => {
    await fetchCount();
  }, [fetchCount]);

  return { count, loading, error, refreshCount };
}

export function triggerBadgeRefresh() {
  DeviceEventEmitter.emit(NOTIFICATION_BADGE_EVENT);
}
