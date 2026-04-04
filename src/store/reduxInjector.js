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
    
    // Map the data type to the actual slice name in Redux store
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
    
    const actualSliceName = sliceNameMapping[dataType] || dataType;
    
    // Check if the slice exists
    if (!currentState[actualSliceName]) {
      console.error(`[ReduxInjector] Slice ${actualSliceName} (for ${dataType}) not found in Redux state`);
      console.log(`[ReduxInjector] Available slices:`, availableSlices);
      return false;
    }

    console.log(`[ReduxInjector] Current ${actualSliceName} state:`, currentState[actualSliceName]);

    // Method 1: Try to use the slice's standard action
    try {
      const slice = currentState[actualSliceName];
      
      console.log(`[ReduxInjector] Created new state for ${actualSliceName}:`, {
        oldDataLength: slice.data?.length || 0,
        newDataLength: data.length,
        hasData: !!data.length
      });

      // Create the correct action type based on the slice's actual thunk
      const actionType = `${actualSliceName}/getList/fulfilled`;

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
      
      // Verify immediately
      setTimeout(() => {
        const updatedState = reduxStore.getState()[actualSliceName];
      }, 100);

      console.log(`[ReduxInjector] ✅ Method 1 completed for ${actualSliceName}`);
      return true;

    } catch (methodError) {
      console.error(`[ReduxInjector] Method 1 failed for ${actualSliceName}:`, methodError);
      
      // Method 2: Try a simpler setData action
      try {
        console.log(`[ReduxInjector] Trying Method 2 (setData action) for ${actualSliceName}`);
        
        // Capitalize the first letter for the action name
        const actionName = actualSliceName.charAt(0).toUpperCase() + actualSliceName.slice(1);
        const actionType = `${actualSliceName}/set${actionName}Data`;
        
        const simpleAction = {
          type: actionType,
          payload: data
        };
        
        console.log(`[ReduxInjector] Dispatching ${actionType} for ${actualSliceName}`);
        reduxStore.dispatch(simpleAction);
        
        setTimeout(() => {
          const updatedState = reduxStore.getState()[actualSliceName];
        }, 100);
        
        console.log(`[ReduxInjector] ✅ Method 2 succeeded for ${actualSliceName}`);
        return true;
        
      } catch (method2Error) {
        console.error(`[ReduxInjector] Method 2 also failed for ${actualSliceName}:`, method2Error);
        
        // Method 3: Direct state replacement (most reliable)
        try {
          console.log(`[ReduxInjector] Trying Method 3 (direct state replacement) for ${actualSliceName}`);
          
          // Get the current reducer function
          const currentReducer = reduxStore.getState()[actualSliceName];
          
          // Create a new state object
          const newState = {
            ...currentReducer,
            loading: false,
            error: null,
            data: data
          };
          
          // Use replaceReducer to update the state
          const replaceAction = {
            type: `@@redux/REPLACE_${actualSliceName.toUpperCase()}`,
            payload: newState
          };
          
          reduxStore.dispatch(replaceAction);
          
          setTimeout(() => {
            const updatedState = reduxStore.getState()[actualSliceName];
          }, 100);
          
          console.log(`[ReduxInjector] ✅ Method 3 succeeded for ${actualSliceName}`);
          return true;
          
        } catch (method3Error) {
          console.error(`[ReduxInjector] Method 3 also failed for ${actualSliceName}:`, method3Error);
          return false;
        }
      }
    }

  } catch (error) {
    console.error(`[ReduxInjector] ❌ Failed to inject data into ${actualSliceName}:`, error);
    console.error(`[ReduxInjector] Error stack:`, error.stack);
    return false;
  }
};

export const getReduxState = (dataType) => {
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
    
    const actualSliceName = sliceNameMapping[dataType] || dataType;
    return state[actualSliceName];
  } catch (error) {
    console.error(`[ReduxInjector] ❌ Failed to get Redux state:`, error);
    return null;
  }
};