import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

const APP_CODE = 'app_emp';
const STORAGE_TOKEN_KEY = '@push_expo_token';
const STORAGE_REGISTERED_KEY = '@push_registered_token';
const processedNotificationResponses = new Set();
let registrationQueue = Promise.resolve();

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId ||
    null
  );
}

function getPlatform() {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'unknown';
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0A7EA4',
  });
}

export async function getPermissionStatus() {
  const settings = await Notifications.getPermissionsAsync();
  return settings;
}

export async function requestPermission(forceRequest = false) {
  if (!Device.isDevice) {
    return { granted: false, reason: 'not_device' };
  }

  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return { granted: true, status: current };
  }

  // If forceRequest is true, always show permission dialog (for initial app launch)
  // Otherwise, only show if status is UNDETERMINED (first time)
  if (!forceRequest && current.status !== Notifications.PermissionStatus.UNDETERMINED) {
    return { granted: false, status: current };
  }

  const requested = await Notifications.requestPermissionsAsync();
  const granted =
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

  return { granted, status: requested };
}

/**
 * Request notification permission on initial app launch.
 * This will always show the permission dialog if not yet granted.
 */
export async function requestPermissionOnAppLaunch() {
  return requestPermission(true);
}

export async function getExpoPushToken() {
  const projectId = getProjectId();
  if (!projectId) {
    throw new Error('EAS projectId tidak ditemukan di app config');
  }

  await withTimeout(
    Notifications.getDevicePushTokenAsync(),
    15000,
    'Timeout saat mengambil token FCM perangkat'
  );
  const tokenResponse = await withTimeout(
    Notifications.getExpoPushTokenAsync({ projectId }),
    20000,
    'Timeout saat mengambil Expo push token'
  );
  return tokenResponse?.data || null;
}

/**
 * Register Expo push token to ops-be → gateway.
 * Always upserts to server (no local skip) so empty server table can recover.
 * @param {{ force?: boolean, authenticated?: boolean }} [options]
 */
function getRegistrationPayload(expoPushToken) {
  return {
    expo_push_token: expoPushToken,
    app: APP_CODE,
    platform: getPlatform(),
    device_name: Device.modelName || Device.deviceName || null,
    app_version: Application.nativeApplicationVersion || null,
  };
}

async function upsertPushToken(expoPushToken, authenticated) {
  const endpoint = authenticated
    ? API_ENDPOINTS.PUSH.REGISTER
    : API_ENDPOINTS.PUSH.REGISTER_PUBLIC;
  const config = authenticated ? undefined : { skipAuth: true };

  const response = await apiClient.post(endpoint, getRegistrationPayload(expoPushToken), config);
  await AsyncStorage.setItem(STORAGE_TOKEN_KEY, expoPushToken);
  await AsyncStorage.setItem(STORAGE_REGISTERED_KEY, expoPushToken);
  return response;
}

async function performPushRegistration(options = {}) {
  try {
    const permission = await requestPermission();
    if (!permission.granted) {
      return { ok: false, reason: 'permission_denied', permission };
    }

    const expoPushToken = await getExpoPushToken();
    if (!expoPushToken) {
      return { ok: false, reason: 'no_token' };
    }

    const storedAuthToken = await AsyncStorage.getItem('@token');
    const authenticated = options.authenticated !== undefined
      ? options.authenticated
      : Boolean(storedAuthToken && !storedAuthToken.startsWith('demo-token'));
    const response = await upsertPushToken(expoPushToken, authenticated);

    return {
      ok: true,
      token: expoPushToken,
      forced: options.force === true,
      server: response?.data?.data || null,
    };
  } catch (error) {
    console.warn('[push] register failed:', error?.response?.data || error?.message || error);
    // Clear stale "registered" marker so UI does not show false success
    try {
      await AsyncStorage.removeItem(STORAGE_REGISTERED_KEY);
    } catch (e) {
      // ignore
    }
    return {
      ok: false,
      reason: 'error',
      error: error?.response?.data?.message || error?.message,
    };
  }
}

export function registerForPushNotifications(options = {}) {
  const registration = registrationQueue.then(
    () => performPushRegistration(options),
    () => performPushRegistration(options)
  );
  registrationQueue = registration.then(() => undefined, () => undefined);
  return registration;
}

export async function rebindPushTokenToAnonymous() {
  try {
    let expoPushToken = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
    if (!expoPushToken) {
      const permission = await getPermissionStatus();
      const granted = permission.granted
        || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
      if (!granted) return { ok: false, reason: 'no_token' };
      expoPushToken = await getExpoPushToken();
    }
    if (!expoPushToken) return { ok: false, reason: 'no_token' };

    await upsertPushToken(expoPushToken, false);
    return { ok: true, token: expoPushToken };
  } catch (error) {
    console.warn('[push] anonymous rebind failed:', error?.response?.data || error?.message || error);
    return { ok: false, reason: 'error', error: error?.response?.data?.message || error?.message };
  }
}

export async function unregisterForPushNotifications(options = {}) {
  try {
    const expoPushToken =
      options.token || (await AsyncStorage.getItem(STORAGE_TOKEN_KEY));

    if (expoPushToken) {
      await apiClient.post(API_ENDPOINTS.PUSH.UNREGISTER, {
        app: APP_CODE,
        expo_push_token: expoPushToken,
        revoke_all: options.revokeAll === true,
      });
    }

    await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
    await AsyncStorage.removeItem(STORAGE_REGISTERED_KEY);
    return { ok: true };
  } catch (error) {
    console.warn('[push] unregister failed:', error?.response?.data || error?.message || error);
    await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
    await AsyncStorage.removeItem(STORAGE_REGISTERED_KEY);
    return { ok: false, error: error?.message };
  }
}

function resolveDeepLink(data = {}) {
  if (data.type === 'app_notification' && (data.notification_uuid || data.uuid)) {
    return `/notifications/${encodeURIComponent(String(data.notification_uuid || data.uuid))}`;
  }
  if (data.deep_link) {
    return String(data.deep_link).replace(/^\/setting\/notifications\//, '/notifications/');
  }
  switch (String(data.type || '')) {
    case 'timesheet_approval':
      return data.entity_id
        ? `/approval/timesheet/detail?id=${encodeURIComponent(String(data.entity_id))}`
        : '/approval/timesheet';
    case 'crew_worksheet':
      return '/approval';
    case 'pr_approval':
      return '/approval';
    case 'pengajuan_dana':
      return '/approval';
    case 'test':
      return '/setting/notifications';
    case 'broadcast':
    default:
      return '/(tabs)/home';
  }
}

function getResponseKey(response) {
  const request = response?.notification?.request;
  const identifier = request?.identifier;
  if (identifier) return String(identifier);

  const data = request?.content?.data || {};
  return [data.type, data.entity_id, data.deep_link, response?.actionIdentifier]
    .map((value) => String(value || ''))
    .join(':');
}

async function handleNotificationResponse(response, source) {
  if (!response) return;

  const responseKey = getResponseKey(response);
  if (processedNotificationResponses.has(responseKey)) return;
  processedNotificationResponses.add(responseKey);

  try {
    const data = response?.notification?.request?.content?.data || {};
    const path = resolveDeepLink(data);
    console.log('[push] notification response', { source, path, data });

    if (!path) return;

    // Cold start response can arrive before Expo Router finishes mounting.
    await new Promise((resolve) => setTimeout(resolve, source === 'cold_start' ? 500 : 50));
    router.push(path);

    if (typeof Notifications.clearLastNotificationResponseAsync === 'function') {
      await Notifications.clearLastNotificationResponseAsync();
    }
  } catch (error) {
    processedNotificationResponses.delete(responseKey);
    console.warn('[push] deep link failed:', error?.message || error);
  }
}

export function setupNotificationListeners() {
  let active = true;

  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[push] foreground notification', notification?.request?.content?.title);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    void handleNotificationResponse(response, 'listener');
  });

  // Required when tapping a notification launches a terminated app.
  void Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (active && response) {
        return handleNotificationResponse(response, 'cold_start');
      }
      return undefined;
    })
    .catch((error) => {
      console.warn('[push] read initial response failed:', error?.message || error);
    });

  return () => {
    active = false;
    receivedSub?.remove?.();
    responseSub?.remove?.();
  };
}

export async function getNotificationDebugInfo() {
  const permission = await getPermissionStatus();
  const storedToken = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
  const registeredToken = await AsyncStorage.getItem(STORAGE_REGISTERED_KEY);
  return {
    app: APP_CODE,
    platform: getPlatform(),
    projectId: getProjectId(),
    permission,
    storedToken,
    registeredToken,
    isDevice: Device.isDevice,
  };
}

export default {
  registerForPushNotifications,
  rebindPushTokenToAnonymous,
  unregisterForPushNotifications,
  setupNotificationListeners,
  getPermissionStatus,
  requestPermission,
  getNotificationDebugInfo,
};
