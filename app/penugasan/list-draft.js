/* eslint-disable react/no-unescaped-entities */
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { AppScreen, HeaderScreen } from '../../src/components/common';
import { User, TruckFast, Activity, Location, CloseCircle, Note, CalendarTick, Building2, Calendar } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { removeDraftAssignment } from '../../src/store/slices/equipmentDraftPlanSlice';

moment.locale('id');

export default function ListDraftPenugasan() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const { draftAssignments } = useSelector(state => state.equipmentDraftPlan);
  const isDark = mode === 'dark';
  const styles = getStyles(isDark);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRemove = (id) => {
    dispatch(removeDraftAssignment(id));
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.emptyIconCircle}>
          <Note size={64} color="#f97316" variant="Bulk" />
        </View>
      </View>
      
      <Text style={styles.emptyTitle}>Belum Ada Penugasan</Text>
      <Text style={styles.emptyDescription}>
        Anda belum menambahkan penugasan apapun.{'\n'}
        Silakan tambahkan penugasan terlebih dahulu.
      </Text>

      <View style={styles.emptyStepsContainer}>
        <Text style={styles.emptyStepsTitle}>Langkah-langkah:</Text>
        
        <View style={styles.emptyStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>Isi form penugasan dengan lengkap</Text>
        </View>

        <View style={styles.emptyStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>Klik tombol "Tambah ke Daftar"</Text>
        </View>

        <View style={styles.emptyStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepText}>Ulangi untuk penugasan lainnya</Text>
        </View>

        <View style={styles.emptyStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.stepText}>Kirim semua penugasan sekaligus</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.back()}
      >
        <Text style={styles.emptyButtonText}>Kembali ke Form</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAssignmentCard = (assignment, index) => (
    <Animated.View 
      key={assignment.id} 
      style={[
        styles.assignmentCard,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.assignmentHeader}>
        <View style={styles.assignmentHeaderLeft}>
          <View style={styles.assignmentNumber}>
            <Text style={styles.assignmentNumberText}>#{index + 1}</Text>
          </View>
          <View style={[
            styles.assignmentBadge,
            assignment.equipmentKategori === 'DT' ? styles.badgeDT : styles.badgeHE
          ]}>
            <Text style={styles.assignmentBadgeText}>
              {assignment.equipmentKategori === 'DT' ? 'DUMP TRUCK' : 'HEAVY EQUIPMENT'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemove(assignment.id)}
        >
          <CloseCircle size={24} color="#ef4444" variant="Bold" />
        </TouchableOpacity>
      </View>

      <View style={styles.assignmentBody}>
        <View style={styles.infoRow}>
          <Calendar size={16} color="#3b82f6" variant="Bold" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Tanggal Penugasan</Text>
            <Text style={styles.infoValue}>
              {moment(assignment.tanggal_tugas).format('dddd, DD MMMM YYYY')}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <User size={16} color="#f97316" variant="Bold" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Operator/Driver</Text>
            <Text style={styles.infoValue}>{assignment.labels.karyawan}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <TruckFast size={16} color="#f97316" variant="Bold" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Equipment</Text>
            <Text style={styles.infoValue}>{assignment.labels.equipment}</Text>
            <Text style={styles.infoMeta}>
              {assignment.equipmentModel} • {assignment.equipmentManufaktur}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Activity size={16} color="#f97316" variant="Bold" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Shift Kerja</Text>
            <Text style={styles.infoValue}>{assignment.labels.shift}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Location size={16} color="#f97316" variant="Bold" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Lokasi Kerja</Text>
            <Text style={styles.infoValue}>{assignment.labels.lokasi}</Text>
          </View>
        </View>

        {assignment.labels.lokasi_to && (
          <View style={styles.infoRow}>
            <Location size={16} color="#10b981" variant="Bold" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Lokasi Tujuan</Text>
              <Text style={styles.infoValue}>{assignment.labels.lokasi_to}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoRow}>
          <Activity size={16} color="#f97316" variant="Bold" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Jenis Kegiatan</Text>
            <Text style={styles.infoValue}>{assignment.labels.kegiatan}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <AppScreen>
      <HeaderScreen 
        title="Detail Penugasan" 
        onBack={() => router.back()}
        onThemes={true}
      />

      <View style={styles.container}>
        {draftAssignments.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <CalendarTick size={20} color="#f97316" variant="Bold" />
              <Text style={styles.summaryTitle}>Ringkasan Penugasan</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>{draftAssignments.length}</Text>
                <Text style={styles.summaryUnit}>Penugasan</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Dump Truck</Text>
                <Text style={styles.summaryValue}>
                  {draftAssignments.filter(a => a.equipmentKategori === 'DT').length}
                </Text>
                <Text style={styles.summaryUnit}>Unit</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Heavy Equip</Text>
                <Text style={styles.summaryValue}>
                  {draftAssignments.filter(a => a.equipmentKategori === 'HE').length}
                </Text>
                <Text style={styles.summaryUnit}>Unit</Text>
              </View>
            </View>
          </View>
        )}

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={draftAssignments.length === 0 && styles.contentEmpty}
        >
          {draftAssignments.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.listContainer}>
              {draftAssignments.map((assignment, index) => 
                renderAssignmentCard(assignment, index)
              )}
            </View>
          )}
        </ScrollView>

        {draftAssignments.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Kembali ke Form</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AppScreen>
  );
}

const getStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  contentEmpty: {
    flexGrow: 1,
  },
  summaryCard: {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: isDark ? '#111827' : '#F8F9FA',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#000',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: isDark ? '#9ca3af' : '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f97316',
    marginBottom: 2,
  },
  summaryUnit: {
    fontSize: 11,
    color: isDark ? '#9ca3af' : '#666',
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: isDark ? '#374151' : '#E0E0E0',
  },
  listContainer: {
    padding: 16,
  },
  assignmentCard: {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#374151' : '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#4b5563' : '#E0E0E0',
  },
  assignmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  assignmentNumber: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  assignmentNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  assignmentBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
  },
  badgeDT: {
    backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
  },
  badgeHE: {
    backgroundColor: isDark ? '#065f46' : '#d1fae5',
  },
  assignmentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: isDark ? '#fff' : '#000',
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
  },
  assignmentBody: {
    padding: 16,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: isDark ? '#9ca3af' : '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#e5e7eb' : '#000',
    marginBottom: 2,
  },
  infoMeta: {
    fontSize: 12,
    color: isDark ? '#6b7280' : '#9ca3af',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: isDark ? '#1f2937' : '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: isDark ? '#374151' : '#fed7aa',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    color: isDark ? '#9ca3af' : '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyStepsContainer: {
    width: '100%',
    backgroundColor: isDark ? '#1f2937' : '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#E0E0E0',
  },
  emptyStepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f97316',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    fontSize: 14,
    color: isDark ? '#e5e7eb' : '#333',
    flex: 1,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#374151' : '#E0E0E0',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#f97316',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f97316',
  },
});
