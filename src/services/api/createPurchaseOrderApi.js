import { API_ENDPOINTS } from './endpoints.js';
import {
  buildVerificationPayload,
  canVerifyPurchaseOrder,
  getPurchaseOrderListParams,
  getSupplierBankAccounts,
  normalizePermissions,
  normalizePurchaseOrderList,
  unwrapPurchaseOrder,
} from '../../features/approval/purchase-order/utils.js';

export const createPurchaseOrderApi = client => {
  const endpoints = API_ENDPOINTS.PURCHASE_ORDER;

  const getPurchaseOrderAccess = async (config = {}) => {
    const response = await client.get(endpoints.ACCESS, config);
    return normalizePermissions(unwrapPurchaseOrder(response.data)?.permissions);
  };

  const getVerifyPurchaseOrders = async (filters = {}, config = {}) => {
    const params = getPurchaseOrderListParams(filters);
    const response = await client.get(endpoints.LIST, {
      ...config,
      params,
    });
    return normalizePurchaseOrderList(response.data, params.page, params.limit);
  };

  const getPurchaseOrderPermissions = async (id, config = {}) => {
    const response = await client.get(endpoints.PERMISSIONS(id), config);
    const data = unwrapPurchaseOrder(response.data);
    return { status: data?.status, ...normalizePermissions(data?.permissions) };
  };

  const getPurchaseOrderDetail = async (id, config = {}) => {
    const access = await getPurchaseOrderAccess(config);
    if (!access.can_read) throw new Error('Anda tidak memiliki hak akses melihat Purchase Order.');
    const [response, permissions] = await Promise.all([
      client.get(endpoints.DETAIL(id), config),
      getPurchaseOrderPermissions(id, config),
    ]);
    const order = unwrapPurchaseOrder(response.data);
    if (!order?.id) throw new Error('Purchase Order tidak ditemukan.');
    return { order, permissions };
  };

  const getPurchaseOrderBankAccounts = async (order, config = {}) => {
    const supplierId = order?.pemasok_id ?? order?.pemasok?.id;
    if (supplierId == null || String(supplierId).trim() === '') {
      throw new Error('Pemasok PO tidak ditemukan. Muat ulang dokumen.');
    }
    const response = await client.get(API_ENDPOINTS.PEMASOK.BANK_ACCOUNTS(supplierId), config);
    const accounts = unwrapPurchaseOrder(response.data);
    if (!Array.isArray(accounts)) throw new Error('Daftar rekening pemasok tidak valid.');
    return getSupplierBankAccounts(order, accounts);
  };

  const verifyPurchaseOrder = async (order, bankDraft) => {
    // Refresh the document permission/status before submitting; the server also locks the PO.
    const permissions = await getPurchaseOrderPermissions(order.id);
    if (!canVerifyPurchaseOrder(order, permissions) || permissions.status !== 'verify') {
      throw new Error('PO tidak lagi berstatus verify atau Anda tidak memiliki hak verifikasi. Muat ulang dokumen.');
    }
    const accounts = bankDraft?.mode === 'existing' && bankDraft.rekening_id
      ? await getPurchaseOrderBankAccounts(order) : undefined;
    const payload = buildVerificationPayload(order, bankDraft, accounts);
    const response = await client.post(endpoints.VERIFY(order.id), payload);
    return unwrapPurchaseOrder(response.data);
  };

  return { getPurchaseOrderAccess, getVerifyPurchaseOrders, getPurchaseOrderPermissions, getPurchaseOrderDetail, getPurchaseOrderBankAccounts, verifyPurchaseOrder };
};
