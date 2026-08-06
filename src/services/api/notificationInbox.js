import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export async function getNotificationInbox({ page = 1, perPage = 20, read } = {}) {
  const params = { page, perPage, app: 'app_emp' };
  if (typeof read === 'boolean') params.read = read;

  const response = await apiClient.get(API_ENDPOINTS.APP_NOTIFICATIONS.INBOX, { params });
  const payload = response.data || {};
  return {
    data: Array.isArray(payload.data) ? payload.data : [],
    meta: payload.meta || {},
  };
}

export async function getNotificationUnreadCount() {
  const response = await apiClient.get(API_ENDPOINTS.APP_NOTIFICATIONS.UNREAD_COUNT, { params: { app: 'app_emp' } });
  const data = response.data?.data;
  if (typeof data === 'number') return data;
  return Number(data?.unread_count ?? data?.unreadCount ?? data?.count ?? 0);
}

export async function getNotificationDetail(uuid) {
  const response = await apiClient.get(API_ENDPOINTS.APP_NOTIFICATIONS.DETAIL(uuid), { params: { app: 'app_emp' } });
  return response.data?.data;
}

export async function markNotificationRead(uuid) {
  const response = await apiClient.post(API_ENDPOINTS.APP_NOTIFICATIONS.READ(uuid), {}, { params: { app: 'app_emp' } });
  return response.data?.data;
}

export async function markAllNotificationsRead() {
  const response = await apiClient.post(API_ENDPOINTS.APP_NOTIFICATIONS.READ_ALL, {}, { params: { app: 'app_emp' } });
  return response.data?.data;
}
