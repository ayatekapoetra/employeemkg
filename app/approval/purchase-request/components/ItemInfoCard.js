import { Archive, ShoppingCart, TickCircle } from 'iconsax-react-native';
import { Divider, HStack, Text, VStack } from 'native-base';

export default function ItemInfoCard({ item, qtyDiminta, qtyDisetujui, mode, textColor, subtitleColor, cardBg, cardBorder }) {
  return (
    <VStack
      bg={cardBg}
      p={4}
      rounded="2xl"
      borderWidth={1}
      borderColor={cardBorder}
      shadow={1}
      space={3}
    >
      <HStack space={2} alignItems="center">
        <Archive size={18} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
        <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
          Data Item Original
        </Text>
      </HStack>
      
      <Divider bg={cardBorder} />

      <VStack space={3}>
        <VStack space={1}>
          <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
            Nama Barang
          </Text>
          <Text fontSize="md" fontFamily="Quicksand-Bold" color={textColor}>
            {item.barang?.nama || item.barang?.nama_barang || item.description || 'Barang belum dipilih'}
          </Text>
          {(item.barang?.kode || item.barang?.kode_barang) && (
            <Text fontSize="xs" fontFamily="Poppins-Light" color={subtitleColor}>
              Kode: {item.barang?.kode || item.barang?.kode_barang}
            </Text>
          )}
        </VStack>

        <HStack space={2}>
          <VStack
            flex={1}
            bg={mode === 'dark' ? '#7c2d12' : '#fef3c7'}
            p={3}
            rounded="xl"
            space={1}
          >
            <HStack space={1} alignItems="center">
              <ShoppingCart size={14} color={mode === 'dark' ? '#fbbf24' : '#d97706'} />
              <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fed7aa' : '#92400e'}>
                Qty Diminta
              </Text>
            </HStack>
            <Text fontSize="xl" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#fbbf24' : '#d97706'}>
              {qtyDiminta}
            </Text>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#fed7aa' : '#92400e'}>
              unit
            </Text>
          </VStack>

          <VStack
            flex={1}
            bg={mode === 'dark' ? '#1e40af' : '#dbeafe'}
            p={3}
            rounded="xl"
            space={1}
          >
            <HStack space={1} alignItems="center">
              <TickCircle size={14} color={mode === 'dark' ? '#60a5fa' : '#2563eb'} variant="Bold" />
              <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
                Qty Disetujui
              </Text>
            </HStack>
            <Text fontSize="xl" fontFamily="Quicksand-Bold" color={mode === 'dark' ? '#60a5fa' : '#2563eb'}>
              {qtyDisetujui || '-'}
            </Text>
            <Text fontSize="xs" fontFamily="Poppins-Light" color={mode === 'dark' ? '#dbeafe' : '#1e40af'}>
              unit
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </VStack>
  );
}
