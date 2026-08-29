/**
 * Safe error logging utility
 *
 * Mencegah error "converting circular structure to JSON" yang terjadi
 * saat console.error/console.log menerima objek error Axios mentah.
 * Objek error Axios memiliki referensi melingkar:
 *   error.request -> error.request.res -> error.request.res.req -> error.request
 *
 * Utility ini hanya mengekstrak properti aman (primitif / object datar)
 * sehingga JSON.stringify tidak gagal.
 */

/**
 * Log error dengan aman, tanpa memicu circular JSON.
 *
 * @param {string} label - Label/identitas untuk log (mis. '[Breakdown] Error fetching list:')
 * @param {*} error - Objek error (bisa Axios error, Error, atau apa saja)
 *
 * @example
 *   logError('[Breakdown] Error fetching list:', error);
 *   // Output: [Breakdown] Error fetching list: Network error { status: undefined, code: 'ERR_NETWORK', data: undefined }
 */
export const logError = (label, error) => {
  if (!error) {
    console.error(label, 'No error object provided');
    return;
  }

  // Jika error adalah string atau primitive, log langsung
  if (typeof error === 'string' || typeof error === 'number' || typeof error === 'boolean') {
    console.error(label, error);
    return;
  }

  // Ekstrak properti aman dari objek error (termasuk Axios error)
  const safeInfo = {
    message: error?.message || 'Unknown error',
    code: error?.code,
    status: error?.response?.status,
    data: error?.response?.data,
  };

  console.error(label, safeInfo.message, safeInfo);
};

/**
 * Log warning dengan aman, tanpa memicu circular JSON.
 *
 * @param {string} label - Label/identitas untuk log
 * @param {*} error - Objek error
 *
 * @example
 *   logWarn('[FilterBottomSheet] loadCabangFallback error:', e);
 */
export const logWarn = (label, error) => {
  if (!error) {
    console.warn(label, 'No error object provided');
    return;
  }

  // Jika error adalah string atau primitive, log langsung
  if (typeof error === 'string' || typeof error === 'number' || typeof error === 'boolean') {
    console.warn(label, error);
    return;
  }

  const message = error?.message || 'Unknown error';
  console.warn(label, message);
};

export default logError;