import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { DocumentText, TickCircle } from 'iconsax-react-native';
import moment from 'moment';
import { Button, Divider, HStack, Modal, ScrollView, Text, VStack, useToast } from 'native-base';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Linking, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../src/components/common';
import { InfoRow, PurchaseOrderMessage, PurchaseOrderStatus, usePurchaseOrderTheme } from '../../../src/features/approval/purchase-order/components';
import PurchaseOrderAttachments from '../../../src/features/approval/purchase-order/PurchaseOrderAttachments';
import PurchaseOrderBankAccount from '../../../src/features/approval/purchase-order/PurchaseOrderBankAccount';
import { buildVerificationPayload, calculateItemTotals, canVerifyPurchaseOrder, createBankAccountDraft, formatMoney, getAttachmentUrl, getPurchaseOrderError, getRelationName } from '../../../src/features/approval/purchase-order/utils';
import { PHOTO_BASE_URL } from '../../../src/services/api/endpoints';
import { getPurchaseOrderBankAccounts, getPurchaseOrderDetail, verifyPurchaseOrder } from '../../../src/services/api/purchaseOrders';

export default function PurchaseOrderDetail() {
  const { id } = useLocalSearchParams();
  const orderId = typeof id === 'string' ? id : '';
  const token = useSelector(state => state.auth?.token);
  const router = useRouter();
  const toast = useToast();
  const theme = usePurchaseOrderTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [approving, setApproving] = useState(false);
  const [bankDraft, setBankDraft] = useState(() => createBankAccountDraft(null));
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState('');
  const [bankValidationError, setBankValidationError] = useState('');
  const [bankRetry, setBankRetry] = useState(0);
  const request = useRef(null);
  const submitting = useRef(false);
  const focused = useRef(false);

  const loadDetail = useCallback(async (isRefresh = false) => {
    if (submitting.current) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(!isRefresh);
    setRefreshing(isRefresh);
    setError('');
    setActionError('');
    setConfirming(false);
    try {
      if (!orderId) throw new Error('ID Purchase Order tidak valid.');
      const result = await getPurchaseOrderDetail(orderId, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setData(result);
        setBankDraft(createBankAccountDraft(result.order));
        setBankValidationError('');
      }
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setData(null);
        setError(getPurchaseOrderError(requestError));
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [orderId]);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    setApproving(submitting.current);
    setActionError('');
    if (token) {
      loadDetail();
    } else {
      setData(null);
      setError('Silakan login untuk melihat Purchase Order.');
      setLoading(false);
    }
    return () => {
      focused.current = false;
      request.current?.abort();
    };
  }, [loadDetail, token]));

  const order = data?.order;
  const items = (order?.items || []).filter(item => item.aktif !== 'N');
  const canApprove = canVerifyPurchaseOrder(order, data?.permissions);
  const bankUnavailable = bankDraft.mode === 'existing' && (bankLoading || Boolean(bankError));
  const selectedBank = bankDraft.mode === 'new' ? bankDraft
    : bankAccounts.find(account => String(account.id) === String(bankDraft.rekening_id));
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/approval/purchase-order');

  useEffect(() => {
    if (!order || !canApprove) return;
    const controller = new AbortController();
    setBankLoading(true);
    setBankError('');
    setBankAccounts([]);
    getPurchaseOrderBankAccounts(order, { signal: controller.signal }).then(accounts => {
      if (!controller.signal.aborted) setBankAccounts(accounts);
    }).catch(requestError => {
      if (!controller.signal.aborted) setBankError(getPurchaseOrderError(requestError, 'Gagal memuat rekening pemasok.'));
    }).finally(() => {
      if (!controller.signal.aborted) setBankLoading(false);
    });
    return () => controller.abort();
  }, [order, canApprove, bankRetry]);

  const openApprovalConfirmation = () => {
    if (submitting.current || refreshing || bankUnavailable) return;
    try {
      buildVerificationPayload(order, bankDraft, bankAccounts);
      setBankValidationError('');
      Keyboard.dismiss();
      setConfirming(true);
    } catch (validationError) {
      const message = getPurchaseOrderError(validationError);
      setBankValidationError(message);
      toast.show({ description: message, placement: 'top' });
    }
  };

  const handleApprove = async () => {
    if (submitting.current || !canApprove || loading || refreshing || bankUnavailable) return;
    submitting.current = true;
    setApproving(true);
    setActionError('');
    try {
      await verifyPurchaseOrder(order, bankDraft);
      if (!focused.current) return;
      setConfirming(false);
      setApproving(false);
      toast.show({ description: 'Purchase Order berhasil diverifikasi dan difinalisasi.', placement: 'top', bg: 'emerald.600' });
      goBack();
    } catch (requestError) {
      if (focused.current) {
        setConfirming(false);
        setActionError(getPurchaseOrderError(requestError));
      }
    } finally {
      submitting.current = false;
      if (focused.current) setApproving(false);
    }
  };

  const openAttachment = async file => {
    try {
      const url = getAttachmentUrl(file, PHOTO_BASE_URL);
      if (!url) throw new Error('URL lampiran tidak tersedia.');
      await Linking.openURL(url);
    } catch (attachmentError) {
      toast.show({ description: getPurchaseOrderError(attachmentError, 'Lampiran gagal dibuka.'), placement: 'top' });
    }
  };

  return (
    <AppScreen>
      <HeaderScreen title="Detail Purchase Order" onBack={() => { if (!submitting.current) goBack(); }} onThemes />
      {loading ? <LoadingHauler message="Memuat Purchase Order..." subMessage="Mengambil detail dan hak akses dokumen" type="default" /> : !order ? (
        <VStack p={4}><PurchaseOrderMessage theme={theme} message={error || 'Purchase Order tidak ditemukan.'} onRetry={() => loadDetail()} /></VStack>
      ) : (
        <ScrollView
          flex={1}
          bg={theme.background}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDetail(true)} enabled={!approving} tintColor={theme.accent} />}
        >
          <VStack p={4} pb={8} space={4}>
            <VStack bg={theme.card} p={4} rounded="xl" borderWidth={1} borderColor={theme.border} space={3}>
              <HStack space={3} alignItems="center">
                <DocumentText size={30} color={theme.accent} variant="Bold" />
                <Text flex={1} fontSize="lg" fontFamily="Quicksand-Bold" color={theme.text}>{order.kdpo || '-'}</Text>
              </HStack>
              <PurchaseOrderStatus status={order.status} />
              <Divider bg={theme.border} />
              <InfoRow theme={theme} label="Tanggal Request" value={order.request_date ? moment(order.request_date).format('DD MMM YYYY') : '-'} />
              <InfoRow theme={theme} label="PR Sumber" value={order.kode_pr || '-'} />
              <InfoRow theme={theme} label="Pembuat PR" value={order.purchaseRequest?.creator?.nama_lengkap || order.author_pr || '-'} />
              <InfoRow theme={theme} label="Bisnis Unit" value={getRelationName(order.bisnis)} />
              <InfoRow theme={theme} label="Cabang" value={getRelationName(order.cabang)} />
              <InfoRow theme={theme} label="Gudang" value={getRelationName(order.gudang)} />
              <InfoRow theme={theme} label="Prioritas" value={order.prioritas || '-'} />
              <InfoRow theme={theme} label="Diajukan oleh" value={getRelationName(order.verified)} />
              <Text fontSize="xs" color={theme.muted} fontFamily="Poppins-Regular">Narasi / Keterangan</Text>
              <Text fontSize="sm" color={theme.text} fontFamily="Poppins-Regular">{order.narasi || '-'}</Text>
            </VStack>

            <PurchaseOrderBankAccount
              order={order}
              accounts={bankAccounts}
              draft={bankDraft}
              onChange={draft => { setBankDraft(draft); setBankValidationError(''); }}
              editable={canApprove}
              disabled={approving || refreshing}
              loading={bankLoading}
              error={bankError}
              validationError={bankValidationError}
              onRetry={() => setBankRetry(value => value + 1)}
              theme={theme}
            />

            <Text fontSize="md" fontFamily="Quicksand-Bold" color={theme.text}>Item ({items.length})</Text>
            {items.length === 0 && <PurchaseOrderMessage theme={theme} message="Tidak ada item aktif pada dokumen ini." />}
            {items.map((item, index) => {
              const totals = calculateItemTotals(item);
              return (
                <VStack key={item.id} bg={theme.card} p={4} rounded="xl" borderWidth={1} borderColor={theme.border} space={2}>
                  <Text fontSize="md" fontFamily="Quicksand-Bold" color={theme.text}>{index + 1}. {item.barang?.nama || item.narasi || 'Non-part item'}</Text>
                  <InfoRow theme={theme} label="Kode / Part Number" value={[item.barang?.kode, item.barang?.num_part].filter(Boolean).join(' / ') || '-'} />
                  <InfoRow theme={theme} label="Equipment" value={getRelationName(item.equipment)} />
                  <InfoRow theme={theme} label="Qty" value={item.qty ?? 0} />
                  <InfoRow theme={theme} label="Harga Satuan" value={formatMoney(item.harga, item.currency || 'IDR')} />
                  {item.currency === 'USD' && <InfoRow theme={theme} label="Kurs ke IDR" value={formatMoney(item.kurs)} />}
                  <InfoRow theme={theme} label="Nilai Bruto" value={formatMoney(totals.gross)} />
                  <InfoRow theme={theme} label="Potongan" value={formatMoney(item.potongan)} />
                  <InfoRow theme={theme} label={`PPN (${Number(item.ppn || 0)}%)`} value={formatMoney(totals.tax)} />
                  <InfoRow theme={theme} label="Metode Bayar" value={item.metode || '-'} />
                  <InfoRow theme={theme} label="COA" value={item.akun?.nama || item.akun?.name || item.akun?.kode || '-'} />
                  <Divider bg={theme.border} />
                  <InfoRow theme={theme} label="Grand Total Item" value={formatMoney(totals.total)} bold />
                </VStack>
              );
            })}

            <VStack bg={theme.card} p={4} rounded="xl" borderWidth={1} borderColor={theme.border} space={3}>
              <Text fontSize="md" fontFamily="Quicksand-Bold" color={theme.text}>Ringkasan Biaya (IDR)</Text>
              <InfoRow theme={theme} label="Total Bruto" value={formatMoney(order.total)} />
              <InfoRow theme={theme} label="Potongan" value={formatMoney(order.potongan)} />
              <InfoRow theme={theme} label="PPN" value={formatMoney(order.ppn_rp)} />
              <Divider bg={theme.border} />
              <InfoRow theme={theme} label="Grand Total" value={formatMoney(order.grandtotal)} bold />
            </VStack>

            <PurchaseOrderAttachments files={order.files || []} theme={theme} onOpenFile={openAttachment} />

            {actionError ? <PurchaseOrderMessage theme={theme} message={actionError} onRetry={() => loadDetail(true)} /> : null}
            {canApprove ? (
              <Button
                colorScheme="emerald"
                rounded="xl"
                py={4}
                leftIcon={<TickCircle size={22} color="#ffffff" variant="Bold" />}
                onPress={openApprovalConfirmation}
                isDisabled={approving || refreshing || bankUnavailable || items.length === 0 || Boolean(actionError)}
              >Verifikasi & Finalisasi PO</Button>
            ) : (
              <PurchaseOrderMessage theme={theme} message={order.status !== 'verify'
                ? 'Dokumen ini tidak lagi berstatus verify.'
                : 'Anda tidak memiliki hak akses verifikasi Purchase Order ini.'} />
            )}
          </VStack>
        </ScrollView>
      )}
      <Modal isOpen={confirming} onClose={() => { if (!submitting.current) setConfirming(false); }} size="lg">
        <Modal.Content bg={theme.card}>
          <Modal.Header bg={theme.card}><Text color={theme.text} fontFamily="Quicksand-Bold">Konfirmasi Approval PO</Text></Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              <Text color={theme.text} fontFamily="Poppins-Regular">Setujui dan finalisasi {order?.kdpo}?</Text>
              <InfoRow theme={theme} label="Grand Total" value={formatMoney(order?.grandtotal)} bold />
              <InfoRow theme={theme} label="Pemasok" value={getRelationName(order?.pemasok)} />
              <InfoRow theme={theme} label="Bank" value={String(selectedBank?.nm_bank || '').trim() || '-'} />
              <InfoRow theme={theme} label="No. Rekening" value={String(selectedBank?.no_rekening || '').trim() || '-'} />
              <InfoRow theme={theme} label="Atas Nama" value={String(selectedBank?.an || '').trim() || '-'} />
              <Text color={theme.muted} fontSize="sm">Status dokumen akan berubah dari verify menjadi close dan backend akan memproses dokumen lanjutan.</Text>
            </VStack>
          </Modal.Body>
          <Modal.Footer bg={theme.card}>
            <HStack space={2}>
              <Button variant="ghost" onPress={() => setConfirming(false)} isDisabled={approving}>Batal</Button>
              <Button colorScheme="emerald" onPress={handleApprove} isLoading={approving} isDisabled={approving} isLoadingText="Memproses...">Ya, Setujui</Button>
            </HStack>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </AppScreen>
  );
}
