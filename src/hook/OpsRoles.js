import { useDispatch } from 'react-redux';
import { getPenyewa } from '../redux/penyewaSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLokasiPit } from '../redux/lokasiPitSlice';

const useGroupingActions = () => {
  const dispatch = useDispatch();

  const grouping = (roles, data) => {
    if (roles == 'cabang') {
      dispatch(getPenyewa.fulfilled({
        loading: false,
        data: data.penyewa
      }))
    }

    if (roles == 'lokasi') {
      console.log('LOKASI', data.lokasi);
      
      dispatch(getLokasiPit.fulfilled({
        loading: false,
        data: data.lokasi
      }))
    }
  };

  const ungrouping = async () => {
    let penyewa = await AsyncStorage.getItem('@penyewa')
    penyewa = JSON.parse(penyewa)
    dispatch(getPenyewa.fulfilled({
      loading: false,
      data: penyewa
    }))

    let pit = await AsyncStorage.getItem('@lokasi-pit')
    pit = JSON.parse(pit)
    dispatch(getLokasiPit.fulfilled({
      loading: false,
      data: pit
    }))
  };

  // Kembalikan fungsi yang bisa digunakan
  return {
    grouping,
    ungrouping,
  };
};

export default useGroupingActions;