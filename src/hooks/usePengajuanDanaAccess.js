import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';

const DEFAULT_PERMISSIONS = {
  can_read: false,
  can_insert: false,
  can_update: false,
  can_remove: false,
  can_approve: false,
  can_validate: false,
};

const accessCache = new Map();
const pendingRequests = new Map();

const isPermissionEnabled = value => value === true
  || value === 1
  || ['1', 'Y', 'TRUE'].includes(String(value || '').toUpperCase());

const requestAccess = async (cacheKey, force = false) => {
  if (!force && accessCache.has(cacheKey)) {
    return accessCache.get(cacheKey);
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = apiClient.get(API_ENDPOINTS.PENGAJUAN.ACCESS).then(response => {
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Gagal memuat hak akses Pengajuan Dana');
    }

    const responsePermissions = response.data?.data?.permissions;
    const permissions = Object.fromEntries(
      Object.keys(DEFAULT_PERMISSIONS).map(key => [key, isPermissionEnabled(responsePermissions?.[key])])
    );
    accessCache.set(cacheKey, permissions);
    return permissions;
  }).finally(() => {
    pendingRequests.delete(cacheKey);
  });

  pendingRequests.set(cacheKey, request);
  return request;
};

export default function usePengajuanDanaAccess() {
  const token = useSelector(state => state.auth?.token);
  const cacheKey = token || 'current-session';
  const cachedPermissions = accessCache.get(cacheKey);
  const [permissions, setPermissions] = useState(cachedPermissions || DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(!cachedPermissions);
  const [error, setError] = useState(null);

  const loadAccess = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      const nextPermissions = await requestAccess(cacheKey, force);
      setPermissions(nextPermissions);
      return nextPermissions;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    const cachedAccess = accessCache.get(cacheKey);
    if (cachedAccess) {
      setPermissions(cachedAccess);
      setError(null);
      setLoading(false);
      return;
    }

    setPermissions(DEFAULT_PERMISSIONS);
    loadAccess().catch(() => {});
  }, [cacheKey, loadAccess]);

  const retry = useCallback(() => loadAccess(true), [loadAccess]);

  return { permissions, loading, error, retry };
}
