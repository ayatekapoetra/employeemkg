import { memo } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Spinner, Text } from 'native-base';
import { InfoCircle } from 'iconsax-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BarangListItem = memo(({ barang, onPress, isDark }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: isDark ? '#374151' : '#f9fafb',
        borderRadius: 12,
        marginBottom: 8,
      }}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontFamily: 'Quicksand-SemiBold',
            color: isDark ? '#ffffff' : '#1f2937',
            marginBottom: 4,
          }}
        >
          {barang.nama || barang.nama_barang}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Poppins-Light',
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
          Kode: {barang.kode || barang.kode_barang}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 24,
          color: isDark ? '#60a5fa' : '#2563eb',
          marginLeft: 8,
        }}
      >
        ›
      </Text>
    </TouchableOpacity>
  );
});

const PemasokListItem = memo(({ pemasok, onPress, isDark }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: isDark ? '#374151' : '#f9fafb',
        borderRadius: 12,
        marginBottom: 8,
      }}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontFamily: 'Quicksand-SemiBold',
            color: isDark ? '#ffffff' : '#1f2937',
            marginBottom: 4,
          }}
        >
          {pemasok.nama_pemasok}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Poppins-Light',
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
          {pemasok.alamat || '-'}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 24,
          color: isDark ? '#60a5fa' : '#2563eb',
          marginLeft: 8,
        }}
      >
        ›
      </Text>
    </TouchableOpacity>
  );
});

const EquipmentListItem = memo(({ equipment, onPress, isDark }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: isDark ? '#374151' : '#f9fafb',
        borderRadius: 12,
        marginBottom: 8,
      }}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontFamily: 'Quicksand-SemiBold',
            color: isDark ? '#ffffff' : '#1f2937',
            marginBottom: 4,
          }}
        >
          {equipment.kode || equipment.nama}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Poppins-Light',
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
          {equipment.nama || equipment.model || '-'}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 24,
          color: isDark ? '#60a5fa' : '#2563eb',
          marginLeft: 8,
        }}
      >
        ›
      </Text>
    </TouchableOpacity>
  );
});

export default function BottomSheetModal({
  visible,
  type,
  title,
  isDark,
  searchQuery,
  onSearchChange,
  onClose,
  filteredBarangList,
  filteredPemasokList,
  filteredEquipmentList,
  barangList,
  pemasokList,
  equipmentList,
  loadingBarang,
  loadingPemasok,
  loadingEquipment,
  loadingMoreBarang,
  loadingMorePemasok,
  loadingMoreEquipment,
  hasMoreBarang,
  hasMorePemasok,
  hasMoreEquipment,
  onSelectItem,
  onScroll,
}) {
  const styles = StyleSheet.create({
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: SCREEN_HEIGHT * 0.8,
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#e5e7eb',
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Quicksand-Bold',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    modalClose: {
      fontSize: 24,
      color: isDark ? '#9ca3af' : '#6b7280',
      fontWeight: 'bold',
    },
    searchInput: {
      backgroundColor: isDark ? '#374151' : '#f3f4f6',
      borderRadius: 12,
      padding: 12,
      margin: 16,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    modalList: {
      paddingHorizontal: 16,
      flex: 1,
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      fontFamily: 'Poppins-Light',
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginTop: 8,
    },
    loadingMore: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      gap: 8,
    },
    loadingMoreText: {
      fontSize: 13,
      fontFamily: 'Poppins-Light',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginLeft: 8,
    },
    endOfList: {
      padding: 20,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#374151' : '#e5e7eb',
      marginTop: 8,
    },
    endOfListText: {
      fontSize: 12,
      fontFamily: 'Poppins-Light',
      color: isDark ? '#6b7280' : '#9ca3af',
      textAlign: 'center',
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Cari..."
            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
            value={searchQuery}
            onChangeText={onSearchChange}
          />

          <ScrollView 
            style={styles.modalList}
            onScroll={onScroll}
            scrollEventThrottle={400}
          >
            {type === 'barang' ? (
              <>
                {loadingBarang ? (
                  <View style={styles.emptyState}>
                    <Spinner size="lg" color={isDark ? '#60a5fa' : '#2563eb'} />
                    <Text style={styles.emptyStateText}>Memuat data barang...</Text>
                  </View>
                ) : filteredBarangList.length === 0 ? (
                  <View style={styles.emptyState}>
                    <InfoCircle size={48} color={isDark ? '#60a5fa' : '#2563eb'} />
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? 'Barang tidak ditemukan' : 'Tidak ada data barang'}
                    </Text>
                  </View>
                ) : (
                  <>
                    {filteredBarangList.map((barang) => (
                      <BarangListItem
                        key={`barang-${barang.id}`}
                        barang={barang}
                        onPress={() => onSelectItem(barang)}
                        isDark={isDark}
                      />
                    ))}
                    {loadingMoreBarang && (
                      <View style={styles.loadingMore}>
                        <Spinner size="sm" color={isDark ? '#60a5fa' : '#2563eb'} />
                        <Text style={styles.loadingMoreText}>Memuat lebih banyak...</Text>
                      </View>
                    )}
                    {!hasMoreBarang && !searchQuery && barangList.length > 0 && (
                      <View style={styles.endOfList}>
                        <Text style={styles.endOfListText}>
                          Semua data telah ditampilkan ({barangList.length} barang)
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </>
            ) : type === 'pemasok' ? (
              <>
                {loadingPemasok ? (
                  <View style={styles.emptyState}>
                    <Spinner size="lg" color={isDark ? '#60a5fa' : '#2563eb'} />
                    <Text style={styles.emptyStateText}>Memuat data pemasok...</Text>
                  </View>
                ) : filteredPemasokList.length === 0 ? (
                  <View style={styles.emptyState}>
                    <InfoCircle size={48} color={isDark ? '#60a5fa' : '#2563eb'} />
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? 'Pemasok tidak ditemukan' : 'Tidak ada data pemasok'}
                    </Text>
                  </View>
                ) : (
                  <>
                    {filteredPemasokList.map((pemasok) => (
                      <PemasokListItem
                        key={`pemasok-${pemasok.id}`}
                        pemasok={pemasok}
                        onPress={() => onSelectItem(pemasok)}
                        isDark={isDark}
                      />
                    ))}
                    {loadingMorePemasok && (
                      <View style={styles.loadingMore}>
                        <Spinner size="sm" color={isDark ? '#60a5fa' : '#2563eb'} />
                        <Text style={styles.loadingMoreText}>Memuat lebih banyak...</Text>
                      </View>
                    )}
                    {!hasMorePemasok && !searchQuery && pemasokList.length > 0 && (
                      <View style={styles.endOfList}>
                        <Text style={styles.endOfListText}>
                          Semua data telah ditampilkan ({pemasokList.length} pemasok)
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </>
            ) : type === 'equipment' ? (
              <>
                {loadingEquipment ? (
                  <View style={styles.emptyState}>
                    <Spinner size="lg" color={isDark ? '#60a5fa' : '#2563eb'} />
                    <Text style={styles.emptyStateText}>Memuat data equipment...</Text>
                  </View>
                ) : filteredEquipmentList.length === 0 ? (
                  <View style={styles.emptyState}>
                    <InfoCircle size={48} color={isDark ? '#60a5fa' : '#2563eb'} />
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? 'Equipment tidak ditemukan' : 'Tidak ada data equipment'}
                    </Text>
                  </View>
                ) : (
                  <>
                    {filteredEquipmentList.map((equipment) => (
                      <EquipmentListItem
                        key={`equipment-${equipment.id}`}
                        equipment={equipment}
                        onPress={() => onSelectItem(equipment)}
                        isDark={isDark}
                      />
                    ))}
                    {loadingMoreEquipment && (
                      <View style={styles.loadingMore}>
                        <Spinner size="sm" color={isDark ? '#60a5fa' : '#2563eb'} />
                        <Text style={styles.loadingMoreText}>Memuat lebih banyak...</Text>
                      </View>
                    )}
                    {!hasMoreEquipment && !searchQuery && equipmentList.length > 0 && (
                      <View style={styles.endOfList}>
                        <Text style={styles.endOfListText}>
                          Semua data telah ditampilkan ({equipmentList.length} equipment)
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
