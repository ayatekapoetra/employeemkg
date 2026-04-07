import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * SQLite Database Service for APP-EMPLOYEE
 * Focused on offline storage for checklog coordinates
 */
class SQLiteService {
  constructor() {
    this.db = null;
    this.initialized = false;
    this._initPromise = null;
    this._operationQueue = Promise.resolve();
  }

  /**
   * Queue an operation to ensure sequential execution (prevent concurrent access)
   * IMPORTANT: errors are isolated per operation - a failed operation does NOT 
   * break the queue for subsequent operations.
   */
  _enqueue(operation) {
    const result = this._operationQueue.then(() => operation());
    // Keep the queue alive regardless of success/failure
    // This prevents one failed sync from breaking all subsequent syncs
    this._operationQueue = result.catch((err) => {
      console.error('[SQLiteService] Queued operation error (isolated):', err?.message);
      // Don't re-throw - queue continues for next operation
    });
    return result; // Return the actual result (with error) to the caller
  }

  /**
   * Initialize database and create tables
   */
  async init() {
    if (this.initialized && this.db) return;

    // Prevent multiple simultaneous init calls
    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = (async () => {
      const MAX_RETRIES = 3;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          // Close existing connection if any
          if (this.db) {
            try {
              await this.db.closeAsync();
            } catch (e) {
              // Ignore close errors
            }
            this.db = null;
          }

          // Delay before opening - longer on retries to let native side recover
          await new Promise(r => setTimeout(r, attempt * 200));

          this.db = await SQLite.openDatabaseAsync('mkg_employee.db');

          // Verify the connection actually works before setting PRAGMAs
          // Use getFirstAsync which is more reliable than execAsync on fresh connections
          await this.db.getFirstAsync('SELECT 1');

          // Set PRAGMAs using getFirstAsync (returns result, more stable than execAsync)
          await this.db.getFirstAsync('PRAGMA journal_mode = WAL');
          await this.db.getFirstAsync('PRAGMA synchronous = NORMAL');
          await this.db.getFirstAsync('PRAGMA busy_timeout = 5000');

await this.createTables();
      await this.upgradeTables(); // Add this line for table upgrades
      this.initialized = true;
      console.log(`[SQLiteService] ✅ Database initialized (attempt ${attempt})`);
      return; // Success, exit retry loop
        } catch (error) {
          console.warn(`[SQLiteService] Init attempt ${attempt}/${MAX_RETRIES} failed:`, error?.message);
          this.db = null;
          this.initialized = false;

          if (attempt === MAX_RETRIES) {
            console.error('[SQLiteService] ❌ All init attempts failed');
            throw error;
          }
        }
      }
    })().finally(() => {
      this._initPromise = null;
    });

    return this._initPromise;
  }

  /**
   * Create all required tables
   */
  async createTables() {
    const tables = [
      // Koordinat Checklog Table
      `CREATE TABLE IF NOT EXISTS koordinat_checklogs (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        cabang_id TEXT,
        kode TEXT,
        latitude REAL,
        longitude REAL,
        radius REAL,
        aktif TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      // Master Data Tables
      `CREATE TABLE IF NOT EXISTS master_barang (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kode TEXT,
        kategori TEXT,
        satuan TEXT,
        stok INTEGER DEFAULT 0,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      `CREATE TABLE IF NOT EXISTS master_barangrack (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kode TEXT,
        kapasitas INTEGER DEFAULT 0,
        lokasi TEXT,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      `CREATE TABLE IF NOT EXISTS master_equipment (
        id TEXT PRIMARY KEY,
        kode TEXT NOT NULL,
        nama TEXT NOT NULL,
        tipe TEXT,
        kategori TEXT,
        tiretype TEXT,
        kapasitas INTEGER DEFAULT 0,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      `CREATE TABLE IF NOT EXISTS master_lokasipit (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kode TEXT,
        cabang_id TEXT,
        type TEXT,
        abbr TEXT,
        sts_jarak TEXT,
        aktif TEXT DEFAULT 'Y',
        area TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      `CREATE TABLE IF NOT EXISTS master_oprdrv (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        nik TEXT,
        phone TEXT,
        section TEXT,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      `CREATE TABLE IF NOT EXISTS master_pemasok (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kode TEXT,
        alamat TEXT,
        phone TEXT,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      `CREATE TABLE IF NOT EXISTS master_penyewa (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        abbr TEXT,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      `CREATE TABLE IF NOT EXISTS master_shift (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kode TEXT,
        start_shift TEXT,
        end_shift TEXT,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      // New tables for complete offline support
      `CREATE TABLE IF NOT EXISTS master_gudang (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kode TEXT,
        alamat TEXT,
        cabang_id TEXT,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      `CREATE TABLE IF NOT EXISTS master_cabang (
        id TEXT PRIMARY KEY,
        kode TEXT NOT NULL,
        nama TEXT NOT NULL,
        area TEXT,
        bisnis TEXT,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      `CREATE TABLE IF NOT EXISTS master_karyawan (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        nik TEXT,
        jabatan TEXT,
        departemen TEXT,
        cabang_id TEXT,
        phone TEXT,
        email TEXT,
        area TEXT,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      `CREATE TABLE IF NOT EXISTS master_kegiatanpit (
        id TEXT PRIMARY KEY,
        nama TEXT NOT NULL,
        kode TEXT,
        kategori TEXT,
        aktif TEXT DEFAULT 'Y',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`
    ];

    for (const table of tables) {
      await this.db.runAsync(table);
    }

    console.log('[SQLiteService] ✅ All tables created');
  }

  /**
   * Upgrade tables for new columns (ALTER TABLE operations)
   */
  async upgradeTables() {
    try {
      const upgrades = [
        {
          table: 'master_karyawan',
          columns: [
            { name: 'area', type: 'TEXT', default: null }
          ]
        },
        {
          table: 'master_cabang',
          columns: [
            { name: 'bisnis', type: 'TEXT', default: null }
          ]
        }
      ];

      for (const upgrade of upgrades) {
        for (const column of upgrade.columns) {
          await this.addColumnIfNotExists(upgrade.table, column.name, column.type, column.default);
        }
      }
      
      console.log('[SQLiteService] ✅ All tables upgraded');
    } catch (error) {
      console.error('[SQLiteService] ❌ Error upgrading tables:', error);
    }
  }

  /**
   * Add column to table if it doesn't exist
   */
  async addColumnIfNotExists(tableName, columnName, columnType, defaultValue = null) {
    try {
      const db = await this.getDb();
      
      // Check if column exists
      const tableInfo = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
      const columnExists = tableInfo.some(column => column.name === columnName);
      
      if (!columnExists) {
        const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`;
        if (defaultValue !== null) {
          sql += ` DEFAULT ${defaultValue}`;
        }
        await db.runAsync(sql);
        console.log(`[SQLiteService] ✅ Added column ${columnName} to table ${tableName}`);
      } else {
        console.log(`[SQLiteService] ℹ️ Column ${columnName} already exists in table ${tableName}`);
      }
    } catch (error) {
      console.error(`[SQLiteService] ❌ Error adding column ${columnName} to ${tableName}:`, error);
      // Don't throw error - continue with existing structure
    }
  }

  /**
   * Ensure database is initialized and connection is alive
   */
  async ensureInitialized() {
    if (!this.initialized || !this.db) {
      console.log('[SQLiteService] Database not initialized, initializing now...');
      await this.init();
      return;
    }

    // Verify connection is still alive with a simple query
    try {
      await this.db.getFirstAsync('SELECT 1');
    } catch (error) {
      console.warn('[SQLiteService] Connection dead, reinitializing...', error?.message);
      this.initialized = false;
      this.db = null;
      await new Promise(r => setTimeout(r, 200));
      await this.init();
    }
  }

  /**
   * Get a valid database reference, re-init if needed
   */
  async getDb() {
    await this.ensureInitialized();
    if (!this.db) {
      throw new Error('Database connection is not available');
    }
    return this.db;
  }

  /**
   * Generic insert operation
   */
  async insert(table, data) {
    try {
      await this.ensureInitialized();

      if (!table || !data) {
        throw new Error('Missing table or data for insert');
      }

      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      if (!columns || !values.length) {
        throw new Error('No data to insert');
      }

      const result = await this.db.runAsync(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
        values
      );

      return result;
    } catch (error) {
      console.log(`[SQLiteService] Error inserting to ${table}:`, error?.message || error);
      return null;
    }
  }

  /**
   * Generic update operation
   */
  async update(table, data, id) {
    try {
      await this.ensureInitialized();

      if (!table || !data || !id) {
        throw new Error('Missing table, data, or id for update');
      }

      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];

      if (!setClause) {
        throw new Error('No data to update');
      }

      const result = await this.db.runAsync(
        `UPDATE ${table} SET ${setClause}, updated_at = strftime('%s', 'now') WHERE id = ?`,
        values
      );

      return result;
    } catch (error) {
      console.log(`[SQLiteService] Error updating ${table}:`, error?.message || error);
      throw error;
    }
  }

  /**
   * Upsert operation (insert or update)
   */
  async upsert(table, data) {
    try {
      await this.ensureInitialized();

      if (!data || !data.id) {
        throw new Error(`Invalid data for upsert: missing id`);
      }

      const existing = await this.getById(table, data.id);
      if (existing) {
        return await this.update(table, data, data.id);
      } else {
        return await this.insert(table, data);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.log(`[SQLiteService] Error upserting to ${table}:`, errorMessage);
      return null;
    }
  }

  /**
   * Get record by ID
   */
  async getById(table, id) {
    try {
      await this.ensureInitialized();

      if (!table || !id) {
        console.warn('[SQLiteService] getById missing table or id:', { table, id });
        return null;
      }

      if (!this.db) {
        console.error('[SQLiteService] Database not initialized after ensureInitialized');
        return null;
      }

      const result = await this.db.getFirstAsync(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      return result;
    } catch (error) {
      console.error(`[SQLiteService] Error getting by id from ${table}:`, error?.message || error);
      return null;
    }
  }

  /**
   * Get all records from table
   */
  async getAll(table) {
    try {
      await this.ensureInitialized();

      if (!this.db) {
        console.error('[SQLiteService] Database not initialized');
        return [];
      }

      const result = await this.db.getAllAsync(`SELECT * FROM ${table} ORDER BY created_at DESC`);
      return result;
    } catch (error) {
      console.error(`[SQLiteService] Error getting all from ${table}:`, error?.message || error);
      return [];
    }
  }

  /**
   * Query with where clause
   */
  async query(table, whereClause, params = []) {
    try {
      await this.ensureInitialized();

      if (!this.db) {
        console.error('[SQLiteService] Database not initialized');
        return [];
      }

      const result = await this.db.getAllAsync(`SELECT * FROM ${table} WHERE ${whereClause}`, params);
      return result;
    } catch (error) {
      console.error(`[SQLiteService] Error querying ${table}:`, error?.message || error);
      return [];
    }
  }

  /**
   * Delete record by ID
   */
  async delete(table, id) {
    try {
      await this.ensureInitialized();

      if (!this.db) {
        console.error('[SQLiteService] Database not initialized');
        return null;
      }

      const result = await this.db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
      return result;
    } catch (error) {
      console.error(`[SQLiteService] Error deleting from ${table}:`, error?.message || error);
      return null;
    }
  }

  /**
   * Clear all records from table
   */
  async clear(table) {
    try {
      await this.ensureInitialized();
      const result = await this.db.runAsync(`DELETE FROM ${table}`);
      console.log(`✅ Cleared table: ${table}`);
      return result;
    } catch (error) {
      console.error(`❌ Error clearing table ${table}:`, error);
      return null;
    }
  }

  // ============================================
  // Koordinat Checklog Services
  // ============================================

  /**
   * Get all koordinat checklog
   */
  async getKoordinatChecklog() {
    return await this.getAll('koordinat_checklogs');
  }

  /**
   * Sync koordinat checklog from API
   */
  async syncKoordinatChecklog(data) {
    const columns = ['id', 'nama', 'cabang_id', 'kode', 'latitude', 'longitude', 'radius', 'aktif'];
    
    return this._batchSync('koordinat_checklogs', data, (item) => {
      if (!item || !item.id) return null;
      return {
        id: item.id.toString(),
        nama: item.nama || '',
        cabang_id: item.cabang_id?.toString() || '',
        kode: item.kode || '',
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        radius: item.radius || 0,
        aktif: item.aktif || ''
      };
    }, columns);
  }

  // ============================================
  // Master Data Sync Services
  // ============================================

  /**
   * Sync barang from API to SQLite - Optimized for large datasets
   */
  async syncBarang(data) {
    console.log('[SQLiteService] syncBarang called with', data?.length || 0, 'items');
    console.log('[SQLiteService] Using optimized method for large datasets');
    try {
      return await this._syncBarangOptimized(data);
    } catch (err) {
      const msg = err?.message || String(err);
      if (msg && msg.toLowerCase().includes('sqlite_full')) {
        console.warn('[SQLiteService] SQLITE_FULL detected, skipping barang sync');
        return { successCount: 0, errorCount: data?.length || 0, errors: [msg] };
      }
      throw err;
    }
  }

  /**
   * Optimized barang sync for large datasets - Simplified approach
   */
  async _syncBarangOptimized(data) {
    const columns = ['id', 'nama', 'kode', 'kategori', 'satuan', 'stok', 'aktif'];
    
    return this._enqueue(async () => {
      if (!Array.isArray(data) || data.length === 0) {
        return { successCount: 0, errorCount: 0, errors: [] };
      }

      console.log(`[SQLiteService] Sync barang: ${data.length} items (optimized mode)`);

      // Ensure DB is ready
      console.log('[SQLiteService] Ensuring database is initialized...');
      await this.ensureInitialized();
      console.log('[SQLiteService] Database initialized successfully');

      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      // Clear table first for faster INSERT (instead of UPDATE)
      try {
        console.log('[SQLiteService] STEP 1: Clearing master_barang table...');
        const clearStart = Date.now();
        await this.db.runAsync('DELETE FROM master_barang');
        const clearTime = Date.now() - clearStart;
        console.log(`[SQLiteService] Table cleared successfully in ${clearTime}ms`);
      } catch (clearError) {
        console.warn('[SQLiteService] Failed to clear table:', clearError.message);
        if (String(clearError?.message || '').toLowerCase().includes('sqlite_full')) {
          throw clearError;
        }
        // Continue even if clear fails
      }

      // Build the SQL template once
      const colList = columns.join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT INTO master_barang (${colList}, updated_at) VALUES (${placeholders}, strftime('%s', 'now'))`;
      console.log(`[SQLiteService] SQL template: ${sql}`);

      // Use very small batches for large dataset
      const BATCH_SIZE = 100; // Smaller batches = more responsive
      const totalBatches = Math.ceil(data.length / BATCH_SIZE);
      
      console.log(`[SQLiteService] STEP 2: Processing in ${totalBatches} batches of ${BATCH_SIZE} items each...`);

      // Process in batches
      for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
        const batchStart = batchNum * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, data.length);
        const batch = data.slice(batchStart, batchEnd);
        
        console.log(`[SQLiteService] Processing batch ${batchNum + 1}/${totalBatches}: items ${batchStart + 1}-${batchEnd}`);
        
        try {
          console.log(`[SQLiteService] STEP 3.${batchNum + 1}: Mapping ${batch.length} items...`);
          const mappingStart = Date.now();
          
          // Build batch data arrays
          const allParams = [];
          const validItems = [];
          
          for (let i = 0; i < batch.length; i++) {
            const item = batch[i];
            const rowData = this._mapBarangItem(item, batchStart + i);
            
            if (!rowData) {
              errorCount++;
              continue;
            }
            
            // Build params array matching column order
            const params = columns.map(col => {
              const val = rowData[col];
              if (val === null || val === undefined) return null;
              if (typeof val === 'number') return isNaN(val) || !isFinite(val) ? 0 : val;
              if (typeof val === 'boolean') return val ? 1 : 0;
              return String(val);
            });
            
            allParams.push(...params);
            validItems.push(rowData);
          }
          
          const mappingTime = Date.now() - mappingStart;
          console.log(`[SQLiteService] Mapping completed in ${mappingTime}ms. Valid items: ${validItems.length}/${batch.length}`);
          
          if (allParams.length === 0) {
            console.log(`[SQLiteService] Batch ${batchNum + 1}: No valid items to insert`);
            continue;
          }
          
          // Execute batch insert using transaction
          await this.db.withTransactionAsync(async () => {
            for (let i = 0; i < validItems.length; i++) {
              const paramStart = i * columns.length;
              const itemParams = allParams.slice(paramStart, paramStart + columns.length);
              
              try {
                await this.db.runAsync(sql, itemParams);
                successCount++;
              } catch (err) {
                const errMsg = err?.message || '';
                errorCount++;
                
                if (errors.length < 5) {
                  errors.push(`Batch ${batchNum + 1}, item ${i + 1}: ${errMsg.substring(0, 80)}`);
                }
                
                console.warn(`[SQLiteService] Batch ${batchNum + 1}, item ${i + 1} failed: ${errMsg}`);
              }
            }
          });
          
          console.log(`[SQLiteService] Batch ${batchNum + 1}/${totalBatches} completed: ${successCount} total, ${errorCount} errors`);
          
          // Progress tracking
          const progress = ((batchNum + 1) / totalBatches * 100).toFixed(1);
          console.log(`[SQLiteService] Overall progress: ${progress}% (${successCount}/${data.length} items)`);
          
          // Add delay between batches to prevent database lock
          if (batchNum < totalBatches - 1) {
            const delay = Math.min(100, 20 + (batchNum * 2)); // Progressive delay
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
        } catch (batchError) {
          console.error(`[SQLiteService] Batch ${batchNum + 1} failed:`, batchError);
          errorCount += batch.length;
          
          if (errors.length < 5) {
            errors.push(`Batch ${batchNum + 1}: ${batchError.message?.substring(0, 80)}`);
          }
          
          // Add extra delay on error
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log(`[SQLiteService] Barang sync completed: ✅ ${successCount} synced, ❌ ${errorCount} errors`);
      return { successCount, errorCount, errors };
    });
  }

  /**
   * Escape SQL string value to prevent injection
   */
  _escapeSql(value) {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) return '0';
      return String(value);
    }
    if (typeof value === 'boolean') return value ? '1' : '0';
    const str = String(value).replace(/'/g, "''");
    return "'" + str + "'";
  }

  /**
   * Batch sync helper - uses runAsync with parameterized queries.
   * 
   * Uses runAsync (prepared statements with params) instead of execAsync (raw SQL)
   * because execAsync throws NullPointerException on Android (expo-sqlite v16).
   * 
   * Strategy:
   * - Uses INSERT OR REPLACE with parameterized ? placeholders
   * - Processes items sequentially via individual runAsync calls
   * - If error occurs, reinitializes DB and retries
   * - All operations queued via _enqueue to prevent concurrent access
   */
  async _batchSync(tableName, data, mapFn, columns) {
    return this._enqueue(async () => {
      if (!Array.isArray(data) || data.length === 0) {
        return { successCount: 0, errorCount: 0, errors: [] };
      }

      console.log(`[SQLiteService] Sync ${tableName}: ${data.length} items`);

      // Ensure DB is ready
      await this.ensureInitialized();

      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      let consecutiveErrors = 0;
      const MAX_CONSECUTIVE_ERRORS = 10; // Abort if 10 failures in a row
      
      // Timeout protection for large datasets
      const TIMEOUT_MS = Math.max(30000, data.length * 10); // 30s minimum + 10ms per item
      const startTime = Date.now();
      
      console.log(`[SQLiteService] ${tableName}: Timeout set to ${TIMEOUT_MS}ms`);

      // Build the SQL template once (with ? placeholders)
      const colList = columns.join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT OR REPLACE INTO ${tableName} (${colList}, updated_at) VALUES (${placeholders}, strftime('%s', 'now'))`;

      for (let i = 0; i < data.length; i++) {
        // Check timeout
        if (Date.now() - startTime > TIMEOUT_MS) {
          console.error(`[SQLiteService] ${tableName}: Timeout after ${TIMEOUT_MS}ms. ${successCount}/${data.length} done`);
          errorCount += (data.length - i - 1);
          errors.push(`Timeout: Aborted after ${TIMEOUT_MS}ms`);
          break;
        }

        const item = data[i];
        if (!item) { errorCount++; continue; }

        const rowData = mapFn(item, i);
        if (!rowData) { errorCount++; continue; }

        // Build params array matching column order
        const params = columns.map(col => {
          const val = rowData[col];
          if (val === null || val === undefined) return null;
          if (typeof val === 'number') return isNaN(val) || !isFinite(val) ? 0 : val;
          if (typeof val === 'boolean') return val ? 1 : 0;
          return String(val);
        });

        try {
          await this.db.runAsync(sql, params);
          successCount++;
          consecutiveErrors = 0;
        } catch (err) {
          const errMsg = err?.message || '';
          consecutiveErrors++;
          errorCount++;

          if (errors.length < 5) {
            errors.push(`[${i}]: ${errMsg.substring(0, 80)}`);
          }

          // Connection issue - reinitialize and retry
          if (errMsg.includes('NullPointer') || errMsg.includes('not open') || 
              errMsg.includes('database is locked') || errMsg.includes('prepare') ||
              errMsg.includes('timeout') || errMsg.includes('busy')) {
            console.warn(`[SQLiteService] ${tableName}[${i}]: Connection issue, reinitializing...`);
            this.initialized = false;
            this.db = null;

            try {
              await this.init();
              consecutiveErrors = 0;

              // Wait a bit after reinit
              await new Promise(resolve => setTimeout(resolve, 100));

              // Retry this item after reinit
              try {
                await this.db.runAsync(sql, params);
                successCount++;
                errorCount--; // Undo error count
              } catch (retryErr) {
                console.warn(`[SQLiteService] ${tableName}[${i}]: Retry failed, skipping...`);
              }
            } catch (reinitErr) {
              console.error(`[SQLiteService] ${tableName}: Reinit failed, aborting. ${successCount}/${data.length} done`);
              errorCount += (data.length - i - 1);
              break;
            }
          }

          // Too many consecutive errors = systemic issue
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            console.error(`[SQLiteService] ${tableName}: Too many errors, aborting. ${successCount}/${data.length} done`);
            errorCount += (data.length - i - 1);
            break;
          }
        }
      }

      console.log(`[SQLiteService] ${tableName}: ✅ ${successCount} synced, ❌ ${errorCount} errors`);
      return { successCount, errorCount, errors };
    });
  }

  /**
   * Sync barang from API to SQLite - Optimized for large datasets
   */
  async syncBarang(data) {
    console.log('[SQLiteService] syncBarang called with', data?.length || 0, 'items');
    console.log('[SQLiteService] Using optimized method for large datasets');
    const columns = ['id', 'nama', 'kode', 'kategori', 'satuan', 'stok', 'aktif'];
    
    return this._enqueue(async () => {
      if (!Array.isArray(data) || data.length === 0) {
        return { successCount: 0, errorCount: 0, errors: [] };
      }

      console.log(`[SQLiteService] Sync barang: ${data.length} items (optimized mode)`);

      // Ensure DB is ready
      await this.ensureInitialized();

      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      // For large datasets, use batch processing
      const BATCH_SIZE = 200; // Process 200 items at a time
      const DELAY_MS = 50; // 50ms delay between batches
      
      // Build the SQL template once
      const colList = columns.join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT OR REPLACE INTO master_barang (${colList}, updated_at) VALUES (${placeholders}, strftime('%s', 'now'))`;

      console.log(`[SQLiteService] Processing in ${Math.ceil(data.length / BATCH_SIZE)} batches...`);

      // Process in batches
      for (let batchStart = 0; batchStart < data.length; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, data.length);
        const batch = data.slice(batchStart, batchEnd);
        
        console.log(`[SQLiteService] Processing batch ${Math.floor(batchStart / BATCH_SIZE) + 1}: items ${batchStart + 1}-${batchEnd}`);
        
        // Use transaction for each batch
        try {
          await this.db.withTransactionAsync(async () => {
            for (let i = 0; i < batch.length; i++) {
              const item = batch[i];
              const globalIndex = batchStart + i;
              
              if (!item) {
                errorCount++;
                continue;
              }

              const rowData = this._mapBarangItem(item, globalIndex);
              if (!rowData) {
                errorCount++;
                continue;
              }

              // Build params array
              const params = columns.map(col => {
                const val = rowData[col];
                if (val === null || val === undefined) return null;
                if (typeof val === 'number') return isNaN(val) || !isFinite(val) ? 0 : val;
                if (typeof val === 'boolean') return val ? 1 : 0;
                return String(val);
              });

              try {
                await this.db.runAsync(sql, params);
                successCount++;
              } catch (err) {
                const errMsg = err?.message || '';
                errorCount++;
                
                if (errors.length < 5) {
                  errors.push(`[${globalIndex}]: ${errMsg.substring(0, 80)}`);
                }
                
                console.warn(`[SQLiteService] Barang item ${globalIndex} failed: ${errMsg}`);
              }
            }
          });
          
          console.log(`[SQLiteService] Batch ${Math.floor(batchStart / BATCH_SIZE) + 1} completed: ${successCount} total`);
          
          // Add delay between batches to prevent database lock
          if (batchEnd < data.length) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
          }
          
        } catch (batchError) {
          console.error(`[SQLiteService] Batch ${Math.floor(batchStart / BATCH_SIZE) + 1} failed:`, batchError);
          errorCount += batch.length;
          
          if (errors.length < 5) {
            errors.push(`Batch ${Math.floor(batchStart / BATCH_SIZE) + 1}: ${batchError.message?.substring(0, 80)}`);
          }
        }
      }

      console.log(`[SQLiteService] Barang sync completed: ✅ ${successCount} synced, ❌ ${errorCount} errors`);
      return { successCount, errorCount, errors };
    });
  }

  /**
   * Helper function to map barang item
   */
  _mapBarangItem(item, index) {
    const itemId = item.id ?? item.barang_id ?? item.ID ?? item.Id;
    if (itemId === null || itemId === undefined) return null;

    return {
      id: String(itemId),
      nama: item.nama || item.name || item.nama_barang || item.namaBarang || '',
      kode: item.kode || item.code || item.kode_barang || item.kodeBarang || '',
      kategori: item.kategori || item.category || item.kategori_barang || item.jenis || item.type || '',
      satuan: item.satuan || item.unit || item.satuan_barang || item.uom || '',
      stok: parseInt(item.stok || item.stock || item.qty || 0) || 0,
      aktif: item.aktif || item.active || item.is_active || item.status || 'Y'
    };
  }

  /**
   * Get barangrack from SQLite
   */
  async getBarangRack() {
    return await this.getAll('master_barangrack');
  }

  /**
   * Sync barangrack from API to SQLite
   */
  async syncBarangRack(data) {
    const columns = ['id', 'nama', 'kode', 'kapasitas', 'lokasi', 'aktif'];
    
    return this._batchSync('master_barangrack', data, (item) => {
      if (!item || !item.id) return null;
      return {
        id: item.id.toString(),
        nama: item.nama || '',
        kode: item.kode || '',
        kapasitas: item.kapasitas || 0,
        lokasi: item.lokasi || '',
        aktif: item.aktif || 'Y'
      };
    }, columns);
  }

  /**
   * Get equipment from SQLite
   */
  async getEquipment() {
    return await this.getAll('master_equipment');
  }

  /**
   * Sync equipment from API to SQLite
   */
  async syncEquipment(data) {
    const columns = ['id', 'kode', 'nama', 'tipe', 'kategori', 'tiretype', 'kapasitas', 'aktif'];
    
    return this._batchSync('master_equipment', data, (item) => {
      if (!item || !item.id) return null;
      return {
        id: item.id.toString(),
        kode: item.kode || '',
        nama: item.nama || '',
        tipe: item.tipe || '',
        kategori: item.kategori || '',
        tiretype: item.tiretype || '',
        kapasitas: item.kapasitas || 0,
        aktif: item.aktif || 'Y'
      };
    }, columns);
  }

  /**
   * Get lokasi pit from SQLite
   */
  async getLokasiPit() {
    return await this.getAll('master_lokasipit');
  }

  /**
   * Sync lokasi pit from API to SQLite
   */
  async syncLokasiPit(data) {
    const columns = ['id', 'nama', 'kode', 'cabang_id', 'type', 'abbr', 'sts_jarak', 'aktif', 'area'];
    
    return this._batchSync('master_lokasipit', data, (item) => {
      if (!item || !item.id) return null;
      return {
        id: item.id.toString(),
        nama: item.nama || '',
        kode: item.kode || '',
        cabang_id: item.cabang_id?.toString() || '',
        type: item.type || '',
        abbr: item.abbr || '',
        sts_jarak: item.sts_jarak || '',
        aktif: item.aktif || 'Y',
        area: item.area || ''
      };
    }, columns);
  }

  /**
   * Get oprdrv from SQLite
   */
  async getOprDrv() {
    return await this.getAll('master_oprdrv');
  }

  /**
   * Sync oprdrv from API to SQLite
   */
  async syncOprDrv(data) {
    const columns = ['id', 'nama', 'nik', 'phone', 'section', 'aktif'];
    
    return this._batchSync('master_oprdrv', data, (item) => {
      if (!item || !item.id) return null;
      return {
        id: item.id.toString(),
        nama: item.nama || '',
        nik: item.nik || '',
        phone: item.phone || '',
        section: item.section || '',
        aktif: item.aktif || 'Y'
      };
    }, columns);
  }

  /**
   * Get pemasok from SQLite
   */
  async getPemasok() {
    return await this.getAll('master_pemasok');
  }

  /**
   * Sync pemasok from API to SQLite
   */
  async syncPemasok(data) {
    const columns = ['id', 'nama', 'kode', 'alamat', 'phone', 'aktif'];
    
    return this._batchSync('master_pemasok', data, (item) => {
      if (!item || !item.id) return null;
      return {
        id: item.id.toString(),
        nama: item.nama || '',
        kode: item.kode || '',
        alamat: item.alamat || '',
        phone: item.phone || '',
        aktif: item.aktif || 'Y'
      };
    }, columns);
  }

  /**
   * Get penyewa from SQLite
   */
  async getPenyewa() {
    return await this.getAll('master_penyewa');
  }

  /**
   * Sync penyewa from API to SQLite
   */
  async syncPenyewa(data) {
    const columns = ['id', 'nama', 'abbr', 'aktif'];
    
    return this._batchSync('master_penyewa', data, (item) => {
      if (!item || !item.id) return null;
      return {
        id: item.id.toString(),
        nama: item.nama || '',
        abbr: item.abbr || '',
        aktif: item.aktif || 'Y'
      };
    }, columns);
  }

  /**
   * Get shift from SQLite
   */
  async getShift() {
    return await this.getAll('master_shift');
  }

  /**
   * Sync shift from API to SQLite
   */
  async syncShift(data) {
    const columns = ['id', 'nama', 'kode', 'start_shift', 'end_shift', 'aktif'];
    
    return this._batchSync('master_shift', data, (item) => {
      if (!item || !item.id) return null;
      return {
        id: item.id.toString(),
        nama: item.nama || '',
        kode: item.kode || '',
        start_shift: item.start_shift || '',
        end_shift: item.end_shift || '',
        aktif: item.aktif || 'Y'
      };
    }, columns);
  }

  /**
   * Get cabang from SQLite
   */
  async getCabang() {
    return await this.getAll('master_cabang');
  }

  /**
   * Sync cabang from API to SQLite
   */
  async syncCabang(data) {
    const columns = ['id', 'kode', 'nama', 'area', 'bisnis', 'aktif'];

    return this._batchSync('master_cabang', data, (item) => {
      if (!item) return null;
      const id = item.id ?? item.cabang_id;
      if (!id) return null;
      return {
        id: id.toString(),
        kode: item.kode || item.code || '',
        nama: item.nama || item.name || '',
        area: item.area || item.area_name || item.region || '',
        bisnis:
          item.bisnis?.nama ||
          item.bisnis?.name ||
          item.bisnis_name ||
          item.bisnis_unit?.nama ||
          item.bisnis_unit?.name ||
          item.bisnis_unit_name ||
          '',
        aktif: item.aktif || item.active || 'Y'
      };
    }, columns);
  }

  // ============================================
  // Gudang Sync Services
  // ============================================

  /**
   * Get gudang from SQLite
   */
  async getGudang() {
    return await this.getAll('master_gudang');
  }

  /**
   * Sync gudang from API to SQLite
   */
  async syncGudang(data) {
    const columns = ['id', 'nama', 'kode', 'alamat', 'cabang_id', 'aktif'];
    
    return this._batchSync('master_gudang', data, (item) => {
      const itemId = item.id ?? item.gudang_id;
      if (!itemId) return null;
      return {
        id: String(itemId),
        nama: item.nama || item.name || '',
        kode: item.kode || item.code || '',
        alamat: item.alamat || item.address || '',
        cabang_id: item.cabang_id ? String(item.cabang_id) : '',
        aktif: item.aktif || item.active || 'Y'
      };
    }, columns);
  }

  // ============================================
  // Karyawan Sync Services
  // ============================================

  /**
   * Get karyawan from SQLite
   */
  async getKaryawan() {
    return await this.getAll('master_karyawan');
  }

  /**
   * Get karyawan with area information from SQLite
   */
  async getKaryawanWithArea() {
    try {
      const karyawan = await this.getKaryawan();
      // Area field sudah ditambahkan saat sync, jadi tinggal return
      return karyawan.map(item => ({
        ...item,
        area: item.area || ''
      }));
    } catch (error) {
      console.error('[SQLiteService] Error getting karyawan with area:', error);
      return [];
    }
  }

  /**
   * Sync karyawan from API to SQLite
   */
  async syncKaryawan(data) {
    const columns = ['id', 'nama', 'nik', 'jabatan', 'departemen', 'cabang_id', 'phone', 'email', 'area', 'aktif'];
    
    return this._batchSync('master_karyawan', data, (item) => {
      const itemId = item.id ?? item.karyawan_id;
      if (!itemId) return null;
      return {
        id: String(itemId),
        nama: item.nama || item.name || item.nama_lengkap || '',
        nik: item.nik || item.nip || '',
        jabatan: item.jabatan || item.position || item.job_title || '',
        departemen: item.departemen || item.department || item.divisi || '',
        cabang_id: item.cabang_id ? String(item.cabang_id) : '',
        phone: item.phone || item.telepon || item.hp || '',
        email: item.email || '',
        area: item.area || (item.cabang?.area) || '',
        aktif: item.aktif || item.active || item.status || 'Y'
      };
    }, columns);
  }

  // ============================================
  // Kegiatan Pit Sync Services
  // ============================================

  /**
   * Get kegiatan pit from SQLite
   */
  async getKegiatanPit() {
    return await this.getAll('master_kegiatanpit');
  }

  /**
   * Sync kegiatan pit from API to SQLite
   */
  async syncKegiatanPit(data) {
    const columns = ['id', 'nama', 'kode', 'kategori', 'aktif'];
    
    return this._batchSync('master_kegiatanpit', data, (item) => {
      const itemId = item.id ?? item.kegiatan_id;
      if (!itemId) return null;
      return {
        id: String(itemId),
        nama: item.nama || item.name || item.nama_kegiatan || '',
        kode: item.kode || item.code || '',
        kategori: item.kategori || item.category || item.type || '',
        aktif: item.aktif || item.active || 'Y'
      };
    }, columns);
  }

  // ============================================
  // AsyncStorage Fallback (for critical data)
  // ============================================

  /**
   * Save to AsyncStorage as fallback
   */
  async saveToStorage(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log(`✅ Saved to storage: ${key}`);
    } catch (error) {
      console.error('❌ Failed to save to storage:', error);
    }
  }

  /**
   * Get from AsyncStorage fallback
   */
  async getFromStorage(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Failed to get from storage:', error);
      return null;
    }
  }

  /**
   * Close database connection
   */
  async closeDB() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initialized = false;
      console.log('✅ Database closed');
    }
  }

  /**
   * Clear all data
   */
  async clearAllData() {
    await this.ensureInitialized();

    const tables = [
      'koordinat_checklogs',
      'master_barang',
      'master_barangrack',
      'master_equipment',
      'master_lokasipit',
      'master_oprdrv',
      'master_pemasok',
      'master_penyewa',
      'master_shift',
      'master_gudang',
      'master_karyawan',
      'master_kegiatanpit'
    ];

    for (const table of tables) {
      try {
        await this.db.runAsync(`DELETE FROM ${table}`);
        console.log(`✅ Cleared table: ${table}`);
      } catch (error) {
        console.error(`❌ Error clearing table ${table}:`, error);
      }
    }

    console.log('✅ All SQLite data cleared');
  }

  /**
   * Execute a custom SELECT query and return all results
   * @param {string} query - SQL SELECT query
   * @returns {Promise<Array>} Query results
   */
  async getAllAsync(query) {
    await this.ensureInitialized();
    return await this.db.getAllAsync(query);
  }

  /**
   * Execute a custom INSERT, UPDATE, or DELETE query
   * @param {string} query - SQL DML query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} Query result with changes and lastInsertRowId
   */
  async runAsync(query, params = []) {
    await this.ensureInitialized();
    return await this.db.runAsync(query, params);
  }

  /**
   * Clear all master data tables
   * @returns {Promise<Object>} Result with success status
   */
  async clearAllMasterData() {
    await this.ensureInitialized();

    const masterTables = [
      'master_barang',
      'master_barangrack',
      'master_equipment',
      'master_lokasipit',
      'master_oprdrv',
      'master_pemasok',
      'master_penyewa',
      'master_shift',
      'master_gudang',
      'master_karyawan',
      'master_kegiatanpit'
    ];

    for (const table of masterTables) {
      try {
        await this.db.runAsync(`DELETE FROM ${table}`);
        console.log(`✅ Cleared master table: ${table}`);
      } catch (error) {
        console.error(`❌ Error clearing master table ${table}:`, error);
      }
    }

    return {
      success: true,
      message: 'Semua master data berhasil dihapus'
    };
  }

  /**
   * Clear all data from the database
   * @returns {Promise<void>}
   */
  async clearAll() {
    await this.ensureInitialized();
    await this.clearAllData();
  }
}

export default new SQLiteService();
