import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import deviceIdGenerator from '../../utils/deviceIdGenerator';

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://apinext.makkuragatama.id/api/';

// Normalize base URL to ensure it has protocol and trailing slash
const normalizeBaseUrl = (url) => {
  if (!url) return 'https://apinext.makkuragatama.id/api/';
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'http://' + normalized;
  }
  if (!normalized.endsWith('/')) {
    normalized = normalized + '/';
  }
  return normalized;
};

const API_URL = normalizeBaseUrl(rawApiUrl);

const createApiClient = (baseURL) => {
  
  const client = axios.create({
    baseURL,
    timeout: 60000, // Increased to 60s for monthly attendance queries
    headers: {
      'Content-type': 'application/json',
      'Cache-Control': 'no-cache',
      appsversion: '1.0.1',
    },
  });

  client.interceptors.request.use(
    async config => {
      // Check if we're in demo mode
      const token = await AsyncStorage.getItem('@token');
      const isDemoMode = token && token.startsWith('demo-token');
      
      // Allow login endpoint to work even in demo mode
      const isLoginEndpoint = config.url && (
        config.url.includes('auth/login-mobile') || 
        config.url.includes('signin-employee')
      );
      
      if (isDemoMode && !isLoginEndpoint) {
        // Reject the request with a special error that indicates demo mode
        const demoError = new Error('DEMO_MODE');
        demoError.isDemoMode = true;
        demoError.config = config;
        return Promise.reject(demoError);
      }
      
      // Use Enhanced Device ID Generator
      const deviceId = await deviceIdGenerator.getDeviceId();
      if (deviceId) {
        config.headers['X-UUID-DEVICE'] = deviceId;
      }

      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      // Check if this is a demo mode error
      if (error.message === 'DEMO_MODE' && error.isDemoMode) {
        // Create a mock response for demo mode
        const mockResponse = {
          data: [],
          message: 'Demo mode - using mock data',
          demo: true
        };
        return Promise.resolve({ data: mockResponse });
      }

      // Special handling for 403 errors
      if (error.response?.status === 403) {
        // Return a more user-friendly error message
        error.message = 'Access denied. Please check your credentials or contact administrator.';
      } else if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout. Please try again.';
      } else if (error.message === 'Network Error') {
        error.message = 'Network error. Please check your internet connection.';
      } else if (error.response?.status === 401) {
        error.message = 'Unauthorized. Please check your credentials.';
      }

      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient(API_URL);

export default apiClient;
