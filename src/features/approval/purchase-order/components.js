import { Badge, Button, HStack, Text, VStack } from 'native-base';
import { useSelector } from 'react-redux';
import { COLORS } from '../../../constants/colors';

export const usePurchaseOrderTheme = () => {
  const mode = useSelector(state => state.themes)?.value || 'light';
  const dark = mode === 'dark';
  return {
    mode,
    background: dark ? COLORS.container.dark : COLORS.container.light,
    card: dark ? '#2a2c3e' : '#ffffff',
    border: dark ? '#3a3c4e' : '#e5e7eb',
    text: dark ? '#f3f4f6' : '#1f2937',
    muted: dark ? '#9ca3af' : '#6b7280',
    accent: dark ? '#60a5fa' : '#2563eb',
    summary: dark ? '#1e3a8a' : '#dbeafe',
    summaryTile: dark ? '#1e40af' : '#bfdbfe',
    input: dark ? '#374151' : '#f9fafb',
  };
};

export function InfoRow({ label, value, theme, bold = false }) {
  return (
    <HStack justifyContent="space-between" alignItems="flex-start" space={3}>
      <Text flex={1} fontSize="xs" fontFamily="Poppins-Regular" color={theme.muted}>{label}</Text>
      <Text flex={2} textAlign="right" fontSize="sm" fontFamily={bold ? 'Quicksand-Bold' : 'Quicksand-SemiBold'} color={theme.text}>{value ?? '-'}</Text>
    </HStack>
  );
}

export function PurchaseOrderStatus({ status }) {
  const labels = { verify: 'Menunggu Verifikasi', close: 'Diproses', open: 'Baru', reject: 'Ditolak' };
  return <Badge alignSelf="flex-start" rounded="md" colorScheme={status === 'verify' ? 'info' : status === 'close' ? 'success' : 'coolGray'}>{labels[status] || status || '-'}</Badge>;
}

export function PurchaseOrderMessage({ message, onRetry, theme }) {
  return (
    <VStack p={4} space={3} alignItems="center" bg={theme.card} rounded="xl" borderWidth={1} borderColor={theme.border}>
      <Text textAlign="center" color={theme.text} fontFamily="Poppins-Regular" fontSize="sm">{message}</Text>
      {onRetry && <Button variant="outline" onPress={onRetry}>Coba Lagi</Button>}
    </VStack>
  );
}
