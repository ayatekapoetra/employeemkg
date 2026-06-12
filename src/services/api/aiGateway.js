import apiClient from './client';

const getPayload = (response) => response?.data?.data || response?.data || {};

export const getWhatsAppPairingStatus = async () => {
  const response = await apiClient.get('ai-gateway/whatsapp/status');
  return getPayload(response);
};

export const createWhatsAppPairingCode = async (payload = {}) => {
  const response = await apiClient.post('ai-gateway/whatsapp/pairing-code', payload);
  return getPayload(response);
};

export const sendWhatsAppOtp = async () => {
  const response = await apiClient.post('ai-gateway/whatsapp/send-otp');
  return getPayload(response);
};

export const verifyWhatsAppOtp = async (otp) => {
  const response = await apiClient.post('ai-gateway/whatsapp/verify', { otp });
  return getPayload(response);
};

export const revokeWhatsAppAccount = async (phone) => {
  const response = await apiClient.post('ai-gateway/whatsapp/revoke', { phone });
  return getPayload(response);
};

export const getChatAthiHistory = async (params = {}) => {
  const response = await apiClient.get('ai-gateway/chat-athi/history', { params });
  return getPayload(response);
};

export const sendChatAthiMessage = async (payload = {}) => {
  const response = await apiClient.post('ai-gateway/chat-athi/message', payload);
  return getPayload(response);
};
