import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getPurchaseOrderAccess, getVerifyPurchaseOrders } from '../../../services/api/purchaseOrders';
import { DEFAULT_PERMISSIONS, getPurchaseOrderError } from './utils';

const EMPTY_LIST = { rows: [], total: 0, page: 0, lastPage: 1 };

export default function usePurchaseOrderList(filters) {
  const token = useSelector(state => state.auth?.token);
  const [data, setData] = useState(EMPTY_LIST);
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(null);
  const loadingPage = useRef(false);

  const refresh = useCallback(async (isRefresh = true) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    loadingPage.current = false;
    setLoadingMore(false);
    setError('');
    setPermissions(DEFAULT_PERMISSIONS);
    setData(EMPTY_LIST);
    setLoading(!isRefresh);
    setRefreshing(isRefresh);
    try {
      const access = await getPurchaseOrderAccess({ signal: controller.signal });
      if (controller.signal.aborted) return;
      setPermissions(access);
      if (!access.can_read) return;
      const result = await getVerifyPurchaseOrders(filters, { signal: controller.signal });
      if (!controller.signal.aborted) setData(result);
    } catch (requestError) {
      if (!controller.signal.aborted) setError(getPurchaseOrderError(requestError));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [filters]);

  useFocusEffect(useCallback(() => {
    if (!token) {
      setData(EMPTY_LIST);
      setPermissions(DEFAULT_PERMISSIONS);
      setError('Silakan login untuk melihat Purchase Order.');
      setLoading(false);
      return;
    }
    refresh(false);
    return () => request.current?.abort();
  }, [refresh, token]));

  const loadMore = async () => {
    const controller = request.current;
    if (!controller || controller.signal.aborted || loading || refreshing || loadingPage.current
      || !permissions.can_read || data.page === 0 || data.page >= data.lastPage || error) return;
    loadingPage.current = true;
    setLoadingMore(true);
    try {
      const result = await getVerifyPurchaseOrders({ ...filters, page: data.page + 1 }, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setData(current => ({
          ...result,
          rows: [...new Map([...current.rows, ...result.rows].map(row => [String(row.id), row])).values()],
        }));
      }
    } catch (requestError) {
      if (!controller.signal.aborted) setError(getPurchaseOrderError(requestError));
    } finally {
      if (!controller.signal.aborted) {
        loadingPage.current = false;
        setLoadingMore(false);
      }
    }
  };

  return { ...data, permissions, loading, refreshing, loadingMore, error, refresh, loadMore };
}
