import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Button, Center, HStack, Spinner, Text, VStack } from 'native-base';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { ArrowRight2, Notification } from 'iconsax-react-native';
import { AppScreen, HeaderScreen } from '../../../components/common';
import { COLORS } from '../../../constants/colors';
import {
  getNotificationInbox,
  getNotificationUnreadCount,
  markAllNotificationsRead,
} from '../../../services/api/notificationInbox';
import { triggerBadgeRefresh } from '../../../components/notifications';

const FILTERS = [
  { label: 'Semua', value: 'all' },
  { label: 'Belum dibaca', value: 'unread' },
  { label: 'Sudah dibaca', value: 'read' },
];

function notificationId(item) {
  return item?.uuid || item?.id;
}

function isNotificationRead(item) {
  const read = item?.is_read ?? item?.read;
  return Boolean(item?.read_at || item?.readAt || read === true || read === 1 || read === '1');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationListScreen() {
  const router = useRouter();
  const mode = useSelector((state) => state.themes)?.value || 'light';
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState({});
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const unreadBg = mode === 'dark' ? '#173446' : '#eff9fc';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  const loadInbox = useCallback(async (page = 1, replace = true) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);
    setError('');

    try {
      const read = filter === 'all' ? undefined : filter === 'read';
      const [inbox, count] = await Promise.all([
        getNotificationInbox({ page, perPage: 20, read }),
        page === 1 ? getNotificationUnreadCount() : Promise.resolve(null),
      ]);

      setNotifications((current) => {
        if (replace) return inbox.data;
        const existing = new Set(current.map((item) => String(notificationId(item))));
        return [...current, ...inbox.data.filter((item) => !existing.has(String(notificationId(item))))];
      });
      setMeta(inbox.meta);
      if (count !== null) setUnreadCount(count);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => {
    void loadInbox(1, true);
  }, [loadInbox]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInbox(1, true);
    setRefreshing(false);
  }, [loadInbox]);

  const onLoadMore = () => {
    if (loading || loadingMore) return;
    const currentPage = Number(meta.current_page ?? meta.currentPage ?? 1);
    const lastPage = Number(meta.last_page ?? meta.lastPage ?? currentPage);
    if (currentPage < lastPage) void loadInbox(currentPage + 1, false);
  };

  const onOpen = (item) => {
    const uuid = notificationId(item);
    if (!uuid) return;
    if (!isNotificationRead(item)) {
      setNotifications((current) => current.map((entry) => (
        notificationId(entry) === uuid
          ? { ...entry, is_read: true, read_at: entry.read_at || new Date().toISOString() }
          : entry
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
      triggerBadgeRefresh();
    }
    router.push(`/notifications/${encodeURIComponent(String(uuid))}`);
  };

  const onMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    setError('');
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      triggerBadgeRefresh();
      if (filter === 'unread') setNotifications([]);
      else setNotifications((current) => current.map((item) => ({
        ...item,
        is_read: true,
        read_at: item.read_at || new Date().toISOString(),
      })));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Gagal menandai semua notifikasi');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <AppScreen>
      <VStack flex={1} bg={backgroundColor}>
        <HeaderScreen title="Notifikasi" showBack onThemes />
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => String(notificationId(item) || index)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={(
            <VStack space={4} pb={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>Kotak Masuk</Text>
                  <Text fontSize="xs" color={subtitleColor}>{unreadCount} belum dibaca</Text>
                </VStack>
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={unreadCount === 0}
                  isLoading={markingAll}
                  _text={{ color: '#0A7EA4', fontSize: 'xs' }}
                  onPress={onMarkAllRead}
                >
                  Tandai semua dibaca
                </Button>
              </HStack>

              <HStack space={2}>
                {FILTERS.map((option) => (
                  <TouchableOpacity key={option.value} onPress={() => setFilter(option.value)}>
                    <Center
                      px={3}
                      py={2}
                      rounded="full"
                      bg={filter === option.value ? '#0A7EA4' : cardBg}
                      borderWidth={1}
                      borderColor={filter === option.value ? '#0A7EA4' : borderColor}
                    >
                      <Text fontSize="xs" color={filter === option.value ? '#fff' : textColor}>{option.label}</Text>
                    </Center>
                  </TouchableOpacity>
                ))}
              </HStack>

              {error ? (
                <TouchableOpacity onPress={() => loadInbox(1, true)}>
                  <Text color="red.500" fontSize="sm">{error}. Ketuk untuk mencoba lagi.</Text>
                </TouchableOpacity>
              ) : null}
            </VStack>
          )}
          renderItem={({ item }) => {
            const read = isNotificationRead(item);
            return (
              <TouchableOpacity onPress={() => onOpen(item)}>
                <HStack
                  mb={2}
                  p={3}
                  rounded="xl"
                  bg={read ? cardBg : unreadBg}
                  borderWidth={1}
                  borderColor={read ? borderColor : '#7dd3fc'}
                  space={3}
                  alignItems="center"
                >
                  <Center w={10} h={10} rounded="full" bg={read ? borderColor : '#0A7EA4'}>
                    <Notification size={19} color={read ? subtitleColor : '#fff'} variant="Bold" />
                  </Center>
                  <VStack flex={1} space={1}>
                    <HStack alignItems="center" space={2}>
                      {!read ? <Center w={2} h={2} rounded="full" bg="#0A7EA4" /> : null}
                      <Text flex={1} numberOfLines={1} color={textColor} fontFamily={read ? 'Quicksand-Regular' : 'Quicksand-Bold'}>
                        {item.title || 'Notifikasi'}
                      </Text>
                    </HStack>
                    <Text numberOfLines={2} fontSize="xs" color={subtitleColor}>{item.body || 'Buka untuk melihat detail.'}</Text>
                    <Text fontSize="2xs" color={subtitleColor}>{formatDate(item.created_at || item.createdAt)}</Text>
                  </VStack>
                  <ArrowRight2 size={17} color={subtitleColor} />
                </HStack>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={loading ? (
            <Center py={12}><Spinner color="#0A7EA4" /></Center>
          ) : (
            <Center py={12}>
              <Notification size={42} color={subtitleColor} />
              <Text mt={2} color={subtitleColor}>Belum ada notifikasi.</Text>
            </Center>
          )}
          ListFooterComponent={loadingMore ? <Spinner my={4} color="#0A7EA4" /> : null}
        />
      </VStack>
    </AppScreen>
  );
}
