import { getEquipment } from '../../store/slices/equipmentSlice';
import { getCabang } from '../../store/slices/cabangSlice';
import { getLokasiPit } from '../../store/slices/lokasiPitSlice';

// Equipment Actions
export const fetchEquipmentData = () => (dispatch) => {
  try {
    dispatch(getEquipment());
  } catch (error) {
    console.error('[Equipment Actions] Error fetching equipment:', error);
  }
};

// Cabang Actions
export const fetchCabangData = () => (dispatch) => {
  try {
    dispatch(getCabang());
  } catch (error) {
    console.error('[Cabang Actions] Error fetching cabang:', error);
  }
};

// Lokasi Kerja Actions
export const fetchLokasiKerjaData = () => (dispatch) => {
  try {
    dispatch(getLokasiPit());
  } catch (error) {
    console.error('[Lokasi Kerja Actions] Error fetching lokasi kerja:', error);
  }
};