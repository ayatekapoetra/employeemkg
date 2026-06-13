import axios from 'axios';
import Constants from 'expo-constants';
import deviceIdGenerator from '../../utils/deviceIdGenerator';

const normalizeBaseUrl = (url) => {
  if (!url) return 'http://localhost:4010/';
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'http://' + normalized;
  }
  if (!normalized.endsWith('/')) {
    normalized = normalized + '/';
  }
  return normalized;
};

const attendanceBaseUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_ABSENSI_API_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_ABSENSI_API_URL || 'http://localhost:4010');
const attendanceToken = Constants.expoConfig?.extra?.TOKEN_ABSENSI || '';

const attendanceClient = axios.create({
  baseURL: attendanceBaseUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    appsversion: '1.0.1',
    'ngrok-skip-browser-warning': 'true',
  },
});

attendanceClient.interceptors.request.use(
  async (config) => {
    const deviceId = await deviceIdGenerator.getDeviceId();
    if (deviceId) {
      config.headers['X-UUID-DEVICE'] = deviceId;
    }

    if (attendanceToken) {
      config.headers['x-internal-token'] = attendanceToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

attendanceClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.message === 'Network Error') {
      error.message = 'Network error. Please check your internet connection.';
    } else if (error.response?.status === 401) {
      error.message = 'Unauthorized attendance request. Please check TOKEN_ABSENSI.';
    }

    return Promise.reject(error);
  }
);

export default attendanceClient;
