import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import deviceIdGenerator from '../../utils/deviceIdGenerator';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://apinext.makkuragatama.id/api').replace(/\/?$/, '/') ;

const createApiClient = (baseURL) => {
  console.log('BASEURL---------------------------------------------', API_URL);
  console.log('ENDPOINT--------------------------------------------', baseURL);
  
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
      // Use Enhanced Device ID Generator
      const deviceId = await deviceIdGenerator.getDeviceId();
      if (deviceId) {
        config.headers['X-UUID-DEVICE'] = deviceId;
      }

      const token = await AsyncStorage.getItem('@token');
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }

      return config;
    },
    error => {
      console.error('❌ Request Interceptor Error:', error);
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    response => {
      console.log('✅ API RESPONSE:', {
        status: response.status,
        url: response.config.url,
        hasData: !!response.data,
      });
      return response;
    },
    error => {
      console.error('❌ API RESPONSE ERROR:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });

      if (error.code === 'ECONNABORTED') {
        console.error('⏱️  Request Timeout (60s)');
      } else if (error.message === 'Network Error') {
        console.error('🔴 Network Error - Possible issues:');
        console.error('1. Server not accessible');
        console.error('2. No internet connection');
        console.error('3. CORS issue');
        console.error('4. SSL certificate issue');
        console.error('Server URL:', error.config?.baseURL);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient(API_URL);

export default apiClient;
