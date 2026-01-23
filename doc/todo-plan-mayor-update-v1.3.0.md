# TODO List - APP-EMPLOYEE Major Update v1.3.0

---

## Document Information

| Field | Value |
|-------|-------|
| **Related PRD** | prd-plan-mayor-update-v1.3.0.md |
| **Target Version** | 1.3.0 |
| **Total Tasks** | 127 tasks |
| **Estimated Duration** | 10 weeks |
| **Created Date** | January 22, 2026 |

---

## Progress Overview

| Phase | Tasks | Completed | Progress |
|-------|-------|-----------|----------|
| Phase 1: Foundation | 28 | 0 | 0% |
| Phase 2: Core Optimization | 42 | 0 | 0% |
| Phase 3: Feature Enhancement | 25 | 0 | 0% |
| Phase 4: Testing & QA | 22 | 0 | 0% |
| Phase 5: Release | 10 | 0 | 0% |
| **TOTAL** | **127** | **0** | **0%** |

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Project Setup

- [ ] **P1-001** Create feature branch `feature/v1.3.0-optimization`
- [ ] **P1-002** Update package.json version to 1.3.0-alpha.1
- [ ] **P1-003** Setup TypeScript configuration (tsconfig.json)
- [ ] **P1-004** Install required new dependencies
  - [ ] `@tanstack/react-query`
  - [ ] `@tanstack/react-query-devtools` (dev only)
- [ ] **P1-005** Create folder structure for new architecture
  - [ ] `src/types/`
  - [ ] `src/hooks/`
  - [ ] `src/components/bottomsheets/`
  - [ ] `src/components/forms/`
  - [ ] `src/services/logger/`
  - [ ] `src/services/storage/`
  - [ ] `__tests__/`
- [ ] **P1-006** Create feature flags configuration file
  - File: `src/config/featureFlags.ts`

### 1.2 Logger Utility Implementation

- [ ] **P1-007** Create logger utility
  - File: `src/utils/logger.ts`
  - [ ] Implement log levels (debug, info, warn, error)
  - [ ] Add timestamp support
  - [ ] Add context/tag support
  - [ ] Auto-disable in production (except errors)

- [ ] **P1-008** Replace console.log in `src/services/api/client.js`
  - Current: 13 console statements
  - [ ] Replace all with logger
  - [ ] Add proper context tags

- [ ] **P1-009** Replace console.log in `src/store/slices/downloadSlice.js`
  - Current: 20 console statements
  - [ ] Replace all with logger
  - [ ] Add [Download] context tag

- [ ] **P1-010** Replace console.log in `src/database/SQLiteService.js`
  - Current: 50+ console statements
  - [ ] Replace all with logger
  - [ ] Add [SQLite] context tag

- [ ] **P1-011** Replace console.log in `src/store/slices/authSlice.js`
  - Current: 15 console statements
  - [ ] Replace all with logger
  - [ ] Add [Auth] context tag

- [ ] **P1-012** Replace console.log in `src/components/common/MasterDataProgress.js`
  - Current: 4 console statements
  - [ ] Replace all with logger

- [ ] **P1-013** Replace console.log in `app/_layout.js`
  - Current: 10+ console statements
  - [ ] Replace all with logger

- [ ] **P1-014** Replace console.log in remaining `src/` files
  - [ ] Scan all files with grep
  - [ ] Replace systematically
  - [ ] Verify no raw console.log remains

- [ ] **P1-015** Replace console.log in `app/` folder
  - [ ] `app/(tabs)/home.js`
  - [ ] `app/(tabs)/kehadiran.js`
  - [ ] `app/penugasan/*.js`
  - [ ] `app/approval/*.js`
  - [ ] `app/setting/*.js`
  - [ ] Other app files

### 1.3 Secure Token Storage

- [ ] **P1-016** Create SecureStorage service
  - File: `src/services/storage/secureStorage.ts`
  - [ ] Implement getToken()
  - [ ] Implement setToken()
  - [ ] Implement removeToken()
  - [ ] Implement isAvailable()

- [ ] **P1-017** Create AsyncStorage wrapper
  - File: `src/services/storage/asyncStorage.ts`
  - [ ] Standardize key naming
  - [ ] Add type safety

- [ ] **P1-018** Create storage migration utility
  - File: `src/services/storage/migration.ts`
  - [ ] Detect legacy token in AsyncStorage
  - [ ] Migrate to SecureStore
  - [ ] Clean up AsyncStorage
  - [ ] Log migration status

- [ ] **P1-019** Update authSlice to use SecureStorage
  - [ ] Update login action
  - [ ] Update restoreSession action
  - [ ] Update logout action
  - [ ] Maintain backward compatibility

- [ ] **P1-020** Update API client interceptor
  - [ ] Use SecureStorage for token retrieval
  - [ ] Handle migration during request

- [ ] **P1-021** Add migration call in app startup
  - File: `app/_layout.js`
  - [ ] Call migration on app init
  - [ ] Handle migration errors gracefully

### 1.4 Remove Hardcoded Credentials

- [ ] **P1-022** Create environment configuration
  - File: `src/config/env.ts`
  - [ ] Define DEMO_MODE flag
  - [ ] Define DEMO_CREDENTIALS (from env)

- [ ] **P1-023** Update .env.example
  - [ ] Add EXPO_PUBLIC_DEMO_MODE
  - [ ] Add EXPO_PUBLIC_DEMO_USERNAME
  - [ ] Add EXPO_PUBLIC_DEMO_PASSWORD

- [ ] **P1-024** Update authSlice.js
  - [ ] Remove hardcoded demo/demo123
  - [ ] Use environment variables
  - [ ] Add proper validation

- [ ] **P1-025** Audit all files for hardcoded secrets
  - [ ] Search for password patterns
  - [ ] Search for API keys
  - [ ] Search for tokens
  - [ ] Document findings

### 1.5 TypeScript Foundation

- [ ] **P1-026** Create base type definitions
  - File: `src/types/index.ts`
  - [ ] API response types
  - [ ] Model types (User, Karyawan, Equipment, etc.)
  - [ ] Redux state types

- [ ] **P1-027** Convert first utility file to TypeScript
  - Convert: `src/utils/logger.ts` (already .ts)
  - [ ] Add proper types
  - [ ] Export types

- [ ] **P1-028** Setup TypeScript path aliases
  - [ ] Update tsconfig.json
  - [ ] Update metro.config.js if needed
  - [ ] Test imports

---

## Phase 2: Core Optimization (Week 3-5)

### 2.1 SQLite Batch Operations

- [ ] **P2-001** Create BaseRepository class
  - File: `src/services/database/BaseRepository.ts`
  - [ ] Generic batch insert method
  - [ ] Generic batch upsert method
  - [ ] Transaction support
  - [ ] Progress callback support

- [ ] **P2-002** Create BarangRepository
  - File: `src/services/database/BarangRepository.ts`
  - [ ] Extend BaseRepository
  - [ ] Implement column mappings
  - [ ] Add barang-specific methods

- [ ] **P2-003** Create KaryawanRepository
  - File: `src/services/database/KaryawanRepository.ts`
  - [ ] Extend BaseRepository
  - [ ] Implement column mappings
  - [ ] Add karyawan-specific methods

- [ ] **P2-004** Create EquipmentRepository
  - File: `src/services/database/EquipmentRepository.ts`
  - [ ] Extend BaseRepository
  - [ ] Implement column mappings
  - [ ] Add equipment-specific methods

- [ ] **P2-005** Create remaining repositories
  - [ ] `GudangRepository.ts`
  - [ ] `OprDrvRepository.ts`
  - [ ] `PemasokRepository.ts`
  - [ ] `PenyewaRepository.ts`
  - [ ] `LokasiPitRepository.ts`
  - [ ] `KegiatanPitRepository.ts`
  - [ ] `ShiftRepository.ts`
  - [ ] `BarangRackRepository.ts`

- [ ] **P2-006** Create SyncService
  - File: `src/services/database/SyncService.ts`
  - [ ] Coordinate batch syncs
  - [ ] Track sync progress
  - [ ] Handle errors gracefully

- [ ] **P2-007** Add SQLite indexes
  - [ ] `idx_karyawan_nama` on master_karyawan(nama)
  - [ ] `idx_equipment_kode` on master_equipment(kode)
  - [ ] `idx_barang_kategori` on master_barang(kategori)
  - [ ] `idx_oprdrv_nama` on master_oprdrv(nama)
  - [ ] `idx_lokasipit_nama` on master_lokasipit(nama)

- [ ] **P2-008** Create sync_metadata table
  - [ ] Add table creation in SQLiteService
  - [ ] Track last_sync per table
  - [ ] Track row_count per table

- [ ] **P2-009** Update downloadSlice to use new repositories
  - [ ] Replace direct SQLiteService calls
  - [ ] Use batch operations
  - [ ] Verify performance improvement

- [ ] **P2-010** Performance testing for SQLite
  - [ ] Benchmark 100 items sync
  - [ ] Benchmark 500 items sync
  - [ ] Benchmark 1000 items sync
  - [ ] Document results

### 2.2 React Query Setup

- [ ] **P2-011** Create QueryClient configuration
  - File: `src/services/api/queryClient.ts`
  - [ ] Default stale time (5 min)
  - [ ] Default cache time (30 min)
  - [ ] Retry configuration
  - [ ] Error handling

- [ ] **P2-012** Create QueryClientProvider wrapper
  - File: `src/providers/QueryProvider.tsx`
  - [ ] Wrap app with provider
  - [ ] Add devtools in development

- [ ] **P2-013** Update app/_layout.js
  - [ ] Add QueryProvider
  - [ ] Ensure proper provider order

- [ ] **P2-014** Create query keys constant
  - File: `src/services/api/queryKeys.ts`
  - [ ] Define all query keys
  - [ ] Type the keys properly

- [ ] **P2-015** Create useKaryawan hook
  - File: `src/services/api/hooks/useKaryawan.ts`
  - [ ] Implement query hook
  - [ ] Add select transformer
  - [ ] Export types

- [ ] **P2-016** Create useEquipment hook
  - File: `src/services/api/hooks/useEquipment.ts`
  - [ ] Implement query hook
  - [ ] Add select transformer

- [ ] **P2-017** Create useOprDrv hook
  - File: `src/services/api/hooks/useOprDrv.ts`
  - [ ] Implement query hook
  - [ ] Add select transformer

- [ ] **P2-018** Create remaining data hooks
  - [ ] `useGudang.ts`
  - [ ] `useBarang.ts`
  - [ ] `useLokasiPit.ts`
  - [ ] `useKegiatanPit.ts`
  - [ ] `useShift.ts`
  - [ ] `usePenyewa.ts`
  - [ ] `usePemasok.ts`

- [ ] **P2-019** Create usePrefetchMasterData hook
  - File: `src/services/api/hooks/usePrefetchMasterData.ts`
  - [ ] Prefetch all master data
  - [ ] Use on app startup

- [ ] **P2-020** Update home.js to use React Query
  - [ ] Replace Redux dispatches with query hooks
  - [ ] Remove manual refresh logic
  - [ ] Test data loading

### 2.3 Reusable Bottom Sheet Component

- [ ] **P2-021** Create base SearchableBottomSheet
  - File: `src/components/bottomsheets/SearchableBottomSheet.tsx`
  - [ ] Props interface definition
  - [ ] Modal with slide animation
  - [ ] Search input that maintains focus
  - [ ] FlatList for items
  - [ ] Selection handling

- [ ] **P2-022** Create ListItem components
  - File: `src/components/bottomsheets/ListItems.tsx`
  - [ ] KaryawanListItem
  - [ ] EquipmentListItem
  - [ ] OprDrvListItem
  - [ ] LokasiListItem
  - [ ] GenericListItem

- [ ] **P2-023** Create specific picker wrappers
  - [ ] `KaryawanPicker.tsx`
  - [ ] `EquipmentPicker.tsx`
  - [ ] `OprDrvPicker.tsx`
  - [ ] `LokasiPicker.tsx`
  - [ ] `KegiatanPicker.tsx`

- [ ] **P2-024** Update FilterAbsensi.js to use new component
  - [ ] Replace KaryawanBottomSheet
  - [ ] Test search focus issue is resolved
  - [ ] Verify functionality

- [ ] **P2-025** Create index.ts for bottomsheets
  - File: `src/components/bottomsheets/index.ts`
  - [ ] Export all components

### 2.4 Component Refactoring - FilterPenugasanModal

- [ ] **P2-026** Analyze FilterPenugasanModal.js structure
  - [ ] Document all sub-components
  - [ ] Identify shared logic
  - [ ] Plan split strategy

- [ ] **P2-027** Extract CustomSelect component
  - File: `src/features/approval/components/CustomSelect.tsx`
  - [ ] Move CustomSelect code
  - [ ] Add TypeScript types
  - [ ] Export component

- [ ] **P2-028** Extract EquipmentBottomSheet
  - File: `src/features/approval/components/EquipmentBottomSheet.tsx`
  - [ ] Move component code
  - [ ] Use SearchableBottomSheet base
  - [ ] Add types

- [ ] **P2-029** Extract OprDrvBottomSheet
  - File: `src/features/approval/components/OprDrvBottomSheet.tsx`
  - [ ] Move component code
  - [ ] Use SearchableBottomSheet base
  - [ ] Add types

- [ ] **P2-030** Extract KegiatanBottomSheet
  - File: `src/features/approval/components/KegiatanBottomSheet.tsx`
  - [ ] Move component code
  - [ ] Use SearchableBottomSheet base

- [ ] **P2-031** Extract LokasiBottomSheet
  - File: `src/features/approval/components/LokasiBottomSheet.tsx`
  - [ ] Move component code
  - [ ] Use SearchableBottomSheet base

- [ ] **P2-032** Extract EquipmentItem component
  - File: `src/features/approval/components/EquipmentItem.tsx`
  - [ ] Move component code
  - [ ] Add React.memo

- [ ] **P2-033** Extract OprDrvItem component
  - File: `src/features/approval/components/OprDrvItem.tsx`
  - [ ] Move component code
  - [ ] Add React.memo

- [ ] **P2-034** Create useFilterPenugasan hook
  - File: `src/features/approval/hooks/useFilterPenugasan.ts`
  - [ ] Extract filter logic
  - [ ] State management
  - [ ] Handlers

- [ ] **P2-035** Refactor FilterPenugasanModal.js
  - [ ] Import extracted components
  - [ ] Use custom hook
  - [ ] Verify all functionality works
  - [ ] Target: <400 lines

- [ ] **P2-036** Update imports in consuming files
  - [ ] `app/penugasan/index.js`
  - [ ] Any other files using FilterPenugasanModal

### 2.5 Component Refactoring - SQLiteService

- [ ] **P2-037** Refactor SQLiteService.js
  - [ ] Keep only core database methods
  - [ ] Import repository methods
  - [ ] Target: <300 lines

- [ ] **P2-038** Create database index.ts
  - File: `src/services/database/index.ts`
  - [ ] Export SQLiteService
  - [ ] Export all repositories
  - [ ] Export SyncService

- [ ] **P2-039** Update all imports
  - [ ] downloadSlice.js
  - [ ] Any direct SQLiteService users

### 2.6 Additional Optimizations

- [ ] **P2-040** Optimize FlatList usage
  - [ ] Audit all list components
  - [ ] Replace ScrollView+map with FlatList
  - [ ] Add getItemLayout where applicable
  - [ ] Add removeClippedSubviews

- [ ] **P2-041** Implement image caching
  - [ ] Use expo-image for remote images
  - [ ] Configure cache policy
  - [ ] Add placeholder images

- [ ] **P2-042** Add memoization where needed
  - [ ] Audit expensive computations
  - [ ] Add useMemo for computed values
  - [ ] Add useCallback for handlers
  - [ ] Add React.memo for list items

---

## Phase 3: Feature Enhancement (Week 6-7)

### 3.1 Redux Consolidation

- [ ] **P3-001** Create new masterDataSlice
  - File: `src/store/slices/masterDataSlice.ts`
  - [ ] Combined state structure
  - [ ] Actions for each data type
  - [ ] Selectors

- [ ] **P3-002** Create new uiSlice
  - File: `src/store/slices/uiSlice.ts`
  - [ ] Merge theme + alert states
  - [ ] Actions and reducers

- [ ] **P3-003** Create new operationalSlice
  - File: `src/store/slices/operationalSlice.ts`
  - [ ] Merge penugasan + checklog + tugas
  - [ ] Actions and reducers

- [ ] **P3-004** Create new approvalSlice
  - File: `src/store/slices/approvalSlice.ts`
  - [ ] Pengajuan state
  - [ ] Actions and reducers

- [ ] **P3-005** Create new offlineSlice
  - File: `src/store/slices/offlineSlice.ts`
  - [ ] Pending operations queue
  - [ ] Offline status tracking

- [ ] **P3-006** Update authSlice to TypeScript
  - [ ] Add types
  - [ ] Keep existing functionality

- [ ] **P3-007** Update downloadSlice to TypeScript
  - [ ] Add types
  - [ ] Keep existing functionality

- [ ] **P3-008** Create new store/index.ts
  - [ ] Configure with 7 slices
  - [ ] Add middleware
  - [ ] Export types

- [ ] **P3-009** Create migration helper
  - [ ] Map old selectors to new structure
  - [ ] Provide compatibility layer

- [ ] **P3-010** Update all components using Redux
  - [ ] Update selectors
  - [ ] Update dispatches
  - [ ] Test thoroughly

### 3.2 Custom Hooks

- [ ] **P3-011** Create useAuth hook
  - File: `src/hooks/useAuth.ts`
  - [ ] Login/logout functions
  - [ ] User state
  - [ ] Permission checks

- [ ] **P3-012** Create useMasterData hook
  - File: `src/hooks/useMasterData.ts`
  - [ ] Combine React Query hooks
  - [ ] Provide loading states
  - [ ] Error handling

- [ ] **P3-013** Create useOffline hook
  - File: `src/hooks/useOffline.ts`
  - [ ] Network status
  - [ ] Pending operations count
  - [ ] Sync trigger

- [ ] **P3-014** Create useTheme hook
  - File: `src/hooks/useTheme.ts`
  - [ ] Theme state
  - [ ] Toggle function
  - [ ] Color utilities

- [ ] **P3-015** Create hooks index
  - File: `src/hooks/index.ts`
  - [ ] Export all hooks

### 3.3 Error Handling Enhancement

- [ ] **P3-016** Create ErrorBoundary component
  - File: `src/components/common/ErrorBoundary.tsx`
  - [ ] Catch render errors
  - [ ] Fallback UI
  - [ ] Error reporting

- [ ] **P3-017** Add ErrorBoundary to app
  - [ ] Wrap main content
  - [ ] Add recovery options

- [ ] **P3-018** Create error utility
  - File: `src/utils/errorHandler.ts`
  - [ ] Standardize error format
  - [ ] Mask sensitive data
  - [ ] Log appropriately

- [ ] **P3-019** Update API client error handling
  - [ ] Use error utility
  - [ ] Add user-friendly messages
  - [ ] Handle specific error codes

### 3.4 Input Validation

- [ ] **P3-020** Create validation utility
  - File: `src/utils/validation.ts`
  - [ ] Common validators (email, phone, etc.)
  - [ ] Form validation helpers
  - [ ] Error message formatting

- [ ] **P3-021** Add validation to login form
  - [ ] Username validation
  - [ ] Password validation
  - [ ] Display errors

- [ ] **P3-022** Add validation to penugasan forms
  - [ ] Required field validation
  - [ ] Date validation
  - [ ] Number validation

### 3.5 Performance Monitoring

- [ ] **P3-023** Create performance utility
  - File: `src/utils/performance.ts`
  - [ ] Measure function duration
  - [ ] Track render counts
  - [ ] Memory monitoring

- [ ] **P3-024** Add startup time measurement
  - [ ] Measure time to interactive
  - [ ] Log in development
  - [ ] Track improvements

- [ ] **P3-025** Add API call tracking
  - [ ] Request duration
  - [ ] Success/failure rates
  - [ ] Log slow requests

---

## Phase 4: Testing & QA (Week 8-9)

### 4.1 Unit Tests Setup

- [ ] **P4-001** Setup Jest configuration
  - [ ] jest.config.js
  - [ ] Setup files
  - [ ] Mock configurations

- [ ] **P4-002** Create test utilities
  - File: `__tests__/utils/testUtils.ts`
  - [ ] Render helpers
  - [ ] Mock data factories
  - [ ] Common assertions

### 4.2 Unit Tests - Utilities

- [ ] **P4-003** Test logger utility
  - [ ] Test all log levels
  - [ ] Test production disable
  - [ ] Test context formatting

- [ ] **P4-004** Test validation utility
  - [ ] Test all validators
  - [ ] Test edge cases
  - [ ] Test error messages

- [ ] **P4-005** Test errorHandler utility
  - [ ] Test error transformation
  - [ ] Test sensitive data masking
  - [ ] Test different error types

### 4.3 Unit Tests - Hooks

- [ ] **P4-006** Test useAuth hook
  - [ ] Test login flow
  - [ ] Test logout flow
  - [ ] Test session restore

- [ ] **P4-007** Test useMasterData hook
  - [ ] Test data fetching
  - [ ] Test loading states
  - [ ] Test error handling

- [ ] **P4-008** Test useTheme hook
  - [ ] Test theme toggle
  - [ ] Test persistence

### 4.4 Integration Tests

- [ ] **P4-009** Test API client
  - [ ] Test request interceptor
  - [ ] Test response handling
  - [ ] Test error handling
  - [ ] Test token injection

- [ ] **P4-010** Test SQLite operations
  - [ ] Test batch insert
  - [ ] Test upsert
  - [ ] Test queries
  - [ ] Test indexes

- [ ] **P4-011** Test Redux store
  - [ ] Test each slice
  - [ ] Test selectors
  - [ ] Test actions

### 4.5 E2E Testing (Manual)

- [ ] **P4-012** Test: Login flow
  - [ ] Valid credentials
  - [ ] Invalid credentials
  - [ ] Network error
  - [ ] Session restore

- [ ] **P4-013** Test: Checklog attendance
  - [ ] Successful checklog
  - [ ] Location verification
  - [ ] Photo capture
  - [ ] Offline mode

- [ ] **P4-014** Test: Create penugasan
  - [ ] Form validation
  - [ ] Equipment selection
  - [ ] Driver selection
  - [ ] Submit success/failure

- [ ] **P4-015** Test: Approval workflow
  - [ ] View pending approvals
  - [ ] Approve item
  - [ ] Reject item
  - [ ] Filter functionality

- [ ] **P4-016** Test: Master data sync
  - [ ] Full sync
  - [ ] Partial sync
  - [ ] Sync progress UI
  - [ ] Error handling

- [ ] **P4-017** Test: Offline mode
  - [ ] View cached data
  - [ ] Queue operations
  - [ ] Sync on reconnect

- [ ] **P4-018** Test: App update flow
  - [ ] Update detection
  - [ ] Update modal
  - [ ] Force update
  - [ ] Skip update

- [ ] **P4-019** Test: Error handling
  - [ ] API errors
  - [ ] Network errors
  - [ ] Validation errors
  - [ ] Recovery options

- [ ] **P4-020** Test: Session restore
  - [ ] App restart
  - [ ] Background/foreground
  - [ ] Token expiry

- [ ] **P4-021** Test: Logout flow
  - [ ] Clear session
  - [ ] Clear cache
  - [ ] Navigate to login

### 4.6 Performance Testing

- [ ] **P4-022** Measure and document
  - [ ] App startup time
  - [ ] Master data sync time
  - [ ] Memory usage
  - [ ] Scroll performance
  - [ ] Compare with baseline

---

## Phase 5: Release (Week 10)

### 5.1 Pre-Release

- [ ] **P5-001** Update version to 1.3.0
  - [ ] package.json
  - [ ] app.json
  - [ ] Any version constants

- [ ] **P5-002** Create CHANGELOG.md entry
  - [ ] List all changes
  - [ ] Breaking changes (if any)
  - [ ] Migration notes

- [ ] **P5-003** Update README.md
  - [ ] New architecture overview
  - [ ] Updated setup instructions
  - [ ] New dependencies

- [ ] **P5-004** Code review
  - [ ] Review all changes
  - [ ] Check for leftover TODOs
  - [ ] Check for console.log
  - [ ] Check for hardcoded values

- [ ] **P5-005** Final testing round
  - [ ] Regression testing
  - [ ] Device testing matrix
  - [ ] Performance verification

### 5.2 Release Build

- [ ] **P5-006** Create release candidate
  - [ ] Build Android APK/AAB
  - [ ] Build iOS IPA
  - [ ] Internal testing

- [ ] **P5-007** Fix critical issues
  - [ ] Address any blockers
  - [ ] Rebuild if needed

- [ ] **P5-008** Prepare release notes
  - [ ] User-facing changes
  - [ ] Known issues
  - [ ] Upgrade instructions

### 5.3 Deployment

- [ ] **P5-009** Submit to app stores
  - [ ] Google Play Store
  - [ ] Apple App Store / TestFlight
  - [ ] Set staged rollout

- [ ] **P5-010** Monitor release
  - [ ] Crash reports
  - [ ] User feedback
  - [ ] Performance metrics
  - [ ] Rollback if needed

---

## Quick Reference: File Changes Summary

### New Files to Create

```
src/
├── config/
│   ├── featureFlags.ts
│   └── env.ts
├── types/
│   ├── index.ts
│   ├── api.types.ts
│   └── models.types.ts
├── hooks/
│   ├── index.ts
│   ├── useAuth.ts
│   ├── useMasterData.ts
│   ├── useOffline.ts
│   └── useTheme.ts
├── components/
│   └── bottomsheets/
│       ├── index.ts
│       ├── SearchableBottomSheet.tsx
│       ├── ListItems.tsx
│       ├── KaryawanPicker.tsx
│       ├── EquipmentPicker.tsx
│       ├── OprDrvPicker.tsx
│       ├── LokasiPicker.tsx
│       └── KegiatanPicker.tsx
├── services/
│   ├── logger/
│   │   └── index.ts
│   ├── storage/
│   │   ├── secureStorage.ts
│   │   ├── asyncStorage.ts
│   │   └── migration.ts
│   ├── database/
│   │   ├── BaseRepository.ts
│   │   ├── BarangRepository.ts
│   │   ├── KaryawanRepository.ts
│   │   ├── EquipmentRepository.ts
│   │   ├── GudangRepository.ts
│   │   ├── OprDrvRepository.ts
│   │   ├── SyncService.ts
│   │   └── index.ts
│   └── api/
│       ├── queryClient.ts
│       ├── queryKeys.ts
│       └── hooks/
│           ├── useKaryawan.ts
│           ├── useEquipment.ts
│           ├── useOprDrv.ts
│           └── usePrefetchMasterData.ts
├── store/
│   └── slices/
│       ├── masterDataSlice.ts
│       ├── uiSlice.ts
│       ├── operationalSlice.ts
│       ├── approvalSlice.ts
│       └── offlineSlice.ts
├── utils/
│   ├── logger.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── performance.ts
└── providers/
    └── QueryProvider.tsx

src/features/approval/
├── components/
│   ├── CustomSelect.tsx
│   ├── EquipmentBottomSheet.tsx
│   ├── OprDrvBottomSheet.tsx
│   ├── KegiatanBottomSheet.tsx
│   ├── LokasiBottomSheet.tsx
│   ├── EquipmentItem.tsx
│   └── OprDrvItem.tsx
└── hooks/
    └── useFilterPenugasan.ts

__tests__/
├── utils/
│   ├── testUtils.ts
│   ├── logger.test.ts
│   ├── validation.test.ts
│   └── errorHandler.test.ts
└── hooks/
    ├── useAuth.test.ts
    ├── useMasterData.test.ts
    └── useTheme.test.ts
```

### Files to Modify

```
app/_layout.js              - Add providers, migration
app/(tabs)/home.js          - Replace Redux with React Query
src/store/index.js          - Consolidate slices
src/store/slices/authSlice.js - Use SecureStorage
src/services/api/client.js  - Replace console.log
src/database/SQLiteService.js - Refactor, use repositories
src/features/approval/components/FilterPenugasanModal.js - Split
src/features/attendance/components/FilterAbsensi.js - Use new picker
package.json                - Add dependencies, bump version
tsconfig.json               - TypeScript configuration
.env.example                - Add new env vars
```

### Files to Delete (After Migration)

```
# Old individual slices (after consolidation)
src/store/slices/themeSlice.js      → merged into uiSlice
src/store/slices/alertSlice.js      → merged into uiSlice
src/store/slices/karyawanSlice.js   → merged into masterDataSlice
src/store/slices/oprdrvSlice.js     → merged into masterDataSlice
src/store/slices/equipmentSlice.js  → merged into masterDataSlice
# ... etc (keep old files until migration complete, then remove)
```

---

## Notes & Guidelines

### Commit Message Format

```
feat(scope): description     - New feature
fix(scope): description      - Bug fix
refactor(scope): description - Code refactoring
perf(scope): description     - Performance improvement
test(scope): description     - Adding tests
docs(scope): description     - Documentation
chore(scope): description    - Maintenance

Examples:
feat(logger): implement logging utility with log levels
fix(auth): secure token storage migration
refactor(sqlite): implement batch operations
perf(list): optimize FlatList rendering
test(hooks): add useAuth tests
```

### Branch Strategy

```
main
└── feature/v1.3.0-optimization
    ├── feature/v1.3.0-logger
    ├── feature/v1.3.0-secure-storage
    ├── feature/v1.3.0-sqlite-batch
    ├── feature/v1.3.0-react-query
    ├── feature/v1.3.0-bottomsheet
    ├── feature/v1.3.0-redux-consolidation
    └── feature/v1.3.0-testing
```

### Definition of Done

Each task is considered done when:
- [ ] Code is written and working
- [ ] TypeScript types are added (if applicable)
- [ ] No console.log (use logger)
- [ ] No hardcoded values
- [ ] Tested manually
- [ ] Code reviewed
- [ ] Merged to feature branch

---

**Last Updated**: January 22, 2026  
**Next Review**: Weekly during implementation
