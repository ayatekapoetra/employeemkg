import moment from 'moment';
import apiClient from '../services/api';

/**
 * Server Time Synchronization Service for APP-EMPLOYEE
 * Syncs time with server and maintains local clock
 * Falls back to local device time if server sync fails
 */
class TimeSync {
  constructor() {
    this.serverTime = null;
    this.lastSync = null;
    this.syncInterval = null;
    this.syncInProgress = false;
    this.syncIntervalMinutes = 10; // Default 10 minutes
    this.usingLocalTime = false; // Flag to track if using local time
  }

  /**
   * Sync time with server
   * @returns {Promise<Date>} Server time or local device time if sync fails
   */
  async syncWithServer() {
    // Prevent concurrent syncs
    if (this.syncInProgress) {
      console.log('[TimeSync] Sync already in progress, skipping...');
      return this.getCurrentTime();
    }

    this.syncInProgress = true;

    try {
      console.log('[TimeSync] Syncing with server...');

      // Add safety check for apiClient
      if (!apiClient || typeof apiClient.get !== 'function') {
        console.warn('⚠️ [TimeSync] API client not available, using local time');
        return this._useLocalTime();
      }

      const response = await apiClient.get('server-times');

      // Handle multiple response formats with safety checks
      let datetimeValue = null;

      try {
        if (response && response.data) {
          if (response.data.data?.datetime) {
            datetimeValue = response.data.data.datetime;
          } else if (response.data.datetime) {
            datetimeValue = response.data.datetime;
          } else if (response.data.time) {
            datetimeValue = response.data.time;
          } else if (typeof response.data === 'string') {
            datetimeValue = response.data;
          }
        }
      } catch (parseError) {
        console.warn('⚠️ [TimeSync] Error parsing response:', parseError.message);
        return this._useLocalTime();
      }

      if (datetimeValue) {
        // Parse with multiple format support
        const parsed = moment(datetimeValue, [
          'DD-MM-YYYY HH:mm:ss',
          'YYYY-MM-DD HH:mm:ss',
          'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
          moment.ISO_8601
        ], true);

        if (!parsed.isValid()) {
          console.warn('⚠️ [TimeSync] Invalid datetime format, using local time:', datetimeValue);
          return this._useLocalTime();
        }

        this.serverTime = parsed.toDate();
        this.lastSync = Date.now();
        this.usingLocalTime = false;
        console.log('✅ [TimeSync] Synced successfully with server time:', moment(this.serverTime).format('YYYY-MM-DD HH:mm:ss'));
        return this.serverTime;
      } else {
        console.warn('⚠️ [TimeSync] No datetime value in response, using local time');
        return this._useLocalTime();
      }
    } catch (error) {
      console.error('❌ [TimeSync] Failed to sync with server:', error?.message || error);

      // If we have a previous sync, continue using it
      if (this.serverTime && !this.usingLocalTime) {
        console.log('[TimeSync] Using cached server time with offset');
        return this.getCurrentTime();
      }

      // Fall back to local device time
      return this._useLocalTime();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Use local device time as fallback
   * @private
   * @returns {Date} Local device time
   */
  _useLocalTime() {
    const now = new Date();
    this.serverTime = now;
    this.lastSync = Date.now();
    this.usingLocalTime = true;
    console.log('⏰ [TimeSync] Using local device time:', moment(now).format('YYYY-MM-DD HH:mm:ss'));
    return now;
  }

  /**
   * Manually set to use local device time
   * Call this when user is not authenticated or server sync is not possible
   * @returns {Date} Local device time
   */
  useLocalTime() {
    return this._useLocalTime();
  }

  /**
   * Get current time based on last server sync
   * Always returns a valid time (server time with offset or local time)
   * @returns {Date} Current time
   */
  getCurrentTime() {
    if (!this.serverTime || !this.lastSync) {
      // If never synced, use local time
      console.warn('⚠️ [TimeSync] No sync data, using local time');
      return new Date();
    }

    // Calculate elapsed time since last sync
    const elapsed = Date.now() - this.lastSync;
    return new Date(this.serverTime.getTime() + elapsed);
  }

  /**
   * Get current time with fallback to local time (deprecated - getCurrentTime always returns time)
   * @returns {Date} Current time (server or local)
   * @deprecated Use getCurrentTime() instead - it now always returns a valid time
   */
  getCurrentTimeWithFallback() {
    return this.getCurrentTime();
  }

  /**
   * Check if time is synced
   * @returns {boolean} True if synced
   */
  isSynced() {
    return this.serverTime !== null && this.lastSync !== null;
  }

  /**
   * Get time since last sync in seconds
   * @returns {number} Seconds since last sync
   */
  getTimeSinceLastSync() {
    if (!this.lastSync) return Infinity;
    return Math.floor((Date.now() - this.lastSync) / 1000);
  }

  /**
   * Start auto sync at specified interval
   * @param {number} intervalMinutes - Sync interval in minutes (default: 10)
   */
  startAutoSync(intervalMinutes = 10) {
    this.stopAutoSync();
    this.syncIntervalMinutes = intervalMinutes;

    console.log(`[TimeSync] Starting auto sync every ${intervalMinutes} minutes`);

    this.syncInterval = setInterval(() => {
      console.log('[TimeSync] Auto sync triggered...');
      this.syncWithServer();
    }, intervalMinutes * 60 * 1000);

    // Initial sync
    this.syncWithServer();
  }

  /**
   * Stop auto sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[TimeSync] Auto sync stopped');
    }
  }

  /**
   * Reset synced time
   */
  reset() {
    this.serverTime = null;
    this.lastSync = null;
    console.log('[TimeSync] Time sync reset');
  }

  /**
   * Get formatted time for display
   * @param {string} format - Moment.js format string (default: 'HH:mm:ss')
   * @returns {string|null} Formatted time
   */
  getFormattedTime(format = 'HH:mm:ss') {
    const currentTime = this.getCurrentTime();
    return currentTime ? moment(currentTime).format(format) : null;
  }

  /**
   * Get formatted date for display
   * @param {string} format - Moment.js format string (default: 'dddd, DD MMMM YYYY')
   * @returns {string|null} Formatted date
   */
  getFormattedDate(format = 'dddd, DD MMMM YYYY') {
    const currentTime = this.getCurrentTime();
    return currentTime ? moment(currentTime).locale('id').format(format) : null;
  }

  /**
   * Get sync status for UI
   * @returns {object} Sync status
   */
  getSyncStatus() {
    return {
      isSynced: this.isSynced(),
      usingLocalTime: this.usingLocalTime,
      timeSource: this.usingLocalTime ? 'local' : 'server',
      lastSync: this.lastSync ? moment(this.lastSync).format('HH:mm:ss') : null,
      secondsSinceSync: this.getTimeSinceLastSync(),
      autoSyncEnabled: this.syncInterval !== null,
      syncInterval: this.syncIntervalMinutes
    };
  }
}

export default new TimeSync();
