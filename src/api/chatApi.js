import api from './axios';

export const chatApi = {
  getHistory: (customerId) => api.get(`/chat/${customerId}`),
  getConversations: () => api.get('/chat/conversations'),
  uploadMedia: (formData) => api.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
