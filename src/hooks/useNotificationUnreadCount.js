import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getNotificationUnreadCount } from '../services/api/notificationInbox';

export default function useNotificationUnreadCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastValidCount, setLastValidCount] = useState(0);

  const fetchCount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotificationUnreadCount();
      setCount(result);
      setLastValidCount(result);
    } catch (err) {
      setError(err);
      setCount(lastValidCount);
    } finally {
      setLoading(false);
    }
  }, [lastValidCount]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      
      const loadCount = async () => {
        try {
          const result = await getNotificationUnreadCount();
          if (active) {
            setCount(result);
            setLastValidCount(result);
            setError(null);
          }
        } catch (err) {
          if (active) {
            setError(err);
            setCount(lastValidCount);
          }
        }
      };

      void loadCount();

      return () => {
        active = false;
      };
    }, [lastValidCount])
  );

  const refreshCount = useCallback(async () => {
    await fetchCount();
  }, [fetchCount]);

  return { count, loading, error, refreshCount };
}
