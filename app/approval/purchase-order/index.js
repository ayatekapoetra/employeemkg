import { useRouter } from 'expo-router';
import { ArrowDown2, ArrowRight2, ArrowUp2, DocumentText, Filter } from 'iconsax-react-native';
import moment from 'moment';
import { Badge, HStack, Pressable, Spinner, Text, VStack } from 'native-base';
import { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { AppScreen, HeaderScreen, LoadingHauler } from '../../../src/components/common';
import { InfoRow, PurchaseOrderMessage, PurchaseOrderStatus, usePurchaseOrderTheme } from '../../../src/features/approval/purchase-order/components';
import usePurchaseOrderList from '../../../src/features/approval/purchase-order/usePurchaseOrderList';
import FilterPurchaseOrderModal from '../../../src/features/approval/purchase-order/FilterPurchaseOrderModal';
import { DEFAULT_FILTERS, formatMoney, getActiveFilterCount, getRelationName } from '../../../src/features/approval/purchase-order/utils';

export default function ApprovalPurchaseOrder() {
  const router = useRouter();
  const theme = usePurchaseOrderTheme();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const { rows, total, permissions, loading, refreshing, loadingMore, error, refresh, loadMore } = usePurchaseOrderList(filters);
  const activeFilters = getActiveFilterCount(filters);

  const renderOrder = ({ item }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/approval/purchase-order/detail', params: { id: item.id } })}
      _pressed={{ opacity: 0.7 }}
      accessibilityLabel={`Lihat Purchase Order ${item.kdpo}`}
    >
      <VStack bg={theme.card} borderWidth={1} borderColor={theme.border} rounded="xl" p={4} space={3}>
        <HStack space={3} alignItems="center">
          <DocumentText size={28} color={theme.accent} variant="Bold" />
          <VStack flex={1} space={1}>
            <Text fontFamily="Quicksand-Bold" fontSize="md" color={theme.text}>{item.kdpo || '-'}</Text>
            <Text fontFamily="Poppins-Regular" fontSize="xs" color={theme.muted}>{item.request_date ? moment(item.request_date).format('DD MMM YYYY') : '-'}</Text>
          </VStack>
          <ArrowRight2 size={18} color={theme.accent} />
        </HStack>
        <PurchaseOrderStatus status={item.status} />
        <InfoRow theme={theme} label="PR Sumber" value={item.kode_pr || '-'} />
        <InfoRow theme={theme} label="Pemasok" value={getRelationName(item.pemasok)} />
        <InfoRow theme={theme} label="Bisnis Unit" value={getRelationName(item.bisnis)} />
        <InfoRow theme={theme} label="Gudang" value={getRelationName(item.gudang)} />
        <InfoRow theme={theme} label="Jumlah Item" value={item.totalItems ?? item.items?.filter(line => line.aktif !== 'N').length ?? 0} />
        <InfoRow theme={theme} label="Grand Total" value={formatMoney(item.grandtotal)} bold />
      </VStack>
    </Pressable>
  );

  return (
    <AppScreen>
      <HeaderScreen title="Purchase Order" onBack={() => router.back()} onThemes onNotification />
      <VStack flex={1} bg={theme.background}>
        <VStack p={4} space={4}>
          {!isHeaderCollapsed && (
            <VStack bg={theme.summary} p={5} rounded="2xl" shadow={3} space={3}>
              <HStack alignItems="center" justifyContent="space-between">
                <VStack>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={theme.text}>Total Purchase Order</Text>
                  <Text fontSize="3xl" fontFamily="Quicksand-Bold" color={theme.text}>{loading || refreshing ? '—' : total}</Text>
                  <Text fontSize="xs" fontFamily="Poppins-Light" color={theme.muted}>Menunggu verifikasi{activeFilters ? ' • Sesuai filter' : ''}</Text>
                </VStack>
                <VStack bg={theme.summaryTile} p={3} rounded="xl"><DocumentText size={32} color={theme.accent} variant="Bold" /></VStack>
              </HStack>
              <HStack space={2}>
                {[['Verify', loading || refreshing ? '—' : total], ['Ditampilkan', rows.length], ['Filter Aktif', activeFilters]].map(([label, value]) => (
                  <VStack key={label} flex={1} bg={theme.summaryTile} p={2} rounded="lg">
                    <Text fontSize="xs" fontFamily="Poppins-Light" color={theme.text}>{label}</Text>
                    <Text fontSize="lg" fontFamily="Quicksand-Bold" color={theme.text}>{value}</Text>
                  </VStack>
                ))}
              </HStack>
            </VStack>
          )}
          <HStack justifyContent="space-between" alignItems="center" space={2}>
            <VStack flex={1}>
              <Text fontFamily="Quicksand-SemiBold" fontSize="sm" color={theme.text}>Daftar Purchase Order</Text>
              <Text fontFamily="Poppins-Light" fontSize="xs" color={theme.muted}>{rows.length} dari {total} purchase order</Text>
            </VStack>
            <HStack space={2}>
              <Pressable
                onPress={() => setIsHeaderCollapsed(value => !value)}
                accessibilityLabel={isHeaderCollapsed ? 'Tampilkan ringkasan' : 'Sembunyikan ringkasan'}
                bg={theme.input} p={2.5} rounded="xl" borderWidth={1} borderColor={theme.border}
              >
                {isHeaderCollapsed ? <ArrowDown2 size={20} color={theme.muted} /> : <ArrowUp2 size={20} color={theme.muted} />}
              </Pressable>
              <Pressable
                onPress={() => setShowFilterModal(true)} accessibilityLabel="Filter Purchase Order"
                bg={theme.input} p={2.5} rounded="xl" borderWidth={1} borderColor={activeFilters ? theme.accent : theme.border}
              >
                <Filter size={20} color={activeFilters ? theme.accent : theme.muted} variant="Bold" />
                {activeFilters > 0 && <Badge position="absolute" top={-2} right={-2} colorScheme="info" rounded="full" px={1.5} _text={{ fontSize: 9 }}>{activeFilters}</Badge>}
              </Pressable>
            </HStack>
          </HStack>
        </VStack>
        <FlatList
          data={rows}
          renderItem={renderOrder}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ItemSeparatorComponent={() => <VStack h={3} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.accent} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={loading || refreshing ? (
            <LoadingHauler message="Memuat Purchase Order..." subMessage="Mengambil dokumen menunggu verifikasi" type="default" />
          ) : (
            <PurchaseOrderMessage
              theme={theme}
              message={error || (!permissions.can_read ? 'Anda tidak memiliki hak akses melihat Purchase Order.' : 'Tidak ada Purchase Order berstatus verify yang sesuai filter.')}
              onRetry={error ? () => refresh(false) : undefined}
            />
          )}
          ListFooterComponent={loadingMore ? <Spinner mt={4} color={theme.accent} /> : error && rows.length > 0 ? (
            <PurchaseOrderMessage theme={theme} message={error} onRetry={() => refresh(false)} />
          ) : null}
        />
      </VStack>
      <FilterPurchaseOrderModal
        visible={showFilterModal}
        filters={filters}
        onClose={() => setShowFilterModal(false)}
        onApply={nextFilters => { setFilters(nextFilters); setShowFilterModal(false); }}
      />
    </AppScreen>
  );
}
