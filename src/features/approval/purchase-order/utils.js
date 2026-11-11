export const DEFAULT_PERMISSIONS = { can_read: false, can_verify: false };

export const DEFAULT_FILTERS = {
  bisnis_id: '',
  cabang_id: '',
  gudang_id: '',
  prioritas: '',
  kode: '',
  narasi: '',
  date_start: '',
  date_end: '',
};

export const normalizePurchaseOrderFilters = (filters = {}) => Object.fromEntries(
  Object.keys(DEFAULT_FILTERS).map(key => [key, String(filters[key] ?? '').trim()])
);

export const getActiveFilterCount = filters => Object.values(normalizePurchaseOrderFilters(filters)).filter(Boolean).length;

export const getPurchaseOrderListParams = ({ page = 1, limit = 25, ...filters } = {}) => ({
  status: 'verify',
  page,
  limit,
  ...Object.fromEntries(Object.entries(normalizePurchaseOrderFilters(filters)).filter(([, value]) => value)),
});

export const normalizePermissions = (permissions = {}) => Object.fromEntries(
  Object.keys(DEFAULT_PERMISSIONS).map(key => [key,
    permissions?.[key] === true || permissions?.[key] === 1
      || ['Y', '1', 'TRUE'].includes(String(permissions?.[key] ?? '').trim().toUpperCase()),
  ])
);

export const getPurchaseOrderError = (error, fallback = 'Proses Purchase Order gagal') => {
  const payload = error?.response?.data || error?.data || error || {};
  return payload.diagnostic?.message
    || (typeof payload.diagnostic?.error === 'string' && payload.diagnostic.error)
    || payload.message
    || payload.errors?.find?.(field => field?.message)?.message
    || error?.message
    || fallback;
};

export const unwrapPurchaseOrder = payload => {
  if (payload?.diagnostic?.error !== false) {
    throw new Error(getPurchaseOrderError(payload, 'Respons Purchase Order tidak valid'));
  }
  return payload.rows;
};

export const normalizePurchaseOrderList = (payload, page = 1, limit = 25) => {
  const data = unwrapPurchaseOrder(payload);
  const rows = Array.isArray(data) ? data : data?.data || [];
  const pagination = payload.pagination || (Array.isArray(data) ? {} : data) || {};
  const total = Number(pagination.total ?? payload.total ?? rows.length);
  const perPage = Number(pagination.perPage || pagination.per_page || limit);
  return {
    rows,
    total,
    page: Number(pagination.page || page),
    lastPage: Number(pagination.lastPage || pagination.last_page || Math.ceil(total / perPage) || 1),
  };
};

export const canVerifyPurchaseOrder = (order, permissions) => order?.status === 'verify'
  && order?.aktif !== 'N' && normalizePermissions(permissions).can_verify;

export const createBankAccountDraft = order => ({
  mode: 'existing',
  rekening_id: order?.rekening_id != null ? String(order.rekening_id) : '',
  nm_bank: '',
  no_rekening: '',
  an: '',
});

export const getSupplierBankAccounts = (order, accounts) => {
  const supplierId = order?.pemasok_id ?? order?.pemasok?.id;
  if (supplierId == null) return [];
  const candidates = accounts ?? [...(order?.pemasok?.rekening || []), ...(order?.rekpemasok ? [order.rekpemasok] : [])];
  return [...new Map(candidates.filter(account => account?.id != null && account.aktif !== 'N'
    && (account.pemasok_id == null || String(account.pemasok_id) === String(supplierId)))
    .map(account => [String(account.id), account])).values()];
};

export const buildVerificationPayload = (order, draft, accounts = getSupplierBankAccounts(order)) => {
  if (!draft) return order?.rekening_id != null ? { rekening_id: order.rekening_id } : {};
  if (draft.mode === 'new') {
    const nmBank = String(draft.nm_bank || '').trim();
    const noRekening = String(draft.no_rekening || '').trim();
    const an = String(draft.an || '').trim();
    if (!nmBank || !noRekening) throw new Error('Nama bank dan nomor rekening baru wajib diisi.');
    if (!(order?.pemasok_id ?? order?.pemasok?.id)) throw new Error('Pemasok PO tidak ditemukan. Muat ulang dokumen.');
    return { nm_bank: nmBank, no_rekening: noRekening, an: an || null };
  }
  if (draft.mode !== 'existing') throw new Error('Pilihan rekening tidak valid.');
  if (!draft.rekening_id) return { rekening_id: null };
  const account = getSupplierBankAccounts(order, accounts).find(row => String(row.id) === String(draft.rekening_id));
  if (!account) throw new Error('Pilih rekening aktif milik pemasok pada PO ini.');
  return { rekening_id: account.id };
};

export const getRelationName = value => typeof value === 'string' ? value
  : value?.nama || value?.name || value?.nama_lengkap || value?.initial || value?.kode || '-';

export const formatMoney = (value, currency = 'IDR') => `${currency === 'IDR' ? 'Rp' : currency} ${Number(value || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;

const round = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Same rounding, exchange rate, and tax-after-discount rules as the PO backend.
export const calculateItemTotals = item => {
  const gross = round(Number(item.qty || 0) * Number(item.harga || 0) * Number(item.kurs || 1));
  const net = round(gross - Number(item.potongan || 0));
  const tax = round(net * Number(item.ppn || 0) / 100);
  return { gross, tax, total: round(net + tax) };
};

export const getAttachmentUrl = (file, baseUrl) => {
  const path = file?.url || file?.full_url;
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) return null;
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export const isImageAttachment = file => {
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'heif', 'avif'];
  const type = String(file?.datatype || file?.mime_type || '').toLowerCase().split(';')[0].trim();
  const extension = type.replace(/^image\//, '').replace(/^\./, '');
  const path = String(file?.url || file?.full_url || '').split(/[?#]/)[0];
  return extensions.includes(extension) || extensions.includes(path.split('.').pop()?.toLowerCase());
};
