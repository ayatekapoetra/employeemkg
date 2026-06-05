/**
 * OTA Version Marker
 * 
 * This constant tracks the OTA (Over-The-Air) update version.
 * Update this value when releasing a new OTA update.
 * 
 * Format: OTA {app-version}-{build-number}
 * Example: OTA 1.2.27-01
 * 
 * Version History:
 * - OTA 1.2.27-01: Initial OTA implementation
 */

export const OTA_VERSION = 'OTA 1.2.27-01';

/**
 * Get OTA marker for display
 * @returns {string} OTA version marker
 */
export const getOTAMarker = () => OTA_VERSION;

/**
 * Get app version from OTA marker
 * @returns {string} App version (e.g., "1.2.27")
 */
export const getAppVersion = () => {
  const match = OTA_VERSION.match(/OTA\s+([\d.]+)/);
  return match ? match[1] : '1.0.0';
};

/**
 * Get build number from OTA marker
 * @returns {string} Build number (e.g., "01")
 */
export const getBuildNumber = () => {
  const match = OTA_VERSION.match(/OTA\s+[\d.]+-(\d+)/);
  return match ? match[1] : '00';
};