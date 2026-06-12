import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { AppScreen, HeaderScreen, CustomAlert } from '../../src/components/common';
import DatePickerModal from '../../src/components/common/DatePickerModal';
import { Calendar, Location, User, TruckFast, Activity, Add, People, Personalcard, Building, Home2, Map1, Shop, CloseCircle, TickCircle } from 'iconsax-react-native';
import moment from 'moment';
import 'moment/locale/id';
import { 
  getEquipmentPlanDetail,
  updateEquipmentPlan,
  clearDetailData 
} from '../../src/store/slices/equipmentPlanSlice';
import { getOprDrv } from '../../src/store/slices/oprdrvSlice';
import { getEquipment } from '../../src/store/slices/equipmentSlice';
import { getLokasiPit } from '../../src/store/slices/lokasiPitSlice';
import { getKegiatanPit } from '../../src/store/slices/kegiatanPitSlice';
import { getPenyewa } from '../../src/store/slices/penyewaSlice';
import { getShift } from '../../src/store/slices/shiftSlice';

moment.locale('id');

export default function EditEquipmentPlan() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const mode = useSelector(state => state.themes)?.value || 'light';
  const { user } = useSelector(state => state.auth);
  const oprdrv = useSelector(state => state.oprdrv);
  const equipment = useSelector(state => state.equipment);
  const lokasikerja = useSelector(state => state.lokasikerja);
  const kegiatankerja = useSelector(state => state.kegiatankerja);
  const penyewa = useSelector(state => state.penyewa);
  const shift = useSelector(state => state.shift);
  const { detailData, detailLoading, updateLoading, updateError } = useSelector(state => state.equipmentPlan);

  const planId = params.id;

  const oprdrvData = Array.isArray(oprdrv?.data) ? oprdrv.data : [];
  const equipmentData = Array.isArray(equipment?.data) ? equipment.data : [];
  const lokasiData = Array.isArray(lokasikerja?.data) ? lokasikerja.data : [];
  const kegiatanData = Array.isArray(kegiatankerja?.data) ? kegiatankerja.data : [];
  const penyewaData = Array.isArray(penyewa?.data) ? penyewa.data : [];
  const shiftData = Array.isArray(shift?.data) ? shift.data : [];

  const [showModal, setShowModal] = useState({ visible: false, type: '', data: [] });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: []
  });
  
  const [formData, setFormData] = useState({
    tanggal_tugas: moment().format('YYYY-MM-DD'),
    site_id: user?.karyawan?.cabang_id || '',
    penyewa_id: '',
    shift_id: '',
    equipment_id: '',
    karyawan_id: '',
    lokasi_id: '',
    lokasi_to: '',
    kegiatan_id: '',
    keterangan: '',
  });

  const [selectedLabels, setSelectedLabels] = useState({
    penyewa: '',
    shift: '',
    equipment: '',
    karyawan: '',
    lokasi: '',
    lokasi_to: '',
    kegiatan: '',
  });

  const [selectedEquipment, setSelectedEquipment] = useState(null);

  useEffect(() => {
    console.log('🚀 [Edit] Loading master data and equipment plan detail...');
    dispatch(getOprDrv());
    dispatch(getEquipment());
    dispatch(getLokasiPit());
    dispatch(getKegiatanPit());
    dispatch(getPenyewa());
    dispatch(getShift());
    
    if (planId) {
      dispatch(getEquipmentPlanDetail(planId));
    }

    // Don't clear detailData on unmount - detail page might need it
    // return () => {
    //   dispatch(clearDetailData());
    // };
  }, [planId]);

  useEffect(() => {
    if (detailData && !dataLoaded && oprdrvData.length > 0 && equipmentData.length > 0) {
      console.log('📝 [Edit] Pre-filling form with existing data:', detailData);
      
      const selectedEq = equipmentData.find(e => e.id === detailData.equipment_id);
      
      setFormData({
        tanggal_tugas: moment(detailData.tanggal_tugas).format('YYYY-MM-DD'),
        site_id: detailData.site_id,
        penyewa_id: detailData.penyewa_id,
        shift_id: detailData.shift_id,
        equipment_id: detailData.equipment_id,
        karyawan_id: detailData.karyawan_id,
        lokasi_id: detailData.lokasi_id,
        lokasi_to: detailData.lokasi_to || '',
        kegiatan_id: detailData.kegiatan_id,
        keterangan: detailData.keterangan || '',
      });

      setSelectedLabels({
        penyewa: detailData.penyewa?.nama || '',
        shift: detailData.shift?.nama || '',
        equipment: `${detailData.equipment?.kode || ''} - ${detailData.equipment?.model || ''}`,
        karyawan: detailData.karyawan?.nama || '',
        lokasi: detailData.lokasi?.nama || '',
        lokasi_to: detailData.lokasiTujuan?.nama || '',
        kegiatan: detailData.kegiatan?.nama || '',
      });

      setSelectedEquipment(selectedEq || null);
      setDataLoaded(true);
    }
  }, [detailData, oprdrvData, equipmentData, dataLoaded]);

  useEffect(() => {
    if (user) {
      const userArea = user?.karyawan?.area;
      
      if (lokasiData.length > 0 || oprdrvData.length > 0 || equipmentData.length > 0 || kegiatanData.length > 0) {
        const filteredLokasi = lokasiData.filter(l => l.cabang?.area === userArea);
        const filteredOprDrv = oprdrvData.filter(k => k.cabang?.area === userArea);
        
        console.log('🔍 Filter Info:', {
          userArea,
          userCabang: user?.karyawan?.cabang?.nama,
          lokasi: {
            total: lokasiData.length,
            filtered: filteredLokasi.length,
            items: filteredLokasi.map(l => `${l.nama} (${l.cabang?.nama || '-'})`).slice(0, 3).join(', ') + (filteredLokasi.length > 3 ? '...' : '')
          },
          oprdrv: {
            total: oprdrvData.length,
            filtered: filteredOprDrv.length,
            driver: filteredOprDrv.filter(k => k.section === 'driver').length,
            operator: filteredOprDrv.filter(k => k.section === 'operator').length,
            items: filteredOprDrv.map(k => `${k.nama} (${k.section})`).slice(0, 3).join(', ') + (filteredOprDrv.length > 3 ? '...' : '')
          },
          equipment: {
            total: equipmentData.length,
            DT: equipmentData.filter(e => e.kategori === 'DT').length,
            HE: equipmentData.filter(e => e.kategori === 'HE').length,
            models: [...new Set(equipmentData.map(e => e.model))].slice(0, 5).join(', ')
          },
          kegiatan: {
            total: kegiatanData.length,
            DT: kegiatanData.filter(k => k.grpequipment === 'DT').length,
            HE: kegiatanData.filter(k => k.grpequipment === 'HE').length,
            ctg: [...new Set(kegiatanData.map(k => k.ctg))].slice(0, 5).join(', ')
          }
        });
      }
    }
  }, [user, lokasiData, oprdrvData, equipmentData, kegiatanData]);

  useEffect(() => {
    if (updateError) {
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Error',
        message: updateError,
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    }
  }, [updateError]);

  const isDark = mode === 'dark';
  const styles = getStyles(isDark);

  const getSectionIcon = (section) => {
    const sectionLower = section.toLowerCase();
    if (sectionLower === 'driver') {
      return TruckFast;
    } else if (sectionLower === 'operator') {
      return Personalcard;
    }
    return People;
  };

  const getLokasiTypeIcon = (type) => {
    const typeUpper = type?.toUpperCase();
    if (typeUpper === 'STP') {
      return Building;
    } else if (typeUpper === 'PIT') {
      return Map1;
    } else if (typeUpper === 'PLG') {
      return Shop;
    } else if (typeUpper === 'OTH') {
      return Home2;
    }
    return Location;
  };

  const getLokasiTypeName = (type) => {
    const typeUpper = type?.toUpperCase();
    if (typeUpper === 'STP') return 'STOCKPILE';
    if (typeUpper === 'PIT') return 'PIT';
    if (typeUpper === 'PLG') return 'PELANGGAN';
    if (typeUpper === 'OTH') return 'LAINNYA';
    return type?.toUpperCase() || 'LAINNYA';
  };

  const groupBySection = (data) => {
    const grouped = data.reduce((acc, item) => {
      const section = item.section || 'Lainnya';
      const sectionKey = section.charAt(0).toUpperCase() + section.slice(1);
      
      if (!acc[sectionKey]) {
        acc[sectionKey] = [];
      }
      acc[sectionKey].push(item);
      return acc;
    }, {});
    
    return Object.keys(grouped)
      .sort()
      .map(section => ({
        section,
        data: grouped[section],
        count: grouped[section].length,
        area: grouped[section][0]?.cabang?.area || user?.karyawan?.area || '-'
      }));
  };

  const groupByLokasiType = (data) => {
    const grouped = data.reduce((acc, item) => {
      const type = item.type || 'OTH';
      const typeKey = type.toUpperCase();
      
      if (!acc[typeKey]) {
        acc[typeKey] = [];
      }
      acc[typeKey].push(item);
      return acc;
    }, {});
    
    const typeOrder = { 'STP': 1, 'PIT': 2, 'PLG': 3, 'OTH': 4 };
    
    return Object.keys(grouped)
      .sort((a, b) => (typeOrder[a] || 99) - (typeOrder[b] || 99))
      .map(type => ({
        type,
        typeName: getLokasiTypeName(type),
        data: grouped[type],
        count: grouped[type].length,
        area: grouped[type][0]?.cabang?.area || user?.karyawan?.area || '-'
      }));
  };

  const groupByEquipmentModel = (data) => {
    const grouped = data.reduce((acc, item) => {
      const model = item.model || 'Lainnya';
      
      if (!acc[model]) {
        acc[model] = [];
      }
      acc[model].push(item);
      return acc;
    }, {});
    
    return Object.keys(grouped)
      .sort()
      .map(model => ({
        model,
        data: grouped[model],
        count: grouped[model].length,
        kategori: grouped[model][0]?.kategori || '-'
      }));
  };

  const groupByKegiatanCtg = (data) => {
    const grouped = data.reduce((acc, item) => {
      const ctg = item.ctg || 'Lainnya';
      
      if (!acc[ctg]) {
        acc[ctg] = [];
      }
      acc[ctg].push(item);
      return acc;
    }, {});
    
    return Object.keys(grouped)
      .sort()
      .map(ctg => ({
        ctg,
        data: grouped[ctg],
        count: grouped[ctg].length,
        grpequipment: grouped[ctg][0]?.grpequipment || '-'
      }));
  };

  const openPicker = (type, title) => {
    let data = [];
    const userArea = user?.karyawan?.area;
    
    switch (type) {
      case 'penyewa':
        data = penyewaData;
        break;
      case 'shift':
        data = shiftData;
        break;
      case 'equipment':
        const selectedKaryawan = oprdrvData.find(k => k.id.toString() === formData.karyawan_id);
        const karyawanSection = selectedKaryawan?.section?.toLowerCase();
        
        data = equipmentData
          .filter(e => {
            if (!karyawanSection) return true;
            if (karyawanSection === 'driver') return e.kategori === 'DT';
            if (karyawanSection === 'operator') return e.kategori === 'HE';
            return true;
          })
          .map(e => ({ 
            ...e, 
            displayName: `${e.kode} - ${e.nama}`,
            nama: e.nama
          }));
        break;
      case 'karyawan':
        data = oprdrvData.filter(karyawan => {
          if (!userArea) return true;
          return karyawan.cabang?.area === userArea;
        });
        break;
      case 'lokasi':
      case 'lokasi_to':
        data = lokasiData.filter(lokasi => {
          if (!userArea) return true;
          return lokasi.cabang?.area === userArea;
        });
        break;
      case 'kegiatan':
        const selectedEquipmentKategori = selectedEquipment?.kategori;
        
        data = kegiatanData.filter(kegiatan => {
          if (!selectedEquipmentKategori) return true;
          return kegiatan.grpequipment === selectedEquipmentKategori;
        });
        break;
    }
    setShowModal({ visible: true, type, data, title });
    setSearchQuery('');
  };

  const handleSelect = (item) => {
    const { type } = showModal;
    
    if (type === 'equipment') {
      const selected = equipmentData.find(e => e.id === item.id);
      const currentKegiatan = kegiatanData.find(k => k.id.toString() === formData.kegiatan_id);
      
      let shouldResetKegiatan = false;
      if (currentKegiatan && selected) {
        if (currentKegiatan.grpequipment && currentKegiatan.grpequipment !== selected.kategori) {
          shouldResetKegiatan = true;
        }
      }
      
      setSelectedEquipment(selected);
      setFormData(prev => ({ 
        ...prev, 
        equipment_id: item.id.toString(), 
        lokasi_to: '',
        ...(shouldResetKegiatan && { kegiatan_id: '' })
      }));
      setSelectedLabels(prev => ({ 
        ...prev, 
        equipment: item.displayName || item.nama, 
        lokasi_to: '',
        ...(shouldResetKegiatan && { kegiatan: '' })
      }));
    } else if (type === 'lokasi_to') {
      setFormData(prev => ({ ...prev, lokasi_to: item.id.toString() }));
      setSelectedLabels(prev => ({ ...prev, lokasi_to: item.nama }));
    } else if (type === 'karyawan') {
      const currentEquipment = equipmentData.find(e => e.id.toString() === formData.equipment_id);
      const newKaryawanSection = item.section?.toLowerCase();
      
      let shouldResetEquipment = false;
      if (currentEquipment && newKaryawanSection) {
        if (newKaryawanSection === 'driver' && currentEquipment.kategori !== 'DT') {
          shouldResetEquipment = true;
        } else if (newKaryawanSection === 'operator' && currentEquipment.kategori !== 'HE') {
          shouldResetEquipment = true;
        }
      }
      
      setFormData(prev => ({ 
        ...prev, 
        karyawan_id: item.id.toString(),
        ...(shouldResetEquipment && { equipment_id: '', lokasi_to: '', kegiatan_id: '' })
      }));
      setSelectedLabels(prev => ({ 
        ...prev, 
        karyawan: item.nama,
        ...(shouldResetEquipment && { equipment: '', lokasi_to: '', kegiatan: '' })
      }));
      
      if (shouldResetEquipment) {
        setSelectedEquipment(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [`${type}_id`]: item.id.toString() }));
      setSelectedLabels(prev => ({ ...prev, [type]: item.nama }));
    }
    
    setShowModal({ visible: false, type: '', data: [] });
  };

  const validateForm = () => {
    if (!formData.penyewa_id) {
      Alert.alert('Validasi', 'Penyewa wajib dipilih');
      return false;
    }
    if (!formData.shift_id) {
      Alert.alert('Validasi', 'Shift wajib dipilih');
      return false;
    }
    if (!formData.equipment_id) {
      Alert.alert('Validasi', 'Equipment wajib dipilih');
      return false;
    }
    if (!formData.karyawan_id) {
      Alert.alert('Validasi', 'Operator/Driver wajib dipilih');
      return false;
    }
    if (!formData.lokasi_id) {
      Alert.alert('Validasi', 'Lokasi awal wajib dipilih');
      return false;
    }
    if (!formData.kegiatan_id) {
      Alert.alert('Validasi', 'Kegiatan wajib dipilih');
      return false;
    }
    return true;
  };

  // Not needed in edit mode
  // const handleAddToList = () => { ... }
  // const handleRemoveFromList = (id) => { ... }

  const handleSubmit = async () => {
    const validationErrors = [];

    if (!formData.tanggal_tugas) validationErrors.push('Tanggal Tugas harus diisi');
    if (!formData.penyewa_id) validationErrors.push('Penyewa harus dipilih');
    if (!formData.shift_id) validationErrors.push('Shift harus dipilih');
    if (!formData.equipment_id) validationErrors.push('Equipment harus dipilih');
    if (!formData.karyawan_id) validationErrors.push('Operator/Driver harus dipilih');
    if (!formData.lokasi_id) validationErrors.push('Lokasi Kerja harus dipilih');
    if (!formData.kegiatan_id) validationErrors.push('Kegiatan harus dipilih');

    if (validationErrors.length > 0) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        title: 'Validasi',
        message: validationErrors.join('\n'),
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }

    console.log('📝 [Edit] Updating equipment plan:', { planId, formData });

    try {
      const updateData = { ...formData };
      
      if (updateData.lokasi_to === '' || updateData.lokasi_to === undefined) {
        updateData.lokasi_to = null;
      }
      
      const numericFields = ['site_id', 'penyewa_id', 'shift_id', 'equipment_id', 'karyawan_id', 'lokasi_id', 'lokasi_to', 'kegiatan_id'];
      numericFields.forEach(field => {
        if (updateData[field] !== null && updateData[field] !== undefined && updateData[field] !== '') {
          updateData[field] = parseInt(updateData[field], 10);
        } else if (field === 'lokasi_to') {
          updateData[field] = null;
        }
      });

      console.log('🧹 [Edit] Cleaned update data:', updateData);

      await dispatch(updateEquipmentPlan({ id: planId, data: updateData })).unwrap();
      
      console.log('✅ [Edit] Update successful');
      
      setAlertConfig({
        visible: true,
        type: 'success',
        title: 'Sukses',
        message: 'Penugasan berhasil diupdate',
        buttons: [{ text: 'OK', onPress: () => router.back() }]
      });
      
    } catch (error) {
      console.error('❌ [Edit] Update failed:', error);
      
      const errorMessage = error.message || error.toString();
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Error',
        message: errorMessage,
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    }
  };

  const filteredData = showModal.data.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    if (showModal.type === 'equipment') {
      return item.nama?.toLowerCase().includes(searchLower) || 
             item.kode?.toLowerCase().includes(searchLower) ||
             item.manufaktur?.toLowerCase().includes(searchLower);
    }
    return item.nama?.toLowerCase().includes(searchLower);
  });

  const groupedKaryawan = showModal.type === 'karyawan' && filteredData.length > 0
    ? groupBySection(filteredData)
    : [];

  const groupedLokasi = (showModal.type === 'lokasi' || showModal.type === 'lokasi_to') && filteredData.length > 0
    ? groupByLokasiType(filteredData)
    : [];

  const groupedEquipment = showModal.type === 'equipment' && filteredData.length > 0
    ? groupByEquipmentModel(filteredData)
    : [];

  const groupedKegiatan = showModal.type === 'kegiatan' && filteredData.length > 0
    ? groupByKegiatanCtg(filteredData)
    : [];

  const countOperators = oprdrvData.filter(k => formData.karyawan_id && k.id.toString() === formData.karyawan_id).length;
  const countDT = equipmentData.filter(e => e.kategori === 'DT' && formData.equipment_id && e.id.toString() === formData.equipment_id).length;
  const countHE = equipmentData.filter(e => e.kategori !== 'DT' && formData.equipment_id && e.id.toString() === formData.equipment_id).length;

  if (detailLoading) {
    return (
      <AppScreen>
        <HeaderScreen 
          title="Edit Penugasan" 
          onBack={() => router.back()}
          onThemes={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#3b82f6'} />
          <Text style={styles.loadingText}>Memuat data penugasan...</Text>
        </View>
      </AppScreen>
    );
  }

  if (!detailData) {
    return (
      <AppScreen>
        <HeaderScreen 
          title="Edit Penugasan" 
          onBack={() => router.back()}
          onThemes={true}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Data penugasan tidak ditemukan</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <HeaderScreen 
        title="Edit Penugasan" 
        onBack={() => router.back()}
        onThemes={true}
      />

      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Plan Code Header */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.codeText}>{detailData.plan_code}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoBody}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cabang</Text>
                <Text style={styles.infoValue}>: {user?.karyawan?.cabang?.nama || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Area</Text>
                <Text style={styles.infoValue}>: {user?.karyawan?.cabang?.area || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Perusahaan</Text>
                <Text style={styles.infoValue}>: {user?.nm_bisnis || '-'}</Text>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Data Penugasan</Text>

            {/* Tanggal Penugasan */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Calendar size={18} color="#f97316" variant="Bold" />
                <Text style={styles.fieldLabel}>Tanggal Penugasan</Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.selectText}>
                  {moment(formData.tanggal_tugas).format('dddd, DD/MM/YYYY')}
                </Text>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Penyewa */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <User size={18} color="#f97316" variant="Bold" />
                <Text style={styles.fieldLabel}>Penyewa</Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton} 
                onPress={() => openPicker('penyewa', 'Pilih Penyewa')}
              >
                <Text style={[styles.selectText, !selectedLabels.penyewa && styles.placeholderText]}>
                  {selectedLabels.penyewa || 'Pilih'}
                </Text>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Operator/Driver */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <User size={18} color="#f97316" variant="Bold" />
                <Text style={styles.fieldLabel}>Operator/Driver</Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton} 
                onPress={() => openPicker('karyawan', 'Pilih Operator/Driver')}
              >
                <Text style={[styles.selectText, !selectedLabels.karyawan && styles.placeholderText]}>
                  {selectedLabels.karyawan || 'Pilih'}
                </Text>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Equipment */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <TruckFast size={18} color="#f97316" variant="Bold" />
                <Text style={styles.fieldLabel}>Equipment</Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton} 
                onPress={() => openPicker('equipment', 'Pilih Equipment')}
              >
                <Text style={[styles.selectText, !selectedLabels.equipment && styles.placeholderText]}>
                  {selectedLabels.equipment || 'Pilih'}
                </Text>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Shift Kerja */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Activity size={18} color="#f97316" variant="Bold" />
                <Text style={styles.fieldLabel}>Shift Kerja</Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton} 
                onPress={() => openPicker('shift', 'Pilih Shift')}
              >
                <Text style={[styles.selectText, !selectedLabels.shift && styles.placeholderText]}>
                  {selectedLabels.shift || 'Pilih'}
                </Text>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Lokasi Kerja */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Location size={18} color="#f97316" variant="Bold" />
                <Text style={styles.fieldLabel}>Lokasi Kerja</Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton} 
                onPress={() => openPicker('lokasi', 'Pilih Lokasi')}
              >
                <Text style={[styles.selectText, !selectedLabels.lokasi && styles.placeholderText]}>
                  {selectedLabels.lokasi || 'Pilih'}
                </Text>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>

            {selectedEquipment?.kategori === 'DT' && (
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Location size={18} color="#10b981" variant="Bold" />
                  <Text style={styles.fieldLabel}>Lokasi Tujuan</Text>
                  <View style={styles.optionalBadge}>
                    <Text style={styles.optionalText}>Opsional</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.selectButton} 
                  onPress={() => openPicker('lokasi_to', 'Pilih Lokasi Tujuan')}
                >
                  <Text style={[styles.selectText, !selectedLabels.lokasi_to && styles.placeholderText]}>
                    {selectedLabels.lokasi_to || 'Pilih'}
                  </Text>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Jenis Kegiatan */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Activity size={18} color="#f97316" variant="Bold" />
                <Text style={styles.fieldLabel}>Jenis Kegiatan</Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton} 
                onPress={() => openPicker('kegiatan', 'Pilih Kegiatan')}
              >
                <Text style={[styles.selectText, !selectedLabels.kegiatan && styles.placeholderText]}>
                  {selectedLabels.kegiatan || 'Pilih'}
                </Text>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={updateLoading}
            >
              {updateLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Simpan Perubahan</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(date) => {
          setFormData(prev => ({ ...prev, tanggal_tugas: moment(date).format('YYYY-MM-DD') }));
          setShowDatePicker(false);
        }}
        date={new Date(formData.tanggal_tugas)}
        title="Pilih Tanggal Penugasan"
      />

      {/* Modal Picker */}
      {showModal.visible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{showModal.title}</Text>
              <TouchableOpacity onPress={() => setShowModal({ visible: false, type: '', data: [] })}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Cari..."
              placeholderTextColor={isDark ? '#9ca3af' : '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <ScrollView style={styles.modalList}>
              {showModal.type === 'karyawan' && groupedKaryawan.length > 0 ? (
                // Grouped list for karyawan (by section)
                groupedKaryawan.map((group, groupIndex) => {
                  const SectionIcon = getSectionIcon(group.section);
                  return (
                    <View key={groupIndex}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                          <SectionIcon 
                            size={18} 
                            color={isDark ? '#f97316' : '#f97316'} 
                            variant="Bold"
                          />
                          <View style={styles.sectionHeaderTextContainer}>
                            <Text style={styles.sectionHeaderText}>{group.section}</Text>
                            <Text style={styles.sectionHeaderArea}>Area {group.area}</Text>
                          </View>
                        </View>
                        <View style={styles.sectionHeaderBadge}>
                          <Text style={styles.sectionHeaderCount}>{group.count}</Text>
                        </View>
                      </View>
                      {group.data.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.modalItem}
                        onPress={() => handleSelect(item)}
                      >
                        <View style={styles.modalItemContent}>
                          <Text style={styles.modalItemText}>{item.nama}</Text>
                          <Text style={styles.modalItemSubtext}>
                            {item.section}
                          </Text>
                        </View>
                        <Text style={styles.modalItemArrow}>›</Text>
                      </TouchableOpacity>
                      ))}
                    </View>
                  );
                })
              ) : (showModal.type === 'lokasi' || showModal.type === 'lokasi_to') && groupedLokasi.length > 0 ? (
                // Grouped list for lokasi (by type)
                groupedLokasi.map((group, groupIndex) => {
                  const TypeIcon = getLokasiTypeIcon(group.type);
                  return (
                    <View key={groupIndex}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                          <TypeIcon 
                            size={18} 
                            color={isDark ? '#f97316' : '#f97316'} 
                            variant="Bold"
                          />
                          <View style={styles.sectionHeaderTextContainer}>
                            <Text style={styles.sectionHeaderText}>{group.typeName}</Text>
                            <Text style={styles.sectionHeaderArea}>Area {group.area}</Text>
                          </View>
                        </View>
                        <View style={styles.sectionHeaderBadge}>
                          <Text style={styles.sectionHeaderCount}>{group.count}</Text>
                        </View>
                      </View>
                      {group.data.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.modalItem}
                        onPress={() => handleSelect(item)}
                      >
                        <View style={styles.modalItemContent}>
                          <Text style={styles.modalItemText}>{item.nama}</Text>
                          {item.cabang?.nama && (
                            <Text style={styles.modalItemSubtext}>{item.cabang.nama}</Text>
                          )}
                        </View>
                        <Text style={styles.modalItemArrow}>›</Text>
                      </TouchableOpacity>
                      ))}
                    </View>
                  );
                })
              ) : showModal.type === 'equipment' && groupedEquipment.length > 0 ? (
                // Grouped list for equipment (by model)
                groupedEquipment.map((group, groupIndex) => {
                  return (
                    <View key={groupIndex}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                          <TruckFast 
                            size={18} 
                            color={isDark ? '#f97316' : '#f97316'} 
                            variant="Bold"
                          />
                          <View style={styles.sectionHeaderTextContainer}>
                            <Text style={styles.sectionHeaderText}>{group.model}</Text>
                            <Text style={styles.sectionHeaderArea}>Kategori {group.kategori}</Text>
                          </View>
                        </View>
                        <View style={styles.sectionHeaderBadge}>
                          <Text style={styles.sectionHeaderCount}>{group.count}</Text>
                        </View>
                      </View>
                      {group.data.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.modalItem}
                        onPress={() => handleSelect(item)}
                      >
                        <View style={styles.modalItemContent}>
                          <Text style={styles.modalItemText}>{item.kode}</Text>
                          <Text style={styles.modalItemSubtext}>{item.manufaktur}</Text>
                        </View>
                        <Text style={styles.modalItemArrow}>›</Text>
                      </TouchableOpacity>
                      ))}
                    </View>
                  );
                })
              ) : showModal.type === 'kegiatan' && groupedKegiatan.length > 0 ? (
                // Grouped list for kegiatan (by ctg)
                groupedKegiatan.map((group, groupIndex) => {
                  return (
                    <View key={groupIndex}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                          <Activity 
                            size={18} 
                            color={isDark ? '#f97316' : '#f97316'} 
                            variant="Bold"
                          />
                          <View style={styles.sectionHeaderTextContainer}>
                            <Text style={styles.sectionHeaderText}>{group.ctg}</Text>
                            <Text style={styles.sectionHeaderArea}>Group {group.grpequipment}</Text>
                          </View>
                        </View>
                        <View style={styles.sectionHeaderBadge}>
                          <Text style={styles.sectionHeaderCount}>{group.count}</Text>
                        </View>
                      </View>
                      {group.data.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.modalItem}
                        onPress={() => handleSelect(item)}
                      >
                        <View style={styles.modalItemContent}>
                          <Text style={styles.modalItemText}>{item.nama}</Text>
                          {item.narasi && (
                            <Text style={styles.modalItemSubtext}>{item.narasi}</Text>
                          )}
                        </View>
                        <Text style={styles.modalItemArrow}>›</Text>
                      </TouchableOpacity>
                      ))}
                    </View>
                  );
                })
              ) : filteredData.length > 0 ? (
                // Regular list for other types
                filteredData.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.modalItem}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.modalItemContent}>
                      <Text style={styles.modalItemText}>{item.nama}</Text>
                      {(showModal.type === 'lokasi' || showModal.type === 'lokasi_to') && item.cabang?.nama && (
                        <Text style={styles.modalItemSubtext}>{item.cabang.nama}</Text>
                      )}
                    </View>
                    <Text style={styles.modalItemArrow}>›</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noData}>
                    {showModal.data.length === 0 && (showModal.type === 'lokasi' || showModal.type === 'lokasi_to') && user?.karyawan?.area
                      ? `Tidak ada lokasi kerja untuk area ${user.karyawan.area}`
                      : 'Tidak ada data'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

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
    backgroundColor: isDark ? '#111827' : '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? '#111827' : '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? '#111827' : '#F8F9FA',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: isDark ? '#fca5a5' : '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: isDark ? '#3b82f6' : '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoCard: {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    padding: 16,
    marginBottom: 2,
  },
  infoHeader: {
    paddingBottom: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#60a5fa' : '#2563eb',
  },
  divider: {
    height: 1,
    backgroundColor: isDark ? '#374151' : '#e5e7eb',
    marginVertical: 8,
  },
  infoBody: {
    paddingTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: isDark ? '#9ca3af' : '#666',
    width: 100,
  },
  infoValue: {
    fontSize: 13,
    color: isDark ? '#e5e7eb' : '#000',
    fontWeight: '500',
    flex: 1,
  },
  formCard: {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    padding: 16,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#000',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: isDark ? '#e5e7eb' : '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  requiredBadge: {
    backgroundColor: '#f97316',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  optionalBadge: {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: isDark ? '#6b7280' : '#d1d5db',
  },
  optionalText: {
    fontSize: 9,
    fontWeight: '600',
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  inputWithIcon: {
    backgroundColor: isDark ? '#374151' : '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: isDark ? '#4b5563' : '#E0E0E0',
  },
  inputText: {
    fontSize: 14,
    color: isDark ? '#fff' : '#000',
  },
  selectButton: {
    backgroundColor: isDark ? '#374151' : '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: isDark ? '#4b5563' : '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 14,
    color: isDark ? '#fff' : '#000',
    flex: 1,
  },
  placeholderText: {
    color: isDark ? '#9ca3af' : '#999',
  },
  arrowIcon: {
    fontSize: 24,
    color: isDark ? '#9ca3af' : '#999',
    fontWeight: '300',
  },
  actionContainer: {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    padding: 16,
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f97316',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f97316',
  },
  submitButton: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
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
    backgroundColor: isDark ? '#1f2937' : '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#000',
  },
  modalClose: {
    fontSize: 28,
    color: isDark ? '#9ca3af' : '#666',
    fontWeight: '300',
  },
  searchInput: {
    margin: 16,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: isDark ? '#374151' : '#F5F5F5',
    color: isDark ? '#fff' : '#000',
    fontSize: 14,
  },
  modalList: {
    maxHeight: 400,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#1f2937' : '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: isDark ? '#374151' : '#f97316',
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionHeaderTextContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: isDark ? '#fff' : '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionHeaderArea: {
    fontSize: 11,
    fontWeight: '500',
    color: isDark ? '#9ca3af' : '#666',
  },
  sectionHeaderBadge: {
    backgroundColor: isDark ? '#f97316' : '#fed7aa',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderCount: {
    fontSize: 12,
    fontWeight: '700',
    color: isDark ? '#fff' : '#f97316',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#F0F0F0',
  },
  modalItemContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  modalItemText: {
    fontSize: 14,
    color: isDark ? '#e5e7eb' : '#333',
    fontWeight: '500',
  },
  modalItemSubtext: {
    fontSize: 12,
    color: isDark ? '#9ca3af' : '#666',
    marginTop: 2,
  },
  modalItemArrow: {
    fontSize: 20,
    color: isDark ? '#9ca3af' : '#999',
    fontWeight: '300',
    marginLeft: 12,
  },
  noDataContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noData: {
    textAlign: 'center',
    color: isDark ? '#9ca3af' : '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});
