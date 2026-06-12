import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import apiClient from '../../../../src/services/api/client';
import { API_ENDPOINTS } from '../../../../src/services/api/endpoints';

export default function useValidateItem(params, userProfile) {
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [item, setItem] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [pemasokList, setPemasokList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loadingBarang, setLoadingBarang] = useState(false);
  const [loadingPemasok, setLoadingPemasok] = useState(false);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [loadingMoreBarang, setLoadingMoreBarang] = useState(false);
  const [loadingMorePemasok, setLoadingMorePemasok] = useState(false);
  const [loadingMoreEquipment, setLoadingMoreEquipment] = useState(false);
  const [barangPage, setBarangPage] = useState(1);
  const [pemasokPage, setPemasokPage] = useState(1);
  const [equipmentPage, setEquipmentPage] = useState(1);
  const [hasMoreBarang, setHasMoreBarang] = useState(true);
  const [hasMorePemasok, setHasMorePemasok] = useState(true);
  const [hasMoreEquipment, setHasMoreEquipment] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState({ visible: false, type: '', title: '' });
  const [validationModal, setValidationModal] = useState({
    visible: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState({
    barang_id: '',
    pemasok_id: '',
    equipment_id: '',
    qty_acc: '',
    harga: '',
    ppn: '',
    subtotal: '',
    metode: '',
    currency: 'IDR',
    kurs: '1',
    potongan: '0',
  });

  const [fieldErrors, setFieldErrors] = useState({
    barang_id: false,
    pemasok_id: false,
    qty_acc: false,
  });

  const fetchItemDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.PURCHASE_REQUEST.DETAIL(params.roId));
      
      if (response.data?.diagnostic?.error === false) {
        const foundItem = response.data.rows.items?.find(i => i.id === parseInt(params.itemId));
        if (foundItem) {
          
          setItem(foundItem);
          setFormData({
            barang_id: foundItem.barang_id ? foundItem.barang_id.toString() : '',
            pemasok_id: foundItem.pemasok_id ? foundItem.pemasok_id.toString() : '',
            equipment_id: foundItem.equipment_id ? foundItem.equipment_id.toString() : '',
            qty_acc: foundItem.qty_acc?.toString() || foundItem.qty_req?.toString() || '',
            harga: foundItem.harga?.toString() || '',
            ppn: foundItem.ppn?.toString() || '0',
            subtotal: foundItem.subtotal?.toString() || '',
            metode: foundItem.metode || '',
            currency: foundItem.currency || 'IDR',
            kurs: foundItem.kurs?.toString() || '1',
            potongan: foundItem.potongan?.toString() || '0',
          });
          
        }
      }
    } catch (error) {
      console.error('Error fetching item detail:', error);
      Alert.alert('Error', 'Gagal memuat data item');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBarangList = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoadingBarang(true);
      } else {
        setLoadingMoreBarang(true);
      }
      
      const response = await apiClient.get(API_ENDPOINTS.BARANG.LIST, {
        params: { page: page, limit: 25 }
      });
      
      if (response.data?.diagnostic?.error === false) {
        const barangData = response.data.rows || [];
        const total = response.data.total || barangData.length;
        
        
        if (append) {
          setBarangList(prev => [...prev, ...barangData]);
        } else {
          setBarangList(barangData);
        }
        
        const currentTotal = append ? barangList.length + barangData.length : barangData.length;
        setHasMoreBarang(currentTotal < total && barangData.length === 25);
      }
    } catch (error) {
      console.error('Error fetching barang list:', error);
    } finally {
      setLoadingBarang(false);
      setLoadingMoreBarang(false);
    }
  };

  const fetchPemasokList = async (page = 1, append = false, search = '') => {
    try {
      if (!append) {
        setLoadingPemasok(true);
      } else {
        setLoadingMorePemasok(true);
      }
      
      const params = { page: page, limit: search ? 1000 : 25 };
      if (search) {
        params.keyword = search;
        params.q = search;
        params.search = search;
        params.nama = search;
      }
      
      const response = await apiClient.get(API_ENDPOINTS.PEMASOK.LIST, { params });
      
      
      if (response.data?.diagnostic?.error === false) {
        const pemasokData = response.data.rows || [];
        const total = response.data.total || pemasokData.length;
        
        
        if (append) {
          setPemasokList(prev => [...prev, ...pemasokData]);
        } else {
          setPemasokList(pemasokData);
        }
        
        const currentTotal = append ? pemasokList.length + pemasokData.length : pemasokData.length;
        setHasMorePemasok(currentTotal < total && pemasokData.length === 25);
        
      } else {
      }
    } catch (error) {
      console.error('💥 Error fetching pemasok list:', error);
      console.error('💥 Error response:', error.response?.data);
    } finally {
      setLoadingPemasok(false);
      setLoadingMorePemasok(false);
    }
  };

  const fetchEquipmentList = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoadingEquipment(true);
      } else {
        setLoadingMoreEquipment(true);
      }
      
      const response = await apiClient.get(API_ENDPOINTS.EQUIPMENT.LIST, {
        params: { page: page, limit: 25 }
      });
      
      if (response.data?.diagnostic?.error === false) {
        const equipmentData = response.data.rows || [];
        const total = response.data.total || equipmentData.length;
        
        if (append) {
          setEquipmentList(prev => [...prev, ...equipmentData]);
        } else {
          setEquipmentList(equipmentData);
        }
        
        const currentTotal = append ? equipmentList.length + equipmentData.length : equipmentData.length;
        setHasMoreEquipment(currentTotal < total && equipmentData.length === 25);
      }
    } catch (error) {
      console.error('Error fetching equipment list:', error);
    } finally {
      setLoadingEquipment(false);
      setLoadingMoreEquipment(false);
    }
  };

  useEffect(() => {
    const qty = parseFloat(formData.qty_acc) || 0;
    const price = parseFloat(formData.harga) || 0;
    const ppn = parseFloat(formData.ppn) || 0;
    const subtotal = (qty * price) + ppn;
    const newSubtotal = subtotal.toString();
    
    
    if (formData.subtotal !== newSubtotal) {
      setFormData(prev => ({ ...prev, subtotal: newSubtotal }));
    }
  }, [formData.qty_acc, formData.harga, formData.ppn]);

  const handleSubmit = async (router) => {
    console.log('=== VALIDATE ITEM DEBUG ===');
    console.log('userProfile:', userProfile);
    console.log('usertype:', userProfile?.usertype);
    console.log('========================');
    
    const allowedUserTypes = ['procurement', 'procurment', 'partadmin', 'partcounter'];
    const usertype = userProfile?.usertype?.toLowerCase();
    
    if (!allowedUserTypes.includes(usertype)) {
      setValidationModal({
        visible: true,
        type: 'error',
        title: 'Akses Ditolak',
        message: `Hanya user procurement yang dapat melakukan validasi.\n\nUser type Anda: ${userProfile?.usertype || 'tidak diketahui'}`,
        onConfirm: () => setValidationModal(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    const errors = {
      barang_id: !formData.barang_id,
      pemasok_id: !formData.pemasok_id,
      qty_acc: !formData.qty_acc,
    };
    
    setFieldErrors(errors);
    
    if (!formData.barang_id || !formData.qty_acc || !formData.pemasok_id) {
      const missingFields = [];
      if (!formData.barang_id) missingFields.push('Barang');
      if (!formData.pemasok_id) missingFields.push('Pemasok');
      if (!formData.qty_acc) missingFields.push('Qty Disetujui');
      
      setValidationModal({
        visible: true,
        type: 'warning',
        title: 'Data Tidak Lengkap',
        message: `Mohon lengkapi field berikut:\n\n${missingFields.map(f => `• ${f}`).join('\n')}\n\n❗ Field dengan border merah wajib diisi.`,
        onConfirm: () => setValidationModal(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    const qtyAcc = parseFloat(formData.qty_acc) || 0;
    const harga = parseFloat(formData.harga) || 0;
    const ppnAmount = parseFloat(formData.ppn) || 0;
    const potongan = parseFloat(formData.potongan) || 0;
    const totHarga = qtyAcc * harga;
    const subtotal = totHarga + ppnAmount - potongan;
    const currency = formData.currency || 'IDR';
    
    const confirmMessage = `Apakah Anda yakin ingin memvalidasi item ini?\n\nRingkasan:\n• Qty: ${qtyAcc} unit\n• Harga: ${currency === 'USD' ? '$' : 'Rp'} ${harga.toLocaleString('id-ID')}\n• Total: Rp ${subtotal.toLocaleString('id-ID')}\n\n⚠️ Data yang sudah divalidasi tidak dapat diubah kembali.`;

    setValidationModal({
      visible: true,
      type: 'confirm',
      title: 'Konfirmasi Validasi',
      message: confirmMessage,
      onConfirm: async () => {
        try {
          setValidationModal(prev => ({ ...prev, visible: false }));
          setSaving(true);
          
          const ppnPercentage = ppnAmount > 0 ? 11 : 0;
          
          const payload = {
            items: [{
              id: parseInt(params.itemId),
              barang_id: parseInt(formData.barang_id),
              pemasok_id: parseInt(formData.pemasok_id),
              equipment_id: formData.equipment_id ? parseInt(formData.equipment_id) : null,
              qty_acc: qtyAcc,
              harga: harga,
              ppn: ppnPercentage,
              ppn_rp: ppnAmount,
              tot_harga: totHarga,
              potongan: potongan,
              subtotal: subtotal,
              metode: formData.metode || '',
              currency: formData.currency || 'IDR',
              kurs: parseInt(formData.kurs) || 1,
            }]
          };

          console.log('=== VALIDATION PAYLOAD ===');
          console.log('Payload:', JSON.stringify(payload, null, 2));
          console.log('Params:', params);
          console.log('FormData:', formData);
          console.log('========================');

          const response = await apiClient.put(API_ENDPOINTS.PURCHASE_REQUEST.VALIDATE, payload);

          if (response.data?.diagnostic?.error === false) {
            const successMessage = `✅ Item berhasil divalidasi!\n\nDetail:\n• Qty: ${qtyAcc} unit\n• Subtotal: ${currency === 'USD' ? '$' : 'Rp'} ${subtotal.toLocaleString('id-ID')}\n• Status: Menunggu approval\n\nKembali ke halaman detail?`;
            
            setValidationModal({
              visible: true,
              type: 'success',
              title: 'Validasi Berhasil',
              message: successMessage,
              onConfirm: () => {
                setValidationModal(prev => ({ ...prev, visible: false }));
                router.back();
              },
            });
          } else {
            setValidationModal({
              visible: true,
              type: 'error',
              title: 'Validasi Gagal',
              message: response.data?.diagnostic?.message || 'Terjadi kesalahan saat memvalidasi item.',
              onConfirm: () => setValidationModal(prev => ({ ...prev, visible: false })),
            });
          }
        } catch (error) {
          console.error('=== VALIDATION ERROR ===');
          console.error('Error:', error);
          console.error('Error Response:', error.response);
          console.error('Error Data:', error.response?.data);
          console.error('Error Message:', error.message);
          console.error('Status:', error.response?.status);
          console.error('Response Text:', JSON.stringify(error.response?.data, null, 2));
          console.error('========================');
          
          let errorMessage = 'Terjadi kesalahan saat memvalidasi item.';
          
          if (error.response?.data?.diagnostic) {
            errorMessage = error.response.data.diagnostic.error || error.response.data.diagnostic.message || errorMessage;
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setValidationModal({
            visible: true,
            type: 'error',
            title: 'Validasi Gagal',
            message: errorMessage,
            onConfirm: () => setValidationModal(prev => ({ ...prev, visible: false })),
          });
        } finally {
          setSaving(false);
        }
      },
    });
  };

  useEffect(() => {
    if (params.itemId && params.roId) {
      fetchItemDetail();
      fetchBarangList();
      fetchPemasokList();
      fetchEquipmentList();
    }
  }, [params.itemId, params.roId]);

  return {
    loading,
    saving,
    refreshing,
    item,
    barangList,
    pemasokList,
    equipmentList,
    loadingBarang,
    loadingPemasok,
    loadingEquipment,
    loadingMoreBarang,
    loadingMorePemasok,
    loadingMoreEquipment,
    barangPage,
    pemasokPage,
    equipmentPage,
    hasMoreBarang,
    hasMorePemasok,
    hasMoreEquipment,
    searchQuery,
    showModal,
    validationModal,
    formData,
    fieldErrors,
    setFormData,
    setFieldErrors,
    setRefreshing,
    setSearchQuery,
    setShowModal,
    setValidationModal,
    setBarangPage,
    setPemasokPage,
    setEquipmentPage,
    setHasMoreBarang,
    setHasMorePemasok,
    setHasMoreEquipment,
    fetchItemDetail,
    fetchBarangList,
    fetchPemasokList,
    fetchEquipmentList,
    handleSubmit,
  };
}
