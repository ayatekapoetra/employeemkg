import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const requestUpdateContactOtp = async (id, payload) => {
  const response = await apiClient.post(API_ENDPOINTS.KARYAWAN.REQUEST_UPDATE_CONTACT_OTP(id), payload);
  return response.data?.rows || response.data?.data || response.data;
};

export const verifyUpdateContactOtp = async (id, payload) => {
  const response = await apiClient.post(API_ENDPOINTS.KARYAWAN.VERIFY_UPDATE_CONTACT_OTP(id), payload);
  return response.data?.rows || response.data?.data || response.data;
};

export const updateEmployeeContact = async (id, payload) => {
  const response = await apiClient.post(API_ENDPOINTS.KARYAWAN.UPDATE_CONTACT(id), payload);
  return response.data?.rows || response.data?.data || response.data;
};
