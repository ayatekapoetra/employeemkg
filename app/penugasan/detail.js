import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { AppScreen, HeaderScreen, CustomAlert } from '../../src/components/common';
import { 
  Calendar, 
  TruckFast, 
  User, 
  Location, 
  Activity, 
  Personalcard, 
  Buildings,
  Clock,
  Edit2,
  Trash,
  Note1,
  InfoCircle
} from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { 
  getEquipmentPlanDetail, 
  deleteEquipmentPlan,
  clearDetailData 
} from '../../src/store/slices/equipmentPlanSlice';

moment.locale('id');

export default function DetailPenugasan() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const { detailData, detailLoading, detailError, deleteLoading } = useSelector(state => state.equipmentPlan);

  const isDark = mode === 'dark';
  const planId = params.id;
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: []
  });

  useEffect(() => {
    if (planId) {
      console.log('📋 [Detail] Loading equipment plan detail on mount:', planId);
      dispatch(getEquipmentPlanDetail(planId));
    }

    return () => {
      console.log('📋 [Detail] Cleaning up on unmount');
      dispatch(clearDetailData());
    };
  }, [planId]);

  // Reload data when screen comes back into focus (e.g., after edit)
  useFocusEffect(
    useCallback(() => {
      if (planId) {
        console.log('🔄 [Detail] Screen focused, reloading data:', planId);
        dispatch(getEquipmentPlanDetail(planId));
      }
    }, [planId])
  );

  useEffect(() => {
    if (detailData) {
      console.log('📊 [Detail] Detail data loaded:', {
        id: detailData.id,
        plan_code: detailData.plan_code,
        status: detailData.status,
        statusType: typeof detailData.status,
        canEdit: detailData.status === 'pending',
        canDelete: detailData.status === 'pending',
      });
    }
  }, [detailData]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: isDark ? '#92400e' : '#fef3c7',
        text: isDark ? '#fbbf24' : '#d97706',
        label: 'Pending',
        icon: <Clock size={20} color={isDark ? '#fbbf24' : '#d97706'} variant="Bold" />
      },
      accepted: {
        bg: isDark ? '#065f46' : '#d1fae5',
        text: isDark ? '#6ee7b7' : '#059669',
        label: 'Diterima',
        icon: <InfoCircle size={20} color={isDark ? '#6ee7b7' : '#059669'} variant="Bold" />
      },
      rejected: {
        bg: isDark ? '#991b1b' : '#fee2e2',
        text: isDark ? '#fca5a5' : '#dc2626',
        label: 'Ditolak',
        icon: <InfoCircle size={20} color={isDark ? '#fca5a5' : '#dc2626'} variant="Bold" />
      },
      completed: {
        bg: isDark ? '#1e3a8a' : '#dbeafe',
        text: isDark ? '#60a5fa' : '#2563eb',
        label: 'Selesai',
        icon: <InfoCircle size={20} color={isDark ? '#60a5fa' : '#2563eb'} variant="Bold" />
      }
    };
    return configs[status] || configs.pending;
  };

  const handleEdit = () => {
    console.log('✏️ [Detail] Edit button clicked:', {
      planId,
      status: detailData?.status,
      canEdit: detailData?.status === 'pending'
    });

    if (detailData?.status !== 'pending') {
      Alert.alert(
        'Tidak Dapat Diedit',
        'Hanya penugasan dengan status "Pending" yang dapat diedit',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('🚀 [Detail] Navigating to edit page:', `/penugasan/edit?id=${planId}`);
    router.push(`/penugasan/edit?id=${planId}`);
  };

  const handleDelete = () => {
    if (detailData?.status !== 'pending') {
      setAlertConfig({
        visible: true,
        type: 'warning',
        title: 'Tidak Dapat Dihapus',
        message: 'Hanya penugasan dengan status "Pending" yang dapat dihapus',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }

    setAlertConfig({
      visible: true,
      type: 'warning',
      title: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus penugasan ini?\n\nKode: ${detailData?.plan_code}\nOperator: ${detailData?.karyawan?.nama}`,
      buttons: [
        {
          text: 'Batal',
          style: 'cancel',
          onPress: () => {}
        },
        {
          text: 'Hapus',
          onPress: async () => {
            try {
              await dispatch(deleteEquipmentPlan(planId)).unwrap();
              setAlertConfig({
                visible: true,
                type: 'success',
                title: 'Berhasil',
                message: 'Penugasan berhasil dihapus',
                buttons: [{ text: 'OK', onPress: () => router.back() }]
              });
            } catch (error) {
              setAlertConfig({
                visible: true,
                type: 'error',
                title: 'Error',
                message: error || 'Gagal menghapus penugasan',
                buttons: [{ text: 'OK', onPress: () => {} }]
              });
            }
          }
        }
      ]
    });
  };

  const styles = getStyles(isDark);

  if (detailLoading) {
    return (
      <AppScreen>
        <HeaderScreen
          title="Detail Penugasan"
          onBack={() => router.back()}
          onThemes={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#3b82f6'} />
          <Text style={styles.loadingText}>Memuat detail penugasan...</Text>
        </View>
      </AppScreen>
    );
  }

  if (detailError) {
    return (
      <AppScreen>
        <HeaderScreen
          title="Detail Penugasan"
          onBack={() => router.back()}
          onThemes={true}
        />
        <View style={styles.errorContainer}>
          <InfoCircle size={64} color={isDark ? '#fca5a5' : '#ef4444'} variant="Bulk" />
          <Text style={styles.errorTitle}>Gagal Memuat Data</Text>
          <Text style={styles.errorMessage}>{detailError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(getEquipmentPlanDetail(planId))}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </AppScreen>
    );
  }

  if (!detailData) {
    return (
      <AppScreen>
        <HeaderScreen
          title="Detail Penugasan"
          onBack={() => router.back()}
          onThemes={true}
        />
        <View style={styles.errorContainer}>
          <InfoCircle size={64} color={isDark ? '#9ca3af' : '#6b7280'} variant="Bulk" />
          <Text style={styles.errorTitle}>Data Tidak Ditemukan</Text>
        </View>
      </AppScreen>
    );
  }

  const statusConfig = getStatusConfig(detailData.status);

  return (
    <AppScreen>
      <HeaderScreen
        title="Detail Penugasan"
        onBack={() => router.back()}
        onThemes={true}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>Kode Penugasan</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              {statusConfig.icon}
              <Text style={[styles.statusText, { color: statusConfig.text }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          <Text style={styles.codeValue}>{detailData.plan_code}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Operator</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Personalcard size={20} color={isDark ? '#60a5fa' : '#3b82f6'} variant="Bold" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nama Operator</Text>
                <Text style={styles.infoValue}>{detailData.karyawan?.nama || '-'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <User size={20} color={isDark ? '#10b981' : '#059669'} variant="Bold" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Section</Text>
                <Text style={styles.infoValue}>{detailData.karyawan?.section || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <TruckFast size={20} color={isDark ? '#f59e0b' : '#d97706'} variant="Bold" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Kode Equipment</Text>
                <Text style={styles.infoValue}>{detailData.equipment?.kode || '-'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <TruckFast size={20} color={isDark ? '#f59e0b' : '#d97706'} variant="Bold" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Model</Text>
                <Text style={styles.infoValue}>{detailData.equipment?.model || '-'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <TruckFast size={20} color={isDark ? '#f59e0b' : '#d97706'} variant="Bold" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Kategori</Text>
                <Text style={styles.infoValue}>{detailData.equipment?.kategori || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jadwal & Lokasi</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Calendar size={20} color={isDark ? '#ec4899' : '#db2777'} variant="Bold" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tanggal Tugas</Text>
                <Text style={styles.infoValue}>
                  {moment(detailData.tanggal_tugas).format('dddd, DD MMMM YYYY')}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Clock size={20} color={isDark ? '#8b5cf6' : '#7c3aed'} variant="Bold" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Shift</Text>
                <Text style={styles.infoValue}>{detailData.shift?.nama || '-'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Location size={20} color={isDark ? '#14b8a6' : '#0d9488'} variant="Bold" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lokasi Kerja</Text>
                <Text style={styles.infoValue}>{detailData.lokasi?.nama || '-'}</Text>
              </View>
            </View>

            {detailData.lokasiTujuan && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Location size={20} color={isDark ? '#14b8a6' : '#0d9488'} variant="Bold" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Lokasi Tujuan</Text>
                    <Text style={styles.infoValue}>{detailData.lokasiTujuan.nama}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kegiatan & Penyewa</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Activity size={20} color={isDark ? '#f97316' : '#ea580c'} variant="Bold" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Kegiatan</Text>
                <Text style={styles.infoValue}>{detailData.kegiatan?.nama || '-'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Buildings size={20} color={isDark ? '#6366f1' : '#4f46e5'} variant="Bold" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Penyewa</Text>
                <Text style={styles.infoValue}>{detailData.penyewa?.nama || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {detailData.keterangan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keterangan</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Note1 size={20} color={isDark ? '#9ca3af' : '#6b7280'} variant="Bold" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoValue}>{detailData.keterangan}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {detailData.reject_reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alasan Penolakan</Text>
            <View style={[styles.card, styles.rejectCard]}>
              <Text style={styles.rejectReason}>{detailData.reject_reason}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.editButton,
              (deleteLoading || detailData.status !== 'pending') && styles.disabledButton
            ]}
            onPress={handleEdit}
            disabled={deleteLoading || detailData.status !== 'pending'}
            activeOpacity={0.7}
          >
            <Edit2 size={20} color="#ffffff" variant="Bold" />
            <Text style={styles.editButtonText}>
              Edit Penugasan {detailData.status !== 'pending' && '(Disabled)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              (deleteLoading || detailData.status !== 'pending') && styles.disabledButton
            ]}
            onPress={handleDelete}
            disabled={deleteLoading || detailData.status !== 'pending'}
            activeOpacity={0.7}
          >
            {deleteLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Trash size={20} color="#ffffff" variant="Bold" />
                <Text style={styles.deleteButtonText}>
                  Hapus Penugasan {detailData.status !== 'pending' && '(Disabled)'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {detailData.status !== 'pending' && (
          <View style={styles.warningCard}>
            <InfoCircle size={20} color={isDark ? '#fbbf24' : '#d97706'} variant="Bold" />
            <Text style={styles.warningText}>
              Penugasan dengan status "{statusConfig.label}" tidak dapat diedit atau dihapus
            </Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
        isDark={isDark}
      />
    </AppScreen>
  );
}

const getStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? '#111827' : '#f3f4f6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? '#111827' : '#f3f4f6',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand-Bold',
    color: isDark ? '#f3f4f6' : '#1f2937',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    color: isDark ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: isDark ? '#ef4444' : '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand-Bold',
    color: '#ffffff',
  },
  headerCard: {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
  },
  codeValue: {
    fontSize: 20,
    fontFamily: 'Quicksand-Bold',
    color: isDark ? '#f3f4f6' : '#1f2937',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
    color: isDark ? '#f3f4f6' : '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    color: isDark ? '#9ca3af' : '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: isDark ? '#f3f4f6' : '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: isDark ? '#374151' : '#e5e7eb',
    marginVertical: 16,
  },
  rejectCard: {
    backgroundColor: isDark ? '#991b1b' : '#fee2e2',
    borderColor: isDark ? '#dc2626' : '#fca5a5',
  },
  rejectReason: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: isDark ? '#fca5a5' : '#dc2626',
    lineHeight: 20,
  },
  actionSection: {
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  editButton: {
    backgroundColor: isDark ? '#2563eb' : '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
    color: '#ffffff',
  },
  deleteButton: {
    backgroundColor: isDark ? '#dc2626' : '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: isDark ? '#4b5563' : '#9ca3af',
    opacity: 0.6,
  },
  warningCard: {
    backgroundColor: isDark ? '#92400e' : '#fef3c7',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: isDark ? '#b45309' : '#fbbf24',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: isDark ? '#fbbf24' : '#92400e',
    lineHeight: 18,
  },
});
