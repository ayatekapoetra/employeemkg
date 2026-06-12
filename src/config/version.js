/**
 * App Version Configuration
 * 
 * This file centralizes version management for the app.
 * Version and build number are loaded from environment variables.
 * 
 * Environment Variables:
 * - EXPO_PUBLIC_APP_VERSION: App version (e.g., "1.2.31")
 * - EXPO_PUBLIC_BUILD_NUMBER: Build number (e.g., "32")
 * 
 * Usage:
 * import { APP_VERSION, BUILD_NUMBER, OTA_VERSION } from '../config/version';
 */

// App version from environment (fallback to default)
export const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION || '1.2.31';

// Build number from environment (fallback to default)
export const BUILD_NUMBER = process.env.EXPO_PUBLIC_BUILD_NUMBER || '32';

// OTA Version Marker (combination of app version and build number)
// Format: OTA {version}-{build_number}
export const OTA_VERSION = `OTA ${APP_VERSION}-${BUILD_NUMBER.padStart(2, '0')}`;

/**
 * Get app version for display
 * @returns {string} App version (e.g., "1.2.31")
 */
export const getAppVersion = () => APP_VERSION;

/**
 * Get build number for display
 * @returns {string} Build number (e.g., "31")
 */
export const getBuildNumber = () => BUILD_NUMBER;

/**
 * Get OTA marker for display and logging
 * @returns {string} OTA version marker (e.g., "OTA 1.2.31-32")
 */
export const getOTAMarker = () => OTA_VERSION;

/**
 * Get full version string for display
 * @returns {string} Full version (e.g., "1.2.29 (29)")
 */
export const getFullVersion = () => `${APP_VERSION} (${BUILD_NUMBER})`;

/**
 * Get version info object
 * @returns {object} Object containing all version info
 */
export const getVersionInfo = () => ({
  version: APP_VERSION,
  buildNumber: BUILD_NUMBER,
  otaMarker: OTA_VERSION,
  fullVersion: getFullVersion(),
});

/**
 * Version history for reference
 * 
 * Recent versions:
 * - 1.2.31 (32): OTA marker bump for latest update delivery
 * - 1.2.31 (31): Block media permissions and target Android 15
 * - 1.2.30 (30): Force remove media permissions in AndroidManifest
 * - 1.2.29 (29): Remove media permissions for Play Store compliance
 * - 1.2.28 (28): OTA version display implementation
 * - 1.2.27 (27): OTA updates configuration
 * - 1.2.26 (26): Pengawas data integration
 */
export const VERSION_HISTORY = [
  { version: '1.2.31', build: '32', date: '2026-06-12', notes: 'OTA marker bump for latest update delivery' },
  { version: '1.2.31', build: '31', date: '2026-06-06', notes: 'Block media permissions and target Android 15' },
  { version: '1.2.30', build: '30', date: '2026-06-06', notes: 'Force remove media permissions in AndroidManifest' },
  { version: '1.2.29', build: '29', date: '2026-06-05', notes: 'Remove media permissions for Play Store' },
  { version: '1.2.28', build: '28', date: '2026-06-04', notes: 'OTA version display implementation' },
  { version: '1.2.27', build: '27', date: '2026-06-04', notes: 'OTA updates configuration' },
  { version: '1.2.26', build: '26', date: '2026-06-03', notes: 'Pengawas data integration' },
];
