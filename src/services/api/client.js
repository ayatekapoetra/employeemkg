import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://apinext.makkuragatama.id/api').replace(/\/?$/, '/') ;

const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-type': 'application/json',
      'Cache-Control': 'no-cache',
      appsversion: '1.0.1',
    },
  });

  client.interceptors.request.use(
    async config => {
      const uuid = await AsyncStorage.getItem('@DEVICESID');
      if (uuid) {
        config.headers['X-UUID-DEVICE'] = uuid;
      }

      const token = await AsyncStorage.getItem('@token');
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }

      console.log('🌐 API REQUEST:', {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
        headers: config.headers,
        hasData: !!config.data,
      });

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
        console.error('⏱️  Request Timeout (30s)');
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
