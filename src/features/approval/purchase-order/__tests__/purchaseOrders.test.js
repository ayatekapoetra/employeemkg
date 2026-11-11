import assert from 'node:assert/strict';
import test from 'node:test';
import { createPurchaseOrderApi } from '../../../../services/api/createPurchaseOrderApi.js';
import {
  calculateItemTotals,
  buildVerificationPayload,
  canVerifyPurchaseOrder,
  createBankAccountDraft,
  getAttachmentUrl,
  getPurchaseOrderError,
  getActiveFilterCount,
  getPurchaseOrderListParams,
  getSupplierBankAccounts,
  isImageAttachment,
  normalizePermissions,
  normalizePurchaseOrderFilters,
  normalizePurchaseOrderList,
} from '../utils.js';

const success = (rows, extra = {}) => ({ data: { diagnostic: { error: false }, rows, ...extra } });

test('permissions fail closed, including N/false/missing values', () => {
  for (const value of [false, 0, 'N', 'FALSE', null, undefined]) {
    assert.equal(normalizePermissions({ can_verify: value }).can_verify, false);
  }
  assert.deepEqual(normalizePermissions(null), { can_read: false, can_verify: false });
  for (const value of [true, 1, 'Y', '1', ' true ']) {
    assert.equal(normalizePermissions({ can_verify: value }).can_verify, true);
  }
});

test('approval requires an active verify document and document permission', () => {
  assert.equal(canVerifyPurchaseOrder({ status: 'verify' }, { can_verify: 'Y' }), true);
  for (const status of ['open', 'close', 'reject', 'accept']) {
    assert.equal(canVerifyPurchaseOrder({ status }, { can_verify: true }), false);
  }
  assert.equal(canVerifyPurchaseOrder({ status: 'verify', aktif: 'N' }, { can_verify: true }), false);
  assert.equal(canVerifyPurchaseOrder({ status: 'verify' }, { can_finalize: true }), false);
});

test('list always requests verify and preserves server pagination and cancellation', async () => {
  const signal = new AbortController().signal;
  const api = createPurchaseOrderApi({
    get: async (url, config) => {
      assert.equal(url, '/scm/purchase-orders');
      assert.deepEqual(config.params, { status: 'verify', page: 2, limit: 25, kode: 'PO/2026 & PR' });
      assert.equal(config.signal, signal);
      return success([{ id: 26 }], { pagination: { page: 2, perPage: 25, total: 51, lastPage: 3 } });
    },
  });
  const result = await api.getVerifyPurchaseOrders({ page: 2, kode: 'PO/2026 & PR', status: 'close' }, { signal, params: { status: 'open' } });
  assert.deepEqual(result, { rows: [{ id: 26 }], page: 2, total: 51, lastPage: 3 });
});

test('pagination supports nested paginator and zero totals', () => {
  assert.deepEqual(normalizePurchaseOrderList({
    diagnostic: { error: false }, rows: { data: [], total: 0, page: 1, lastPage: 1 },
  }), { rows: [], total: 0, page: 1, lastPage: 1 });
});

test('business errors in HTTP 200 responses are rejected', async () => {
  const api = createPurchaseOrderApi({ get: async () => ({ data: { diagnostic: { error: true, message: 'Akses dicabut' } } }) });
  await assert.rejects(api.getPurchaseOrderAccess(), /Akses dicabut/);
  await assert.rejects(api.getVerifyPurchaseOrders(), /Akses dicabut/);
});

test('detail is not fetched when feature read permission is denied', async () => {
  const urls = [];
  const api = createPurchaseOrderApi({ get: async url => {
    urls.push(url);
    return success({ permissions: { can_read: 'N', can_verify: 'Y' } });
  } });
  await assert.rejects(api.getPurchaseOrderDetail(7), /hak akses/);
  assert.deepEqual(urls, ['/scm/purchase-orders/access']);
});

test('detail loads the document and its own permissions', async () => {
  const api = createPurchaseOrderApi({ get: async url => {
    if (url.endsWith('/access')) return success({ permissions: { can_read: 'Y' } });
    if (url.endsWith('/permissions')) return success({ status: 'verify', permissions: { can_read: true, can_verify: 'Y' } });
    assert.equal(url, '/scm/purchase-orders/7');
    return success({ id: 7, status: 'verify', items: [] });
  } });
  const result = await api.getPurchaseOrderDetail(7);
  assert.equal(result.order.id, 7);
  assert.equal(result.permissions.can_verify, true);
});

test('verification rechecks permission and posts only the existing bank account', async () => {
  const calls = [];
  const api = createPurchaseOrderApi({
    get: async url => {
      calls.push(url);
      return success({ status: 'verify', permissions: { can_verify: true } });
    },
    post: async (url, payload) => {
      calls.push(url);
      assert.deepEqual(payload, { rekening_id: 9 });
      return success({ id: 7, status: 'close' });
    },
  });
  const result = await api.verifyPurchaseOrder({ id: 7, status: 'verify', rekening_id: 9, grandtotal: 3441000, items: [{ harga: 100 }] });
  assert.equal(result.status, 'close');
  assert.deepEqual(calls, ['/scm/purchase-orders/7/permissions', '/scm/purchase-orders/7/verify']);
});

test('a stale or unauthorized document never sends a verification mutation', async () => {
  for (const permission of [
    { status: 'close', permissions: { can_verify: true } },
    { status: 'verify', permissions: { can_verify: 'N' } },
    { status: 'verify', permissions: { can_finalize: true } },
  ]) {
    const api = createPurchaseOrderApi({
      get: async () => success(permission),
      post: async () => assert.fail('must not submit'),
    });
    await assert.rejects(api.verifyPurchaseOrder({ id: 7, status: 'verify' }), /Muat ulang/);
  }
});

test('verification without a bank account omits rekening_id and reports business rejection', async () => {
  const api = createPurchaseOrderApi({
    get: async () => success({ status: 'verify', permissions: { can_verify: true } }),
    post: async (_url, payload) => {
      assert.deepEqual(payload, {});
      return { data: { diagnostic: { error: true, message: 'COA wajib dipilih.' } } };
    },
  });
  await assert.rejects(api.verifyPurchaseOrder({ id: 7, status: 'verify' }), /COA wajib/);
});

test('financial display applies exchange rate and taxes the discounted value', () => {
  assert.deepEqual(calculateItemTotals({ qty: 2, harga: 100, currency: 'USD', kurs: 16000, potongan: 100000, ppn: 11 }), {
    gross: 3200000, tax: 341000, total: 3441000,
  });
  assert.deepEqual(calculateItemTotals({ qty: 3, harga: 10.125, potongan: 0.25, ppn: 11 }), {
    gross: 30.38, tax: 3.31, total: 33.44,
  });
});

test('API errors show diagnostic text rather than a boolean', () => {
  assert.equal(getPurchaseOrderError({ response: { data: { diagnostic: { error: true, message: 'PO sudah diproses.' } } } }), 'PO sudah diproses.');
  assert.equal(getPurchaseOrderError({ diagnostic: { error: 'Pesan legacy' } }), 'Pesan legacy');
});

test('attachments resolve CDN paths and HTTP URLs', () => {
  const base = 'https://cdn.example.com/';
  assert.equal(getAttachmentUrl({ url: '/po/invoice.pdf' }, base), 'https://cdn.example.com/po/invoice.pdf');
  assert.equal(getAttachmentUrl({ full_url: 'https://files.example.com/a.pdf' }, base), 'https://files.example.com/a.pdf');
  assert.equal(getAttachmentUrl({}, base), null);
  assert.equal(getAttachmentUrl({ url: 'javascript:alert(1)' }, base), null);
});

test('filters retain supported fields, trim text, and cannot override verify status', () => {
  const filters = {
    bisnis_id: 3, cabang_id: '4', gudang_id: '', prioritas: 'P1',
    kode: ' PO/2026 ', narasi: '  spare part  ', date_start: '2026-10-01', date_end: '2026-10-22',
    status: 'close', unsupported: 'ignore', page: 2,
  };
  assert.deepEqual(getPurchaseOrderListParams(filters), {
    status: 'verify', page: 2, limit: 25, bisnis_id: '3', cabang_id: '4', prioritas: 'P1',
    kode: 'PO/2026', narasi: 'spare part', date_start: '2026-10-01', date_end: '2026-10-22',
  });
  assert.equal(getActiveFilterCount(filters), 7);
  assert.equal(getActiveFilterCount({ status: 'verify', kode: '  ' }), 0);
  assert.equal(normalizePurchaseOrderFilters(filters).kode, 'PO/2026');
});

test('API forwards applied filters on subsequent pages', async () => {
  const api = createPurchaseOrderApi({ get: async (_url, config) => {
    assert.deepEqual(config.params, {
      status: 'verify', page: 3, limit: 25, bisnis_id: '2', gudang_id: '8',
      prioritas: 'P2', narasi: 'Mesin', date_start: '2026-10-01',
    });
    return success([], { pagination: { page: 3, lastPage: 3, total: 50 } });
  } });
  await api.getVerifyPurchaseOrders({ page: 3, bisnis_id: '2', gudang_id: '8', prioritas: 'P2', narasi: 'Mesin', date_start: '2026-10-01' });
});

test('image detection supports metadata, MIME types and signed URLs, excluding PDFs', () => {
  for (const file of [
    { datatype: 'JPG', url: '/attachments/file' },
    { datatype: 'image/jpeg; charset=binary' },
    { mime_type: 'image/png' },
    { url: '/attachments/PHOTO.PNG?signature=abc#preview' },
    { full_url: 'https://cdn.example.com/photo.webp?token=1' },
  ]) assert.equal(isImageAttachment(file), true);
  for (const file of [{ datatype: 'pdf', url: '/invoice.pdf' }, { url: '/document.pdf?name=photo.png' }, {}, null]) {
    assert.equal(isImageAttachment(file), false);
  }
});

test('bank account draft starts with the PO account and keeps account numbers as strings', () => {
  assert.deepEqual(createBankAccountDraft({ rekening_id: 8 }), {
    mode: 'existing', rekening_id: '8', nm_bank: '', no_rekening: '', an: '',
  });
  assert.equal(createBankAccountDraft({}).rekening_id, '');
});

test('bank options are scoped to the PO supplier and exclude inactive or foreign accounts', async () => {
  const signal = new AbortController().signal;
  const api = createPurchaseOrderApi({ get: async (url, config) => {
    assert.equal(url, '/master/pemasok/21/rekening');
    assert.equal(config.signal, signal);
    return success([
      { id: 1, pemasok_id: 21, aktif: 'Y', no_rekening: '00123' },
      { id: 2, pemasok_id: 22, aktif: 'Y' },
      { id: 3, pemasok_id: 21, aktif: 'N' },
    ]);
  } });
  const accounts = await api.getPurchaseOrderBankAccounts({ id: 7, pemasok_id: 21 }, { signal });
  assert.deepEqual(accounts, [{ id: 1, pemasok_id: 21, aktif: 'Y', no_rekening: '00123' }]);
  assert.deepEqual(getSupplierBankAccounts({}, accounts), []);
});

test('a newly selected supplier account replaces the previous account during approval', async () => {
  const calls = [];
  const api = createPurchaseOrderApi({
    get: async url => {
      calls.push(url);
      return url.endsWith('/permissions')
        ? success({ status: 'verify', permissions: { can_verify: true } })
        : success([{ id: 9, pemasok_id: 21, aktif: 'Y', no_rekening: '00123' }]);
    },
    post: async (url, payload) => {
      assert.equal(url, '/scm/purchase-orders/7/verify');
      assert.deepEqual(payload, { rekening_id: 9 });
      return success({ id: 7, status: 'close' });
    },
  });
  await api.verifyPurchaseOrder({ id: 7, status: 'verify', pemasok_id: 21, rekening_id: 4 }, {
    mode: 'existing', rekening_id: '9',
  });
  assert.deepEqual(calls, ['/scm/purchase-orders/7/permissions', '/master/pemasok/21/rekening']);
});

test('bank account ownership is rechecked before verification mutation', async () => {
  for (const account of [
    { id: 9, pemasok_id: 22, aktif: 'Y' },
    { id: 9, pemasok_id: 21, aktif: 'N' },
  ]) {
    const api = createPurchaseOrderApi({
      get: async url => url.endsWith('/permissions')
        ? success({ status: 'verify', permissions: { can_verify: true } })
        : success([account]),
      post: async () => assert.fail('must not submit a foreign or inactive account'),
    });
    await assert.rejects(api.verifyPurchaseOrder({ id: 7, status: 'verify', pemasok_id: 21 }, {
      mode: 'existing', rekening_id: '9',
    }), /rekening aktif milik pemasok/);
  }
});

test('new bank details are trimmed and leading zeros and long account numbers survive approval', async () => {
  const api = createPurchaseOrderApi({
    get: async () => success({ status: 'verify', permissions: { can_verify: true } }),
    post: async (_url, payload) => {
      assert.deepEqual(payload, { nm_bank: 'BCA', no_rekening: '001234567890123456789012', an: 'PT Pemasok' });
      assert.equal('rekening_id' in payload, false);
      assert.equal('pemasok_id' in payload, false);
      return success({ id: 7, status: 'close' });
    },
  });
  await api.verifyPurchaseOrder({ id: 7, status: 'verify', pemasok_id: 21, rekening_id: 4 }, {
    mode: 'new', nm_bank: ' BCA ', no_rekening: ' 001234567890123456789012 ', an: ' PT Pemasok ', pemasok_id: 999,
  });
});

test('new account input requires bank and number, and supports optional account holder', () => {
  const order = { id: 7, pemasok_id: 21 };
  for (const draft of [
    { mode: 'new', nm_bank: ' ', no_rekening: '00123' },
    { mode: 'new', nm_bank: 'BCA', no_rekening: '' },
  ]) assert.throws(() => buildVerificationPayload(order, draft), /wajib diisi/);
  assert.deepEqual(buildVerificationPayload(order, { mode: 'new', nm_bank: 'BRI', no_rekening: '00123' }), {
    nm_bank: 'BRI', no_rekening: '00123', an: null,
  });
  assert.throws(() => buildVerificationPayload({}, { mode: 'new', nm_bank: 'BCA', no_rekening: '00123' }), /Pemasok PO/);
});

test('explicitly choosing no account clears the previous PO account', () => {
  assert.deepEqual(buildVerificationPayload({ rekening_id: 8 }, { mode: 'existing', rekening_id: '' }), { rekening_id: null });
});

test('missing supplier ID does not request an undefined or PO-scoped bank route', async () => {
  const api = createPurchaseOrderApi({ get: async () => assert.fail('must not fetch without a supplier ID') });
  await assert.rejects(api.getPurchaseOrderBankAccounts({ id: 7 }), /Pemasok PO tidak ditemukan/);
  await assert.rejects(api.getPurchaseOrderBankAccounts({ id: 7, pemasok_id: '' }), /Pemasok PO tidak ditemukan/);
});

test('bank accounts use the nested supplier ID when pemasok_id is absent', async () => {
  const api = createPurchaseOrderApi({ get: async url => {
    assert.equal(url, '/master/pemasok/21/rekening');
    return success([{ id: 9, pemasok_id: 21, no_rekening: '00123', aktif: 'Y' }]);
  } });
  assert.deepEqual(await api.getPurchaseOrderBankAccounts({ id: 7, pemasok: { id: 21 } }), [
    { id: 9, pemasok_id: 21, no_rekening: '00123', aktif: 'Y' },
  ]);
});

test('bank account loading propagates authorization errors rather than hiding them', async () => {
  const error = Object.assign(new Error('Forbidden'), { response: { status: 403 } });
  const api = createPurchaseOrderApi({ get: async () => { throw error; } });
  await assert.rejects(api.getPurchaseOrderBankAccounts({ id: 7, pemasok_id: 21 }), value => value === error);
});
