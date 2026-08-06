import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Button, Center, HStack, Spinner, Text, VStack } from 'native-base';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  ArrowRight2,
  CloseCircle,
  Notification,
  Refresh,
  TickCircle,
} from 'iconsax-react-native';
import { AppScreen } from '../../src/components/common';
import { COLORS } from '../../src/constants/colors';
import apiClient from '../../src/services/api/client';
import { API_ENDPOINTS } from '../../src/services/api/endpoints';
import {
  getNotificationInbox,
  getNotificationUnreadCount,
  markAllNotificationsRead,
} from '../../src/services/api/notificationInbox';
import {
  getNotificationDebugInfo,
  registerForPushNotifications,
  requestPermission,
} from '../../src/services/notifications';

const FILTERS = [
  { label: 'Semua', value: 'all' },
  { label: 'Belum dibaca', value: 'unread' },
  { label: 'Sudah dibaca', value: 'read' },
];

function isNotificationRead(item) {
  const read = item?.is_read ?? item?.read;
  return Boolean(item?.read_at || item?.readAt || read === true || read === 1 || read === '1');
}

function notificationId(item) {
  return item?.uuid || item?.id;
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

export default function NotificationsScreen() {
  const router = useRouter();
  const mode = useSelector((state) => state.themes)?.value || 'light';
  const authToken = useSelector((state) => state.auth)?.token;
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState({});
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [inboxError, setInboxError] = useState('');
  const [infoLoading, setInfoLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const backgroundColor = mode === 'dark' ? COLORS.container.dark : COLORS.container.light;
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#9ca3af' : '#6b7280';
  const cardBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const unreadBg = mode === 'dark' ? '#173446' : '#eff9fc';
  const borderColor = mode === 'dark' ? '#374151' : '#e5e7eb';

  const loadUnreadCount = useCallback(async () => {
    try {
      setUnreadCount(await getNotificationUnreadCount());
    } catch {
      // Keep the last known count when this secondary request fails.
    }
  }, []);

  const loadInbox = useCallback(async (page = 1, replace = true) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);
    setInboxError('');
    try {
      const read = filter === 'all' ? undefined : filter === 'read';
      const result = await getNotificationInbox({ page, perPage: 20, read });
      setNotifications((current) => replace ? result.data : [...current, ...result.data]);
      setMeta(result.meta);
    } catch (error) {
      setInboxError(error?.response?.data?.message || error?.message || 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  const loadInfo = useCallback(async () => {
    setInfoLoading(true);
    try {
      setInfo(await getNotificationDebugInfo());
    } catch (error) {
      setMessage(error?.message || 'Gagal memuat status notifikasi');
    } finally {
      setInfoLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInfo();
  }, [loadInfo]);

  useFocusEffect(useCallback(() => {
    loadInbox(1, true);
    loadUnreadCount();
  }, [loadInbox, loadUnreadCount]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadInbox(1, true), loadUnreadCount(), loadInfo()]);
    setRefreshing(false);
  }, [loadInbox, loadInfo, loadUnreadCount]);

  const onLoadMore = () => {
    if (loading || loadingMore) return;
    const currentPage = Number(meta.current_page ?? meta.currentPage ?? 1);
    const lastPage = Number(meta.last_page ?? meta.lastPage ?? currentPage);
    const hasMore = meta.has_more ?? meta.hasMore ?? currentPage < lastPage;
    if (hasMore) loadInbox(currentPage + 1, false);
  };

  const onOpen = (item) => {
    const uuid = notificationId(item);
    if (!uuid) return;
    if (!isNotificationRead(item)) {
      setNotifications((current) => current.map((entry) => (
        notificationId(entry) === uuid ? { ...entry, is_read: true } : entry
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
    }
    router.push(`/notifications/${encodeURIComponent(String(uuid))}`);
  };

  const onMarkAllRead = async () => {
    setBusy(true);
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      setInboxError(error?.response?.data?.message || error?.message || 'Gagal menandai semua notifikasi');
    } finally {
      setBusy(false);
    }
  };

  const onEnable = async () => {
    setBusy(true);
    setMessage('');
    try {
      await requestPermission();
      const result = await registerForPushNotifications({ force: true });
      setMessage(result.ok
        ? 'Notifikasi berhasil didaftarkan ke server.'
        : `Gagal: ${result.reason || result.error || 'unknown'}`);
      await loadInfo();
    } catch (error) {
      setMessage(error?.message || 'Gagal mengaktifkan notifikasi');
    } finally {
      setBusy(false);
    }
  };

  const onTest = async () => {
    if (!authToken || String(authToken).startsWith('demo-token')) {
      setMessage('Login diperlukan untuk test push.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await apiClient.post(API_ENDPOINTS.PUSH.TEST, { app: 'app_emp' });
      setMessage(response?.data?.enabled === false
        ? 'Push flag OFF di server (PUSH_NOTIFICATIONS_ENABLED=false).'
        : response?.data?.message || 'Test push dikirim.');
    } catch (error) {
      setMessage(error?.response?.data?.message || error?.message || 'Gagal kirim test push');
    } finally {
      setBusy(false);
    }
  };

  const granted = Boolean(info?.permission?.granted);
  const hasToken = Boolean(info?.registeredToken || info?.storedToken);

  const listHeader = (
    <VStack space={4} pb={4}>
      <HStack justifyContent="space-between" alignItems="center">
        <VStack>
          <Text fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>Kotak Masuk</Text>
          <Text fontSize="xs" color={subtitleColor}>{unreadCount} belum dibaca</Text>
        </VStack>
        <Button size="sm" variant="ghost" isDisabled={unreadCount === 0} isLoading={busy}
          _text={{ color: '#0A7EA4', fontSize: 'xs' }} onPress={onMarkAllRead}>
          Tandai semua dibaca
        </Button>
      </HStack>

      <HStack space={2}>
        {FILTERS.map((option) => (
          <TouchableOpacity key={option.value} onPress={() => setFilter(option.value)}>
            <Center px={3} py={2} rounded="full"
              bg={filter === option.value ? '#0A7EA4' : cardBg}
              borderWidth={1} borderColor={filter === option.value ? '#0A7EA4' : borderColor}>
              <Text fontSize="xs" color={filter === option.value ? '#fff' : textColor}>
                {option.label}
              </Text>
            </Center>
          </TouchableOpacity>
        ))}
      </HStack>

      {inboxError ? <Text color="red.500" fontSize="sm">{inboxError}</Text> : null}

      <VStack bg={cardBg} p={3} rounded="xl" borderWidth={1} borderColor={borderColor} space={3}>
        <HStack alignItems="center" space={3}>
          <Center w={9} h={9} bg={mode === 'dark' ? '#374151' : '#e0f2fe'} rounded="lg">
            <Notification size={19} color="#0A7EA4" variant="Bold" />
          </Center>
          <VStack flex={1}>
            <Text fontFamily="Quicksand-Bold" color={textColor}>Push Notification</Text>
            {infoLoading ? <Spinner size="sm" alignSelf="flex-start" color="#0A7EA4" /> : (
              <Text fontSize="xs" color={subtitleColor}>
                Izin {granted ? 'aktif' : 'belum aktif'} · Perangkat {hasToken ? 'terdaftar' : 'belum terdaftar'}
              </Text>
            )}
          </VStack>
          {granted && hasToken
            ? <TickCircle size={20} color="#16a34a" variant="Bold" />
            : <CloseCircle size={20} color="#dc2626" variant="Bold" />}
        </HStack>
        {message ? <Text fontSize="xs" color={textColor}>{message}</Text> : null}
        <HStack space={2}>
          <Button flex={1} size="sm" bg="#0A7EA4" isLoading={busy} onPress={onEnable}
            leftIcon={<Refresh size={15} color="#fff" />}>
            Aktifkan / Daftar Ulang
          </Button>
          <Button flex={1} size="sm" variant="outline" borderColor="#0A7EA4" isLoading={busy}
            _text={{ color: '#0A7EA4' }} onPress={onTest}>
            Test Push
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );

  return (
    <AppScreen>
      <VStack flex={1} bg={backgroundColor}>
        <HStack px={4} py={3} alignItems="center" space={3}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text fontSize="lg" fontFamily="Quicksand-Bold" color={textColor}>Notifikasi</Text>
        </HStack>

        <FlatList
          data={notifications}
          keyExtractor={(item, index) => String(notificationId(item) || index)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
          ListHeaderComponent={listHeader}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => {
            const read = isNotificationRead(item);
            return (
              <TouchableOpacity onPress={() => onOpen(item)}>
                <HStack mb={2} p={3} rounded="xl" bg={read ? cardBg : unreadBg}
                  borderWidth={1} borderColor={read ? borderColor : '#7dd3fc'} space={3} alignItems="center">
                  <Center w={10} h={10} rounded="full" bg={read ? borderColor : '#0A7EA4'}>
                    <Notification size={19} color={read ? subtitleColor : '#fff'} variant="Bold" />
                  </Center>
                  <VStack flex={1} space={1}>
                    <HStack alignItems="center" space={2}>
                      {!read ? <Center w={2} h={2} rounded="full" bg="#0A7EA4" /> : null}
                      <Text flex={1} numberOfLines={1} color={textColor}
                        fontFamily={read ? 'Quicksand-Regular' : 'Quicksand-Bold'}>
                        {item.title || item.subject || 'Notifikasi'}
                      </Text>
                    </HStack>
                    <Text numberOfLines={2} fontSize="xs" color={subtitleColor}>
                      {item.body || item.message || item.content || 'Buka untuk melihat detail.'}
                    </Text>
                    <Text fontSize="2xs" color={subtitleColor}>
                      {formatDate(item.created_at || item.createdAt || item.sent_at)}
                    </Text>
                  </VStack>
                  <ArrowRight2 size={17} color={subtitleColor} />
                </HStack>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={loading ? (
            <Center py={10}><Spinner color="#0A7EA4" /></Center>
          ) : (
            <Center py={10}>
              <Notification size={38} color={subtitleColor} />
              <Text mt={2} color={subtitleColor}>Belum ada notifikasi.</Text>
            </Center>
          )}
          ListFooterComponent={loadingMore ? <Spinner my={4} color="#0A7EA4" /> : null}
        />
      </VStack>
    </AppScreen>
  );
}
