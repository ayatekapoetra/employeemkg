import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import database from '../../database/SQLiteService';

// Canonical key used by download/preload/settings. Legacy key kept for migration.
export const CACHE_KEY = '@lokasipit';
const LEGACY_CACHE_KEY = '@lokasi-pit';
const CACHE_META_KEY = '@lokasipit_meta';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const parseCache = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

const readCachedLokasiPit = async () => {
  const [canonical, legacy] = await Promise.all([
    AsyncStorage.getItem(CACHE_KEY),
    AsyncStorage.getItem(LEGACY_CACHE_KEY),
  ]);

  const canonicalData = parseCache(canonical);
  if (canonicalData) {
    if (legacy) {
      AsyncStorage.removeItem(LEGACY_CACHE_KEY).catch(() => {});
    }
    return canonicalData;
  }

  const legacyData = parseCache(legacy);
  if (legacyData) {
    // Migrate legacy cache so download + form share the same key going forward
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(legacyData));
    AsyncStorage.removeItem(LEGACY_CACHE_KEY).catch(() => {});
    return legacyData;
  }

  return null;
};

const writeCachedLokasiPit = async (data) => {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify({ updatedAt: Date.now() }));
  AsyncStorage.removeItem(LEGACY_CACHE_KEY).catch(() => {});
};

const isCacheFresh = async () => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_META_KEY);
    if (!raw) return false;
    const meta = JSON.parse(raw);
    if (!meta?.updatedAt) return false;
    return Date.now() - Number(meta.updatedAt) < CACHE_TTL_MS;
  } catch {
    return false;
  }
};

export const getLokasiPit = createAsyncThunk(
  'lokasiPit/getList',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      if (!forceRefresh) {
        const cached = await readCachedLokasiPit();
        const fresh = await isCacheFresh();
        if (cached && fresh) {
          console.log('Using cached lokasi pit data');
          return { data: cached };
        }
        // Stale/missing meta: still show cache immediately via return only when fresh.
        // If stale, fall through to API; if API fails, cached is used below.
        if (cached && !fresh) {
          console.log('[LokasiPit] Cache stale, refreshing from API...');
        }
      }

      console.log('Fetching lokasi pit from API...');
      const resp = await apiClient.get(API_ENDPOINTS.LOKASI_PIT.LIST);
      const data = resp.data?.rows || resp.data?.data || resp.data || [];

      console.log('[LokasiPit] API response:', data.length, 'items');

      if (data && Array.isArray(data) && data.length > 0) {
        await writeCachedLokasiPit(data);
        try {
          await database.syncLokasiPit(data);
        } catch (syncErr) {
          console.warn('[LokasiPit] Failed to sync SQLite:', syncErr?.message || syncErr);
        }
      }

      return { data };
    } catch (error) {
      console.error('Error fetching lokasi pit:', error);
      const cached = await readCachedLokasiPit();
      if (cached) {
        return { data: cached };
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getLokasiPitOffline = createAsyncThunk(
  'lokasiPit/getOffline',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[LokasiPit] Loading offline data...');

      // 1. TRY SQLITE FIRST
      const dbData = await database.getLokasiPit();
      if (dbData && dbData.length > 0) {
        console.log('[LokasiPit] Loaded from SQLite:', dbData.length, 'items');
        return { data: dbData, source: 'sqlite' };
      }

      // 2. FALLBACK TO ASYNCSTORAGE (canonical + legacy)
      const cached = await readCachedLokasiPit();
      if (cached) {
        console.log('[LokasiPit] Loaded from AsyncStorage:', cached.length, 'items');
        return { data: cached, source: 'asyncstorage' };
      }

      console.warn('[LokasiPit] No offline data found');
      return { data: [], source: 'none' };
    } catch (error) {
      console.error('[LokasiPit] Error loading offline:', error);
      return rejectWithValue(error.message || 'Failed to load offline data');
    }
  }
);

export const clearLokasiPitCache = createAsyncThunk(
  'lokasiPit/clearCache',
  async () => {
    try {
      await AsyncStorage.multiRemove([CACHE_KEY, LEGACY_CACHE_KEY, CACHE_META_KEY]);
      await database.clear('master_lokasipit');
      console.log('[LokasiPit] Cache cleared');
    } catch (error) {
      console.error('[LokasiPit] Error clearing cache:', error);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const lokasiPitSlice = createSlice({
  name: 'lokasiPit',
  initialState,
  reducers: {
    clearLokasiPitData: state => {
      state.data = [];
      state.error = null;
      state.dataSource = 'none';
    },
    // Add a direct data setter for Redux injector
    setLokasiPitData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload || [];
      state.dataSource = 'redux-injector';
      state.lastSync = Date.now();
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getLokasiPit.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLokasiPit.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(getLokasiPit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(getLokasiPitOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.dataSource = action.payload.source || 'none';
        state.error = null;
      })
      .addCase(getLokasiPitOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearLokasiPitCache.fulfilled, state => {
        state.data = [];
        state.lastSync = null;
        state.dataSource = 'none';
      });
  },
});

export const { clearLokasiPitData, setLokasiPitData } = lokasiPitSlice.actions;
export default lokasiPitSlice.reducer;
