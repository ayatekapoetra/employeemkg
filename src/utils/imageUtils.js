import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compress selfie photo before upload to reduce network payload
 * @param {Object} photo - Original photo object from camera with uri property
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} Compressed photo with new uri
 */
export const compressSelfiePhoto = async (photo, options = {}) => {
  const {
    maxWidth = 640,      // Selffies don't need to be larger than 640px
    maxHeight = 640,     // Maintain aspect ratio
    quality = 0.6,       // 60% quality - good balance for selfie vs file size
    format = ImageManipulator.SaveFormat.JPEG,
  } = options;

  try {
    console.log('[ImageUtils] Starting compression for:', photo.uri);
    console.log('[ImageUtils] Original size options:', { maxWidth, maxHeight, quality });

    const result = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      {
        format,
        quality,
      }
    );

    // For debugging: get original file size (approximate)
    const compressedSize = result.uri ? result.uri.length * 0.75 : 0; // Rough estimate for base64
    console.log('[ImageUtils] Compression completed:', {
      newUri: result.uri.substring(0, 100) + '...',
      newWidth: result.width,
      newHeight: result.height,
      estimatedSize: `${Math.round(compressedSize / 1024)}KB`,
    });

    // Return the same structure as the original photo but with new uri
    return {
      ...photo,
      uri: result.uri,
      width: result.width,
      height: result.height,
      compressed: true,
    };
  } catch (error) {
    console.error('[ImageUtils] Compression failed:', error);
    // Return original photo if compression fails
    console.log('[ImageUtils] Using original photo without compression');
    return photo;
  }
};

/**
 * Check if photo size exceeds limit (very rough estimate)
 * @param {string} uri - Photo URI (can be base64 or file://)
 * @param {number} maxSizeKB - Max size in KB
 * @returns {boolean}
 */
export const isPhotoTooLarge = (uri, maxSizeKB = 1000) => {
  // This is a rough estimate - for file:// URIs we can't easily get size without file access
  if (uri.startsWith('data:image')) {
    const base64Data = uri.split(',')[1];
    const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
    const sizeInKB = sizeInBytes / 1024;
    return sizeInKB > maxSizeKB;
  }
  
  // For file:// URIs, we can't determine size reliably without react-native-fs
  // Assume it's fine and let the upload handle errors
  return false;
};

export default {
  compressSelfiePhoto,
  isPhotoTooLarge,
};