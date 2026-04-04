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
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem('@koordinatChecklog');
        if (cached) {
          console.log('Using cached koordinat checklog data');
          return { data: JSON.parse(cached) };
        }
      }

      console.log('Fetching koordinat checklog from API...');
      const response = await apiClient.get(API_ENDPOINTS.CHECKLOG.LOCATIONS);
      const data = response.data?.rows || response.data?.data || response.data || [];
      
      console.log('[KoordinatChecklog] API response:', data.length, 'items');

      if (data && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem('@koordinatChecklog', JSON.stringify(data));
      }
      
      return { data };
    } catch (error) {
      console.error('Error fetching koordinat checklog:', error);
      const cached = await AsyncStorage.getItem('@koordinatChecklog');
      if (cached) {
        return { data: JSON.parse(cached) };
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
  loading: false,
  error: null,
  data: null,
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
        state.data = action.payload.data;
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
