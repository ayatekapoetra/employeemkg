import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { Center, Spinner, Text, VStack } from 'native-base';
import { useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { Notification, Refresh } from 'iconsax-react-native';
import { AppScreen, HeaderScreen } from '../../../components/common';
import { COLORS } from '../../../constants/colors';
import {
  getNotificationDetail,
  markNotificationRead,
} from '../../../services/api/notificationInbox';
import { triggerBadgeRefresh } from '../../../components/notifications';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationDetailScreen() {
  const params = useLocalSearchParams();
  const uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid;
  const mode = useSelector((state) => state.themes)?.value || 'light';
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [readError, setReadError] = useState('');

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  const markRead = useCallback(async () => {
    if (!uuid) return;
    setReadError('');
    try {
      const updated = await markNotificationRead(uuid);
      setNotification((current) => updated || (current ? {
        ...current,
        is_read: true,
        read_at: current.read_at || new Date().toISOString(),
      } : current));
      triggerBadgeRefresh();
    } catch (requestError) {
      setReadError(requestError?.response?.data?.message || requestError?.message || 'Gagal memperbarui status baca');
    }
  }, [uuid]);

  const loadDetail = useCallback(async (refresh = false) => {
    if (!uuid) {
      setError('Notifikasi tidak valid.');
      setLoading(false);
      return;
    }
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      setNotification(await getNotificationDetail(uuid));
      await markRead();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [markRead, uuid]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  return (
    <AppScreen>
      <VStack flex={1} bg={backgroundColor}>
        <HeaderScreen title="Detail Notifikasi" showBack onThemes />
        {loading && !notification ? (
          <Center flex={1}><Spinner color="#0A7EA4" /></Center>
        ) : error && !notification ? (
          <Center flex={1} px={8}>
            <Notification size={46} color="#dc2626" />
            <Text mt={3} color={textColor} fontFamily="Quicksand-Bold">Gagal memuat notifikasi</Text>
            <Text mt={1} color={subtitleColor} textAlign="center">{error}</Text>
            <TouchableOpacity onPress={() => loadDetail()}>
              <Text mt={4} color="#0A7EA4" fontFamily="Quicksand-Bold">Coba lagi</Text>
            </TouchableOpacity>
          </Center>
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDetail(true)} />}
          >
            {error ? <Text mb={3} color="red.500">{error}</Text> : null}
            {notification ? (
              <VStack p={5} rounded="xl" bg={cardBg} borderWidth={1} borderColor={borderColor} space={4}>
                <Center alignSelf="flex-start" w={12} h={12} rounded="xl" bg={mode === 'dark' ? '#173446' : '#e0f2fe'}>
                  <Notification size={24} color="#0A7EA4" variant="Bold" />
                </Center>
                <VStack space={2}>
                  <Text fontSize="xl" fontFamily="Quicksand-Bold" color={textColor}>{notification.title || 'Notifikasi'}</Text>
                  <Text fontSize="xs" color={subtitleColor}>{formatDate(notification.created_at || notification.createdAt)}</Text>
                </VStack>
                <Text fontSize="md" lineHeight="lg" color={textColor}>{notification.body || 'Tidak ada detail notifikasi.'}</Text>
              </VStack>
            ) : null}
            {readError ? (
              <TouchableOpacity onPress={markRead}>
                <Center mt={3} p={3} rounded="lg" bg={mode === 'dark' ? '#78350f' : '#fef3c7'} flexDirection="row">
                  <Refresh size={17} color={mode === 'dark' ? '#fef3c7' : '#92400e'} />
                  <Text ml={2} color={mode === 'dark' ? '#fef3c7' : '#92400e'} fontSize="xs">{readError}. Ketuk untuk mencoba lagi.</Text>
                </Center>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        )}
      </VStack>
    </AppScreen>
  );
}
