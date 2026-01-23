# Product Requirements Document (PRD)
# APP-EMPLOYEE Major Update v1.3.0

---

## Document Information

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Product Name** | APP-EMPLOYEE (employeemkg) |
| **Current Version** | 1.2.21 |
| **Target Version** | 1.3.0 |
| **Author** | Development Team |
| **Created Date** | January 22, 2026 |
| **Last Updated** | January 22, 2026 |
| **Status** | Draft |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Background & Problem Statement](#2-background--problem-statement)
3. [Goals & Objectives](#3-goals--objectives)
4. [Scope](#4-scope)
5. [Technical Architecture Changes](#5-technical-architecture-changes)
6. [Feature Specifications](#6-feature-specifications)
7. [Performance Requirements](#7-performance-requirements)
8. [Security Requirements](#8-security-requirements)
9. [Migration Strategy](#9-migration-strategy)
10. [Testing Requirements](#10-testing-requirements)
11. [Release Plan](#11-release-plan)
12. [Success Metrics](#12-success-metrics)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 Overview

APP-EMPLOYEE v1.3.0 adalah major update yang berfokus pada **optimasi performa**, **peningkatan keamanan**, **perbaikan arsitektur kode**, dan **peningkatan user experience**. Update ini merupakan hasil dari analisis menyeluruh terhadap codebase existing yang mengidentifikasi berbagai area yang memerlukan perbaikan signifikan.

### 1.2 Key Highlights

- **Performance Improvement**: Target peningkatan performa aplikasi sebesar 30-40%
- **Security Enhancement**: Implementasi secure storage dan penghapusan credentials hardcoded
- **Code Quality**: Migrasi bertahap ke TypeScript dan refactoring komponen besar
- **Data Management**: Optimasi SQLite dan implementasi caching strategy yang lebih baik
- **Developer Experience**: Standardisasi logging, error handling, dan code structure

### 1.3 Timeline

| Phase | Duration | Target Date |
|-------|----------|-------------|
| Phase 1: Foundation | 2 minggu | Week 1-2 |
| Phase 2: Core Optimization | 3 minggu | Week 3-5 |
| Phase 3: Feature Enhancement | 2 minggu | Week 6-7 |
| Phase 4: Testing & QA | 2 minggu | Week 8-9 |
| Phase 5: Release | 1 minggu | Week 10 |

**Total Duration**: 10 minggu (2.5 bulan)

---

## 2. Background & Problem Statement

### 2.1 Current State Analysis

Berdasarkan analisis komprehensif terhadap codebase APP-EMPLOYEE v1.2.21, ditemukan beberapa masalah kritis:

#### 2.1.1 Performance Issues

| Issue | Impact | Severity |
|-------|--------|----------|
| 100+ console.log statements in production | 10-15% performance degradation | High |
| No request caching/deduplication | Excessive network calls | High |
| Sequential SQLite inserts (not batched) | Slow data sync (~2x slower than optimal) | High |
| No image optimization | Increased memory usage | Medium |
| ScrollView with map() instead of FlatList | Poor list performance | Medium |

#### 2.1.2 Security Vulnerabilities

| Issue | Risk Level | Description |
|-------|------------|-------------|
| Demo credentials hardcoded | Critical | `demo/demo123` dalam production code |
| Token stored in AsyncStorage | High | Tidak terenkripsi, mudah diakses |
| No certificate pinning | Medium | Vulnerable to MITM attacks |

#### 2.1.3 Code Quality Issues

| Issue | Files Affected | Impact |
|-------|----------------|--------|
| God Files (>1000 lines) | 4 files | Difficult to maintain |
| No TypeScript | All files | Type-related bugs |
| No unit tests | N/A | Regression risks |
| Duplicated code patterns | ~15 components | Inconsistent behavior |
| 19 Redux slices (too many) | Store | Complex state management |

#### 2.1.4 Architecture Problems

| Issue | Description |
|-------|-------------|
| Triple data storage | Data disimpan di Redux + SQLite + AsyncStorage tanpa clear strategy |
| No clear data flow | Inconsistent data fetching patterns |
| Tight coupling | Components terlalu dependent satu sama lain |

### 2.2 User Pain Points

1. **Slow App Startup**: Loading master data memakan waktu 15-30 detik
2. **Data Sync Issues**: Kadang data tidak tersinkronisasi dengan benar
3. **Inconsistent UI**: Beberapa komponen berperilaku berbeda (misal: bottom sheet focus issues)
4. **App Crashes**: Memory issues pada device dengan RAM rendah

### 2.3 Business Impact

- **User Retention**: Potensi churn karena performa lambat
- **Support Tickets**: Meningkatnya keluhan terkait bugs dan crashes
- **Development Velocity**: Lambatnya penambahan fitur baru karena technical debt

---

## 3. Goals & Objectives

### 3.1 Primary Goals

| Goal | Target | Measurement |
|------|--------|-------------|
| Improve app performance | 30-40% faster | Startup time, interaction latency |
| Enhance security | Zero critical vulnerabilities | Security audit score |
| Reduce technical debt | 50% reduction | Code complexity metrics |
| Improve code maintainability | 40% faster development | Time to implement new features |

### 3.2 Specific Objectives

#### Performance Objectives
- [ ] Reduce app startup time from 15s to <5s
- [ ] Reduce master data sync time from 30s to <10s
- [ ] Reduce memory usage by 25%
- [ ] Achieve 60fps scrolling on all lists

#### Security Objectives
- [ ] Remove all hardcoded credentials
- [ ] Implement secure token storage
- [ ] Add input validation on all forms
- [ ] Implement proper error masking

#### Code Quality Objectives
- [ ] Split all files >500 lines into smaller modules
- [ ] Achieve 30% TypeScript coverage
- [ ] Implement logging utility (remove raw console.log)
- [ ] Standardize component patterns

#### Architecture Objectives
- [ ] Implement clear data flow (single source of truth)
- [ ] Consolidate Redux slices from 19 to 7
- [ ] Implement proper caching strategy
- [ ] Create reusable component library

### 3.3 Non-Goals (Out of Scope)

- Complete migration to TypeScript (only partial)
- Migration away from Native Base (future version)
- Complete rewrite of the application
- Adding new business features (focus on optimization)

---

## 4. Scope

### 4.1 In Scope

#### 4.1.1 Performance Optimization
- Logger utility implementation
- SQLite batch operations
- React Query implementation for caching
- FlatList optimization
- Image caching with expo-image

#### 4.1.2 Security Enhancement
- Migrate token to SecureStore
- Remove hardcoded credentials
- Environment-based configuration
- Input sanitization

#### 4.1.3 Code Refactoring
- Split large files (FilterPenugasanModal, SQLiteService, etc.)
- Create reusable Bottom Sheet component
- Consolidate Redux slices
- Implement custom hooks for common patterns

#### 4.1.4 Architecture Improvement
- Clear data storage strategy
- Standardized API layer
- Error boundary implementation
- State management optimization

### 4.2 Out of Scope

| Item | Reason | Future Version |
|------|--------|----------------|
| Full TypeScript migration | Too large, needs gradual approach | v1.4.0+ |
| Native Base removal | Breaking changes, needs careful planning | v2.0.0 |
| New features | Focus on stability first | v1.3.x |
| Backend changes | Separate deployment cycle | N/A |
| UI/UX redesign | Separate initiative | v1.4.0 |

### 4.3 Dependencies

#### External Dependencies
- Expo SDK 54 (no upgrade planned)
- React Native 0.81.5 (no upgrade planned)
- Backend API (no changes required)

#### Internal Dependencies
- Backend team for API documentation
- QA team for testing
- Design team for any UI clarifications

---

## 5. Technical Architecture Changes

### 5.1 Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        APP-EMPLOYEE                          │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (Native Base + React Native)                       │
├─────────────────────────────────────────────────────────────┤
│  State: Redux (19 slices)                                    │
├─────────────────────────────────────────────────────────────┤
│  Data Layer:                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐              │
│  │  Redux   │  │  SQLite  │  │ AsyncStorage │              │
│  │  (RAM)   │  │ (Offline)│  │   (Config)   │              │
│  └──────────┘  └──────────┘  └──────────────┘              │
│        ↕            ↕              ↕                        │
│  ┌─────────────────────────────────────────┐               │
│  │           API Client (Axios)            │               │
│  └─────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

**Problems:**
- Data duplicated across 3 storage layers
- No clear single source of truth
- Inconsistent data flow

### 5.2 Target Architecture (v1.3.0)

```
┌─────────────────────────────────────────────────────────────┐
│                     APP-EMPLOYEE v1.3.0                      │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (Native Base + React Native Components)            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Reusable Components (BottomSheet, Pickers, etc.)    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer                                      │
│  ┌─────────────────┐  ┌────────────────────────────────┐   │
│  │  Redux (7 slices)│  │  React Query (Server State)   │   │
│  │  - auth         │  │  - Caching                     │   │
│  │  - ui           │  │  - Background refresh          │   │
│  │  - masterData   │  │  - Deduplication               │   │
│  │  - operational  │  │  - Retry logic                 │   │
│  │  - approval     │  └────────────────────────────────┘   │
│  │  - download     │                                        │
│  │  - offline      │                                        │
│  └─────────────────┘                                        │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               SQLite (Single Source of Truth)         │  │
│  │  - Master Data (offline-first)                        │  │
│  │  - Pending Operations Queue                           │  │
│  │  - Sync Metadata                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────┐  ┌─────────────────────────────────┐ │
│  │   SecureStore    │  │        AsyncStorage             │ │
│  │   - Token        │  │   - Preferences                 │ │
│  │   - Credentials  │  │   - Non-sensitive config        │ │
│  └──────────────────┘  └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Client (Axios + Interceptors + Retry)            │  │
│  │  - Request/Response logging (dev only)                │  │
│  │  - Error transformation                               │  │
│  │  - Token refresh                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Directory Structure Changes

#### Current Structure
```
employeemkg/
├── app/                          # Expo Router pages
│   ├── (tabs)/
│   ├── approval/
│   ├── penugasan/
│   └── setting/
├── src/
│   ├── components/common/        # Shared components
│   ├── features/                 # Feature modules
│   ├── services/                 # API, location, etc.
│   ├── store/slices/            # Redux slices (19 files)
│   ├── database/                # SQLite
│   ├── constants/
│   └── utils/
└── assets/
```

#### Target Structure
```
employeemkg/
├── app/                          # Expo Router pages (unchanged)
│   ├── (tabs)/
│   ├── approval/
│   ├── penugasan/
│   └── setting/
├── src/
│   ├── components/
│   │   ├── common/              # Basic UI components
│   │   ├── bottomsheets/        # NEW: Reusable bottom sheets
│   │   ├── forms/               # NEW: Form components
│   │   └── lists/               # NEW: List components
│   ├── features/
│   │   ├── attendance/
│   │   ├── approval/
│   │   │   └── components/      # REFACTORED: Smaller files
│   │   └── tasks/
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts        # UPDATED: Better error handling
│   │   │   ├── endpoints.ts
│   │   │   └── hooks/           # NEW: React Query hooks
│   │   ├── database/
│   │   │   ├── SQLiteService.ts # REFACTORED: Split by domain
│   │   │   ├── BarangRepository.ts
│   │   │   ├── KaryawanRepository.ts
│   │   │   └── index.ts
│   │   ├── storage/
│   │   │   ├── secureStorage.ts # NEW: SecureStore wrapper
│   │   │   └── asyncStorage.ts
│   │   └── logger/              # NEW: Logging utility
│   │       └── index.ts
│   ├── store/
│   │   ├── slices/              # CONSOLIDATED: 7 slices
│   │   │   ├── authSlice.ts
│   │   │   ├── uiSlice.ts
│   │   │   ├── masterDataSlice.ts
│   │   │   ├── operationalSlice.ts
│   │   │   ├── approvalSlice.ts
│   │   │   ├── downloadSlice.ts
│   │   │   └── offlineSlice.ts
│   │   └── index.ts
│   ├── hooks/                   # NEW: Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useMasterData.ts
│   │   ├── useOffline.ts
│   │   └── index.ts
│   ├── types/                   # NEW: TypeScript types
│   │   ├── api.types.ts
│   │   ├── models.types.ts
│   │   └── index.ts
│   ├── constants/
│   └── utils/
│       ├── logger.ts            # NEW
│       ├── validation.ts        # NEW
│       └── index.ts
├── __tests__/                   # NEW: Test files
│   ├── components/
│   ├── hooks/
│   └── utils/
└── assets/
```

### 5.4 Redux Store Consolidation

#### Current (19 slices)
```javascript
// Too many slices, hard to manage
auth, themes, alert, karyawan, oprdrv, datapenugasan, equipment,
equipmentPlan, equipmentDraftPlan, checklog, gudang, barang, penyewa,
lokasikerja, kegiatankerja, shift, pemasok, barangrack, tugas,
datapengajuan, koordinatChecklog, download
```

#### Target (7 slices)
```javascript
// Consolidated and organized
{
  auth: {           // User session
    user: null,
    token: null,
    karyawan: null,
    loading: false,
    error: null,
  },
  ui: {             // UI state (merged: themes + alert)
    theme: 'light',
    alert: { visible: false, type: '', message: '' },
  },
  masterData: {     // All master data (merged: 10+ slices)
    karyawan: { data: [], loading: false },
    oprdrv: { data: [], loading: false },
    equipment: { data: [], loading: false },
    gudang: { data: [], loading: false },
    barang: { data: [], loading: false },
    lokasiPit: { data: [], loading: false },
    kegiatanPit: { data: [], loading: false },
    shift: { data: [], loading: false },
    penyewa: { data: [], loading: false },
    pemasok: { data: [], loading: false },
    barangRack: { data: [], loading: false },
    koordinatChecklog: { data: [], loading: false },
  },
  operational: {    // Operational data
    penugasan: { data: [], drafts: [], loading: false },
    checklog: { history: [], pending: [] },
    tugas: { data: [], loading: false },
  },
  approval: {       // Approval workflow
    pengajuan: { data: [], loading: false },
  },
  download: {       // Sync status
    status: {},
    isDownloading: false,
    lastSyncTime: null,
    errors: {},
  },
  offline: {        // Offline queue
    pendingOperations: [],
    lastOnline: null,
  },
}
```

---

## 6. Feature Specifications

### 6.1 Logger Utility

#### 6.1.1 Overview
Implementasi logging utility untuk menggantikan console.log langsung, dengan kemampuan disable di production.

#### 6.1.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| LOG-001 | Logger harus auto-disable di production build | High |
| LOG-002 | Support multiple log levels (debug, info, warn, error) | High |
| LOG-003 | Include timestamp dan context | Medium |
| LOG-004 | Optional remote logging untuk error | Low |

#### 6.1.3 Technical Specification

```typescript
// src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabledInProduction: boolean;
  minLevel: LogLevel;
  includeTimestamp: boolean;
  remoteLogging?: {
    enabled: boolean;
    endpoint: string;
    minLevel: LogLevel;
  };
}

interface Logger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  setConfig: (config: Partial<LoggerConfig>) => void;
}

// Usage
logger.info('[Auth]', 'Login successful', { userId: 123 });
logger.error('[API]', 'Request failed', error);
```

#### 6.1.4 Migration Plan
1. Create logger utility
2. Search and replace all `console.log` with `logger.debug` or `logger.info`
3. Replace all `console.warn` with `logger.warn`
4. Replace all `console.error` with `logger.error`
5. Add context prefix to all logs

---

### 6.2 Secure Token Storage

#### 6.2.1 Overview
Migrasi penyimpanan token dari AsyncStorage ke SecureStore untuk keamanan lebih baik.

#### 6.2.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-001 | Token harus disimpan di SecureStore | Critical |
| SEC-002 | Backward compatibility dengan existing token | High |
| SEC-003 | Auto-migrate token dari AsyncStorage | High |
| SEC-004 | Fallback ke AsyncStorage jika SecureStore tidak available | Medium |

#### 6.2.3 Technical Specification

```typescript
// src/services/storage/secureStorage.ts

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

const LEGACY_KEYS = {
  TOKEN: '@token',
} as const;

interface SecureStorageService {
  // Token management
  getToken: () => Promise<string | null>;
  setToken: (token: string) => Promise<void>;
  removeToken: () => Promise<void>;
  
  // Migration
  migrateFromAsyncStorage: () => Promise<void>;
  
  // Utility
  isAvailable: () => Promise<boolean>;
}
```

#### 6.2.4 Migration Flow

```
┌─────────────────────────────────────────────┐
│              App Startup                     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Check if token exists in SecureStore       │
└──────────────────┬──────────────────────────┘
                   │
          ┌───────┴───────┐
          │               │
          ▼               ▼
       [Yes]           [No]
          │               │
          │               ▼
          │    ┌─────────────────────────────┐
          │    │ Check AsyncStorage (legacy)  │
          │    └──────────────┬──────────────┘
          │                   │
          │          ┌───────┴───────┐
          │          │               │
          │          ▼               ▼
          │       [Found]        [Not Found]
          │          │               │
          │          ▼               │
          │    ┌─────────────────┐   │
          │    │ Migrate to      │   │
          │    │ SecureStore     │   │
          │    └────────┬────────┘   │
          │             │            │
          │             ▼            │
          │    ┌─────────────────┐   │
          │    │ Delete from     │   │
          │    │ AsyncStorage    │   │
          │    └────────┬────────┘   │
          │             │            │
          ▼             ▼            ▼
┌─────────────────────────────────────────────┐
│              Continue App Init               │
└─────────────────────────────────────────────┘
```

---

### 6.3 SQLite Batch Operations

#### 6.3.1 Overview
Optimasi operasi SQLite dari sequential inserts menjadi batch operations.

#### 6.3.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| DB-001 | Batch insert untuk sync data (min 100 items per batch) | High |
| DB-002 | Transaction support untuk atomicity | High |
| DB-003 | Index pada frequently queried columns | High |
| DB-004 | Sync metadata table untuk tracking | Medium |

#### 6.3.3 Technical Specification

```typescript
// src/services/database/BaseRepository.ts

interface BatchInsertOptions {
  batchSize?: number;
  onProgress?: (progress: number) => void;
  useTransaction?: boolean;
}

interface BatchInsertResult {
  successCount: number;
  errorCount: number;
  errors: Array<{ item: any; error: string }>;
  duration: number;
}

abstract class BaseRepository<T> {
  protected tableName: string;
  protected db: SQLite.SQLiteDatabase;
  
  abstract getColumns(): string[];
  abstract mapToRow(item: T): any[];
  
  async batchInsert(
    items: T[], 
    options: BatchInsertOptions = {}
  ): Promise<BatchInsertResult> {
    const { batchSize = 100, useTransaction = true } = options;
    // Implementation
  }
  
  async batchUpsert(
    items: T[],
    options: BatchInsertOptions = {}
  ): Promise<BatchInsertResult> {
    // INSERT OR REPLACE implementation
  }
}
```

#### 6.3.4 Performance Comparison

| Operation | Current (Sequential) | Target (Batch) | Improvement |
|-----------|---------------------|----------------|-------------|
| 100 items | ~5 seconds | ~0.5 seconds | 90% faster |
| 500 items | ~25 seconds | ~2 seconds | 92% faster |
| 1000 items | ~50 seconds | ~4 seconds | 92% faster |

---

### 6.4 Reusable Bottom Sheet Component

#### 6.4.1 Overview
Create generic bottom sheet component yang bisa digunakan untuk berbagai picker (karyawan, equipment, lokasi, dll).

#### 6.4.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| BS-001 | Support search dengan keyboard yang tidak lose focus | Critical |
| BS-002 | Support single dan multi select | High |
| BS-003 | Customizable item renderer | High |
| BS-004 | Loading state support | Medium |
| BS-005 | Empty state support | Medium |

#### 6.4.3 Technical Specification

```typescript
// src/components/bottomsheets/SearchableBottomSheet.tsx

interface SearchableBottomSheetProps<T> {
  visible: boolean;
  onClose: () => void;
  
  // Data
  data: T[];
  keyExtractor: (item: T) => string;
  
  // Search
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  
  // Selection
  selectedItems?: T[];
  onSelect: (item: T) => void;
  multiSelect?: boolean;
  
  // Rendering
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  
  // Styling
  title: string;
  subtitle?: string;
  height?: string | number;
}
```

#### 6.4.4 Usage Example

```tsx
<SearchableBottomSheet
  visible={showKaryawanPicker}
  onClose={() => setShowKaryawanPicker(false)}
  title="Pilih Karyawan"
  subtitle={`${karyawanList.length} karyawan tersedia`}
  data={karyawanList}
  keyExtractor={(item) => item.id.toString()}
  searchEnabled
  searchPlaceholder="Cari nama karyawan..."
  searchKeys={['nama', 'nik', 'section']}
  selectedItems={selectedKaryawan ? [selectedKaryawan] : []}
  onSelect={(item) => {
    setSelectedKaryawan(item);
    setShowKaryawanPicker(false);
  }}
  renderItem={(item, isSelected) => (
    <KaryawanListItem item={item} isSelected={isSelected} />
  )}
/>
```

---

### 6.5 React Query Implementation

#### 6.5.1 Overview
Implementasi React Query untuk server state management dengan caching dan deduplication.

#### 6.5.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| RQ-001 | Setup React Query dengan proper configuration | High |
| RQ-002 | Create hooks untuk semua master data endpoints | High |
| RQ-003 | Implement stale-while-revalidate pattern | High |
| RQ-004 | Offline support dengan network-only fetching | Medium |
| RQ-005 | Request deduplication | Medium |

#### 6.5.3 Technical Specification

```typescript
// src/services/api/hooks/useMasterData.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys
export const queryKeys = {
  karyawan: ['karyawan'] as const,
  equipment: ['equipment'] as const,
  gudang: ['gudang'] as const,
  // ... etc
};

// Configuration
export const defaultQueryConfig = {
  staleTime: 5 * 60 * 1000,      // 5 minutes
  cacheTime: 30 * 60 * 1000,     // 30 minutes
  retry: 2,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
};

// Hooks
export function useKaryawan(options = {}) {
  return useQuery({
    queryKey: queryKeys.karyawan,
    queryFn: () => apiClient.get(API_ENDPOINTS.KARYAWAN.LIST),
    select: (data) => data.data?.data || data.data?.rows || [],
    ...defaultQueryConfig,
    ...options,
  });
}

export function useEquipment(options = {}) {
  return useQuery({
    queryKey: queryKeys.equipment,
    queryFn: () => apiClient.get(API_ENDPOINTS.EQUIPMENT.LIST),
    select: (data) => data.data?.data || data.data?.rows || [],
    staleTime: 10 * 60 * 1000, // Equipment changes less frequently
    ...defaultQueryConfig,
    ...options,
  });
}

// Prefetch helper
export function usePrefetchMasterData() {
  const queryClient = useQueryClient();
  
  return async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.karyawan,
        queryFn: () => apiClient.get(API_ENDPOINTS.KARYAWAN.LIST),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.equipment,
        queryFn: () => apiClient.get(API_ENDPOINTS.EQUIPMENT.LIST),
      }),
      // ... more prefetches
    ]);
  };
}
```

---

### 6.6 Component Refactoring

#### 6.6.1 FilterPenugasanModal.js (1,948 lines → ~300 lines each)

**Split Into:**
1. `FilterPenugasanModal.tsx` - Main modal component (~300 lines)
2. `FilterSection.tsx` - Filter form section (~200 lines)
3. `EquipmentBottomSheet.tsx` - Equipment picker (~250 lines)
4. `OprDrvBottomSheet.tsx` - Operator/Driver picker (~250 lines)
5. `LokasiBottomSheet.tsx` - Location picker (~200 lines)
6. `KegiatanBottomSheet.tsx` - Activity picker (~200 lines)
7. `useFilterPenugasan.ts` - Custom hook for filter logic (~150 lines)

#### 6.6.2 SQLiteService.js (1,213 lines → ~150-200 lines each)

**Split Into:**
1. `SQLiteService.ts` - Core database operations (~200 lines)
2. `BarangRepository.ts` - Barang CRUD (~150 lines)
3. `KaryawanRepository.ts` - Karyawan CRUD (~150 lines)
4. `EquipmentRepository.ts` - Equipment CRUD (~150 lines)
5. `MasterDataRepository.ts` - Other master data (~200 lines)
6. `SyncService.ts` - Sync operations (~200 lines)

---

## 7. Performance Requirements

### 7.1 Metrics & Targets

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| App Startup Time | 15-20s | <5s | Time from launch to interactive |
| Master Data Sync | 30s | <10s | Time to complete full sync |
| List Scroll FPS | 45-50 | 60 | React Native Performance Monitor |
| Memory Usage | 250MB | <180MB | Xcode/Android Studio Profiler |
| API Response Time | N/A | <3s p95 | API client logging |
| Time to Interactive | 8s | <3s | Custom measurement |

### 7.2 Performance Testing Plan

| Test | Description | Acceptance Criteria |
|------|-------------|---------------------|
| Cold Start | Fresh app launch after force quit | <5 seconds |
| Warm Start | App from background | <2 seconds |
| List Scroll | Scroll through 1000+ items | 60fps, no jank |
| Form Submit | Submit penugasan form | <3 seconds |
| Data Sync | Full master data sync | <10 seconds |
| Memory Stress | Extended usage (30 min) | No memory growth >20MB |

---

## 8. Security Requirements

### 8.1 Security Checklist

| ID | Requirement | Implementation |
|----|-------------|----------------|
| SEC-001 | Remove hardcoded credentials | Environment variables |
| SEC-002 | Secure token storage | expo-secure-store |
| SEC-003 | Input validation | Validation utility |
| SEC-004 | Error masking | Remove sensitive data from errors |
| SEC-005 | SSL pinning | Future consideration |
| SEC-006 | Biometric auth | Future consideration |

### 8.2 Credential Management

#### Current (Insecure)
```javascript
// WRONG - hardcoded in source
if (credentials.username === 'demo' && credentials.password === 'demo123') {
  // Demo login
}
```

#### Target (Secure)
```javascript
// Environment-based
const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
const DEMO_CREDENTIALS = {
  username: process.env.EXPO_PUBLIC_DEMO_USERNAME,
  password: process.env.EXPO_PUBLIC_DEMO_PASSWORD,
};

if (DEMO_MODE && credentials.username === DEMO_CREDENTIALS.username) {
  // Demo login
}
```

### 8.3 Token Storage Migration

| Storage Type | Data | Security Level |
|--------------|------|----------------|
| SecureStore | Auth token, Refresh token | High (encrypted) |
| AsyncStorage | User preferences, Theme | Low (plaintext) |
| SQLite | Offline data | Medium (app sandbox) |

---

## 9. Migration Strategy

### 9.1 Backward Compatibility

All changes must maintain backward compatibility:
- Existing user sessions must remain valid
- Data stored in old format must be migrated automatically
- API contracts remain unchanged

### 9.2 Feature Flags

```typescript
// src/config/featureFlags.ts

export const FEATURE_FLAGS = {
  // Gradually enable new features
  USE_REACT_QUERY: false,           // Phase 2
  USE_SECURE_STORE: true,           // Phase 1
  USE_NEW_BOTTOM_SHEET: false,      // Phase 2
  USE_BATCH_SQLITE: false,          // Phase 2
  USE_CONSOLIDATED_REDUX: false,    // Phase 3
  
  // Debug flags
  ENABLE_PERFORMANCE_LOGGING: __DEV__,
  ENABLE_NETWORK_LOGGING: __DEV__,
};
```

### 9.3 Rollback Plan

| Phase | Rollback Strategy |
|-------|-------------------|
| Phase 1 | Revert git commits, no data migration needed |
| Phase 2 | Feature flags disable new features |
| Phase 3 | Redux state has backward compatible structure |
| Phase 4 | N/A (testing only) |
| Phase 5 | App store rollback if critical issues |

---

## 10. Testing Requirements

### 10.1 Test Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| Unit Tests | 0% | 30% |
| Integration Tests | 0% | 20% |
| E2E Tests | Manual | 10 critical flows |

### 10.2 Test Categories

#### Unit Tests
- Logger utility
- Validation functions
- Data transformations
- Custom hooks

#### Integration Tests
- API client with mock server
- SQLite operations
- Redux actions and reducers

#### E2E Tests (Manual)
1. Login flow
2. Checklog attendance
3. Create penugasan
4. Approval workflow
5. Master data sync
6. Offline mode
7. App update flow
8. Error handling
9. Session restore
10. Logout flow

### 10.3 Device Testing Matrix

| Device Type | OS Version | Priority |
|-------------|------------|----------|
| Android Low-end | Android 10+ | High |
| Android Mid-range | Android 12+ | High |
| Android High-end | Android 14 | Medium |
| iPhone SE | iOS 15+ | High |
| iPhone 12/13 | iOS 16+ | High |
| iPhone 15 | iOS 17 | Medium |

---

## 11. Release Plan

### 11.1 Release Phases

#### Phase 1: Foundation (Week 1-2)
- [ ] Logger utility implementation
- [ ] SecureStore migration
- [ ] Remove hardcoded credentials
- [ ] Basic TypeScript setup

#### Phase 2: Core Optimization (Week 3-5)
- [ ] SQLite batch operations
- [ ] React Query setup
- [ ] Reusable bottom sheet component
- [ ] Component refactoring (start)

#### Phase 3: Feature Enhancement (Week 6-7)
- [ ] Redux consolidation
- [ ] Component refactoring (complete)
- [ ] Performance optimizations
- [ ] Custom hooks

#### Phase 4: Testing & QA (Week 8-9)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual E2E testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Bug fixes

#### Phase 5: Release (Week 10)
- [ ] Release candidate build
- [ ] Stakeholder review
- [ ] App store submission
- [ ] Staged rollout (10% → 50% → 100%)
- [ ] Monitoring

### 11.2 Release Checklist

```markdown
## Pre-Release Checklist

### Code Quality
- [ ] All console.log replaced with logger
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All tests passing

### Security
- [ ] No hardcoded credentials
- [ ] Token in SecureStore
- [ ] No sensitive data in logs

### Performance
- [ ] Startup time <5s
- [ ] Sync time <10s
- [ ] Memory usage <180MB
- [ ] 60fps scrolling

### Testing
- [ ] All E2E tests passed
- [ ] Tested on device matrix
- [ ] Regression testing complete

### Documentation
- [ ] CHANGELOG updated
- [ ] README updated
- [ ] Migration guide if needed

### Deployment
- [ ] Version bumped to 1.3.0
- [ ] Release notes prepared
- [ ] App store assets updated
- [ ] Monitoring setup
```

---

## 12. Success Metrics

### 12.1 Key Performance Indicators (KPIs)

| KPI | Baseline | Target | Measurement |
|-----|----------|--------|-------------|
| App Crash Rate | Unknown | <1% | Firebase Crashlytics |
| App Startup Time | 15s | <5s | Custom analytics |
| User Session Duration | Unknown | +20% | Analytics |
| Support Tickets | Current | -30% | Helpdesk |
| App Store Rating | Current | +0.3 | App Store |

### 12.2 Technical Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Bundle Size | Current | -10% |
| Redux Slices | 19 | 7 |
| Files >500 lines | 4 | 0 |
| Console.log statements | 100+ | 0 |
| TypeScript Coverage | 0% | 30% |

---

## 13. Risks & Mitigations

### 13.1 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking changes in refactoring | Medium | High | Feature flags, thorough testing |
| Performance regression | Low | High | Performance monitoring, rollback plan |
| Data migration issues | Medium | High | Backward compatibility, migration tests |
| Timeline slippage | Medium | Medium | Buffer time, prioritization |
| Resource constraints | Low | Medium | Clear scope, no scope creep |

### 13.2 Contingency Plans

| Scenario | Action |
|----------|--------|
| Critical bug in production | Immediate hotfix or rollback |
| Performance worse than before | Disable feature flags, investigate |
| Migration failures | Fallback to old storage, fix migration |
| Deadline at risk | Reduce scope, focus on critical items |

---

## 14. Appendix

### 14.1 Glossary

| Term | Definition |
|------|------------|
| SQLite | Local database for offline storage |
| SecureStore | Encrypted storage for sensitive data |
| React Query | Library for server state management |
| Redux Slice | Modular Redux state unit |
| Feature Flag | Toggle for enabling/disabling features |

### 14.2 References

- [Expo Documentation](https://docs.expo.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Native Performance Guide](https://reactnative.dev/docs/performance)

### 14.3 Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-22 | Dev Team | Initial document |

---

**Document Status**: Draft  
**Next Review**: Before Phase 1 kickoff  
**Approval Required From**: Product Owner, Tech Lead
