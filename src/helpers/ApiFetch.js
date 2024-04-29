import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { URIPATH } from './UriPath';

const API_URL = URIPATH.apiuri

const apiFetch = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-type": "application/json",
      "Cache-Control": "no-cache",
      "appsversion": "1.0.1"
    },
});
  
apiFetch.interceptors.request.use(async (config, data) => {
    const uuid = await AsyncStorage.getItem('@DEVICESID');
    config.headers['X-UUID-DEVICE'] = uuid;
    
    const token = await AsyncStorage.getItem('@token');
    if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
    }

    return config;
});
  
export default apiFetch;