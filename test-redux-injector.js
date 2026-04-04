/**
 * Test Redux State Injector
 * This script tests if the Redux state injector is working correctly
 */

import store from './src/store';
import { injectDataToRedux } from './src/store/reduxInjector';

// Test data
const testData = {
  karyawan: [
    { id: 1, nama: 'Test Karyawan 1', cabang: { area: 'Test Area 1' } },
    { id: 2, nama: 'Test Karyawan 2', cabang: { area: 'Test Area 2' } }
  ],
  gudang: [
    { id: 1, nama: 'Test Gudang 1' },
    { id: 2, nama: 'Test Gudang 2' }
  ],
  barang: [
    { id: 1, nama: 'Test Barang 1' },
    { id: 2, nama: 'Test Barang 2' }
  ]
};

console.log('🧪 Starting Redux State Injector Test...');

// Test each data type
Object.entries(testData).forEach(([dataType, data]) => {
  console.log(`\n📊 Testing ${dataType} injection...`);
  
  // Check initial state
  const initialState = store.getState()[dataType];
  console.log(`Initial ${dataType} state:`, {
    hasData: !!(initialState && initialState.data),
    dataLength: initialState?.data?.length || 0,
    loading: initialState?.loading,
    error: initialState?.error
  });
  
  // Inject data
  const result = injectDataToRedux(dataType, data);
  console.log(`Injection result for ${dataType}:`, result ? 'SUCCESS' : 'FAILED');
  
  // Check final state
  setTimeout(() => {
    const finalState = store.getState()[dataType];
    console.log(`Final ${dataType} state:`, {
      hasData: !!(finalState && finalState.data),
      dataLength: finalState?.data?.length || 0,
      loading: finalState?.loading,
      error: finalState?.error,
      firstItem: finalState?.data?.[0]?.nama || finalState?.data?.[0]?.id
    });
  }, 200);
});

console.log('\n✅ Test completed. Check console for results.');