/**
 * OTA Version Marker
 * 
 * This constant tracks the OTA (Over-The-Air) update version.
 * Version is loaded from centralized config file.
 * 
 * @see src/config/version.js
 */

import { OTA_VERSION, getAppVersion, getBuildNumber } from '../config/version';

// Re-export from config
export { OTA_VERSION as default } from '../config/version';

export const OTA_MARKER = OTA_VERSION;

/**
 * Get OTA marker for display
 * @returns {string} OTA version marker
 */
export const getOTAMarker = () => OTA_VERSION;

/**
 * Get app version from OTA marker
 * @returns {string} App version (e.g., "1.2.28")
 */
export const getAppVersionFromOTA = () => getAppVersion();

/**
 * Get build number from OTA marker
 * @returns {string} Build number (e.g., "28")
 */
export const getBuildNumberFromOTA = () => getBuildNumber();