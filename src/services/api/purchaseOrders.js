import apiClient from './client';
import { createPurchaseOrderApi } from './createPurchaseOrderApi';

export const {
  getPurchaseOrderAccess,
  getVerifyPurchaseOrders,
  getPurchaseOrderPermissions,
  getPurchaseOrderDetail,
  getPurchaseOrderBankAccounts,
  verifyPurchaseOrder,
} = createPurchaseOrderApi(apiClient);
