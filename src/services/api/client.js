import axios from 'axios';
import { StorageService } from '../storage';

class ApiClient {
  constructor() {
    this.instance = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await StorageService.getToken('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          await StorageService.removeToken('token');
          await StorageService.removeData('user');
        }

        return Promise.reject(error);
      }
    );
  }

  get(url, config) {
    return this.instance.get(url, config);
  }

  post(url, data, config) {
    return this.instance.post(url, data, config);
  }

  put(url, data, config) {
    return this.instance.put(url, data, config);
  }

  patch(url, data, config) {
    return this.instance.patch(url, data, config);
  }

  delete(url, config) {
    return this.instance.delete(url, config);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
