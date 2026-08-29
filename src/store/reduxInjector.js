/**
 * Simple Redux State Injector
 * This directly injects data into Redux state without going through actions
 * This is a fallback when normal Redux updates don't work
 */

// Store reference to the Redux store
let reduxStore = null;

export const setReduxStore = (store) => {
  reduxStore = store;
};

export const injectDataToRedux = (dataType, data) => {
  let actualSliceName = dataType;

  if (!reduxStore) {
    console.error('[ReduxInjector] Redux store not initialized');
    return false;
  }

  try {
    console.log(`[ReduxInjector] Starting injection for ${dataType} with ${data.length} items`);

    // Get current state and available slices
    const currentState = reduxStore.getState();
    const availableSlices = Object.keys(currentState);
    
    console.log(`[ReduxInjector] Available Redux slices:`, availableSlices);
    
    // Store key in combineReducers (may differ from slice.name)
    const sliceNameMapping = {
      'karyawan': 'karyawan',
      'gudang': 'gudang',
      'barang': 'barang',
      'penyewa': 'penyewa',
      'shift': 'shift',
      'kegiatanpit': 'kegiatankerja',
      'lokasipit': 'lokasikerja',
      'oprdrv': 'oprdrv',
      'equipment': 'equipment',
      'pemasok': 'pemasok',
      'cabang': 'cabang',
      'koordinatChecklog': 'koordinatChecklog'
    };

    // RTK slice.name used in action types (must match createSlice name)
    const fulfilledActionMapping = {
      'karyawan': 'karyawan/getList/fulfilled',
      'pengawas': 'pengawas/getList/fulfilled',
      'gudang': 'gudang/getList/fulfilled',
      'barang': 'barang/getList/fulfilled',
      'penyewa': 'penyewa/getList/fulfilled',
      'shift': 'shift/getList/fulfilled',
      'kegiatanpit': 'kegiatanPit/getList/fulfilled',
      'lokasipit': 'lokasiPit/getList/fulfilled',
      'oprdrv': 'oprdrv/getList/fulfilled',
      'equipment': 'equipment/getList/fulfilled',
      'pemasok': 'pemasok/getList/fulfilled',
      'cabang': 'cabang/getList/fulfilled',
      'koordinatChecklog': 'koordinatChecklog/getList/fulfilled',
    };

    const setDataActionMapping = {
      'lokasipit': 'lokasiPit/setLokasiPitData',
    };
    
    actualSliceName = sliceNameMapping[dataType] || dataType;
    
    // Check if the slice exists
    if (!currentState[actualSliceName]) {
      console.error(`[ReduxInjector] Slice ${actualSliceName} (for ${dataType}) not found in Redux state`);
      console.log(`[ReduxInjector] Available slices:`, availableSlices);
      return false;
    }

    console.log(`[ReduxInjector] Current ${actualSliceName} state:`, currentState[actualSliceName]);

    // Prefer dedicated setter when available (reliable, no meta payload shape issues)
    const setDataType = setDataActionMapping[dataType];
    if (setDataType) {
      reduxStore.dispatch({ type: setDataType, payload: data });
      console.log(`[ReduxInjector] ✅ setData action completed for ${actualSliceName}`);
      return true;
    }

    // Method 1: Try to use the slice's standard fulfilled action
    try {
      const slice = currentState[actualSliceName];
      
      console.log(`[ReduxInjector] Created new state for ${actualSliceName}:`, {
        oldDataLength: slice.data?.length || 0,
        newDataLength: data.length,
        hasData: !!data.length
      });

      const actionType = fulfilledActionMapping[dataType] || `${actualSliceName}/getList/fulfilled`;

      const action = {
        type: actionType,
        payload: { data: data },
        meta: {
          arg: undefined,
          requestId: `manual-${Date.now()}`,
          requestStatus: 'fulfilled'
        }
      };

      console.log(`[ReduxInjector] Dispatching ${actionType} for ${dataType}`);
      reduxStore.dispatch(action);

      console.log(`[ReduxInjector] ✅ Method 1 completed for ${actualSliceName}`);
      return true;

    } catch (methodError) {
      console.error(`[ReduxInjector] Method 1 failed for ${actualSliceName}:`, methodError);
      return false;
    }

  } catch (error) {
    console.error(`[ReduxInjector] ❌ Failed to inject data into ${actualSliceName}:`, error);
    console.error(`[ReduxInjector] Error stack:`, error.stack);
    return false;
  }
};

export const getReduxState = (dataType) => {
  let actualSliceName = dataType;

  if (!reduxStore) {
    console.error('[ReduxInjector] Redux store not initialized');
    return null;
  }

  try {
    const state = reduxStore.getState();
    const sliceNameMapping = {
      'karyawan': 'karyawan',
      'gudang': 'gudang',
      'barang': 'barang',
      'penyewa': 'penyewa',
      'shift': 'shift',
      'kegiatanpit': 'kegiatankerja',
      'lokasipit': 'lokasikerja',
      'oprdrv': 'oprdrv',
      'equipment': 'equipment',
      'pemasok': 'pemasok',
      'cabang': 'cabang',
      'koordinatChecklog': 'koordinatChecklog'
    };
    
    actualSliceName = sliceNameMapping[dataType] || dataType;
    return state[actualSliceName];
  } catch (error) {
    console.error(`[ReduxInjector] ❌ Failed to get Redux state:`, error);
    return null;
  }
};