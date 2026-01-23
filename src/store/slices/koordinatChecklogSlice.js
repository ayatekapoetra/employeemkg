import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Redux Slice for Koordinat Checklog
 * Manages checklog location data with offline SQLite support
 */

export const getKoordinatChecklog = createAsyncThunk(
  'koordinatChecklog/getKoordinatChecklog',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[KoordinatChecklog] Fetching from API...');

      // Try to fetch from API first
      const response = await apiClient.get(API_ENDPOINTS.CHECKLOG.LOCATIONS);
      const apiData = response.data?.rows || response.data?.data || response.data || [];

      console.log('[KoordinatChecklog] API response:', apiData.length, 'items');

      if (apiData.length > 0) {
        // Sync to SQLite
        const syncResult = await database.syncKoordinatChecklog(apiData);
        console.log('[KoordinatChecklog] Synced to SQLite:', syncResult.successCount, 'items');

        // Save to AsyncStorage as additional fallback
        try {
          await AsyncStorage.setItem('@koordinatChecklog', JSON.stringify(apiData));
        } catch (e) {
          console.warn('[KoordinatChecklog] Failed to save to AsyncStorage:', e.message);
        }

        return apiData;
      }

      // If API returns empty, try SQLite fallback
      console.log('[KoordinatChecklog] API empty, trying SQLite fallback...');
      const dbData = await database.getKoordinatChecklog();
      if (dbData.length > 0) {
        console.log('[KoordinatChecklog] Loaded from SQLite:', dbData.length, 'items');
        return dbData;
      }

      // Final fallback: AsyncStorage
      console.log('[KoordinatChecklog] SQLite empty, trying AsyncStorage fallback...');
      const storageData = await AsyncStorage.getItem('@koordinatChecklog');
      if (storageData) {
        const parsed = JSON.parse(storageData);
        console.log('[KoordinatChecklog] Loaded from AsyncStorage:', parsed.length, 'items');
        return parsed;
      }

      console.warn('[KoordinatChecklog] No data found from any source');
      return [];

    } catch (error) {
      console.error('[KoordinatChecklog] Error fetching from API:', error?.message || error);

      // Try SQLite fallback on error
      try {
        const dbData = await database.getKoordinatChecklog();
        if (dbData.length > 0) {
          console.log('[KoordinatChecklog] Loaded from SQLite (error fallback):', dbData.length, 'items');
          return dbData;
        }
      } catch (dbError) {
        console.error('[KoordinatChecklog] SQLite fallback failed:', dbError?.message);
      }

      // Try AsyncStorage fallback on error
      try {
        const storageData = await AsyncStorage.getItem('@koordinatChecklog');
        if (storageData) {
          const parsed = JSON.parse(storageData);
          console.log('[KoordinatChecklog] Loaded from AsyncStorage (error fallback):', parsed.length, 'items');
          return parsed;
        }
      } catch (storageError) {
        console.error('[KoordinatChecklog] AsyncStorage fallback failed:', storageError?.message);
      }

      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getKoordinatChecklogOffline = createAsyncThunk(
  'koordinatChecklog/getKoordinatChecklogOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[KoordinatChecklog] Fetching from SQLite (offline mode)...');

      // Try SQLite first
      const dbData = await database.getKoordinatChecklog();
      if (dbData.length > 0) {
        console.log('[KoordinatChecklog] Loaded from SQLite:', dbData.length, 'items');
        return dbData;
      }

      // Fallback to AsyncStorage
      console.log('[KoordinatChecklog] SQLite empty, trying AsyncStorage...');
      const storageData = await AsyncStorage.getItem('@koordinatChecklog');
      if (storageData) {
        const parsed = JSON.parse(storageData);
        console.log('[KoordinatChecklog] Loaded from AsyncStorage:', parsed.length, 'items');
        return parsed;
      }

      console.warn('[KoordinatChecklog] No offline data found');
      return [];

    } catch (error) {
      console.error('[KoordinatChecklog] Error fetching offline data:', error?.message || error);
      return rejectWithValue(error?.message || 'Failed to fetch offline data');
    }
  }
);

/**
 * Selector: Get koordinat checklog filtered by user's cabang
 */
export const selectKoordinatChecklogByUserCabang = (state) => {
  const userCabangId = state.auth?.karyawan?.cabang_id || state.auth?.user?.karyawan?.cabang_id;

  if (!userCabangId) {
    return state.koordinatChecklog?.data || [];
  }

  return (state.koordinatChecklog?.data || []).filter(
    item => !item.cabang_id || item.cabang_id === userCabangId || item.cabang_id === ''
  );
};

/**
 * Selector: Get nearest checklog location
 */
export const selectNearestChecklogLocation = (state, userLocation) => {
  const locations = state.koordinatChecklog?.data || [];

  if (!userLocation || !locations.length) {
    return null;
  }

  const { latitude: userLat, longitude: userLng } = userLocation;

  // Calculate distances
  const withDistance = locations.map(loc => {
    if (!loc.latitude || !loc.longitude) return null;

    const lat = parseFloat(loc.latitude);
    const lng = parseFloat(loc.longitude);

    if (isNaN(lat) || isNaN(lng)) return null;

    // Haversine formula for distance calculation
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (userLat * Math.PI) / 180;
    const φ2 = (lat * Math.PI) / 180;
    const Δφ = ((lat - userLat) * Math.PI) / 180;
    const Δλ = ((lng - userLng) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters

    return {
      ...loc,
      distance
    };
  }).filter(Boolean);

  // Sort by distance and return nearest
  withDistance.sort((a, b) => a.distance - b.distance);
  return withDistance[0] || null;
};

const initialState = {
  data: [],
  loading: false,
  error: null,
  lastSync: null,
  offlineMode: false
};

const koordinatChecklogSlice = createSlice({
  name: 'koordinatChecklog',
  initialState,
  reducers: {
    clearKoordinatChecklog: state => {
      state.data = [];
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
    setOfflineMode: (state, action) => {
      state.offlineMode = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      // getKoordinatChecklog
      .addCase(getKoordinatChecklog.pending, state => {
        state.loading = true;
        state.error = null;
        state.offlineMode = false;
      })
      .addCase(getKoordinatChecklog.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastSync = Date.now();
        state.error = null;
      })
      .addCase(getKoordinatChecklog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.offlineMode = true;
      })
      // getKoordinatChecklogOffline
      .addCase(getKoordinatChecklogOffline.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKoordinatChecklogOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.offlineMode = true;
        state.error = null;
      })
      .addCase(getKoordinatChecklogOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.offlineMode = true;
      });
  }
});

export const { clearKoordinatChecklog, clearError, setOfflineMode } = koordinatChecklogSlice.actions;
export default koordinatChecklogSlice.reducer;
