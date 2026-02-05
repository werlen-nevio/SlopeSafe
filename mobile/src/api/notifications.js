import apiClient from './client';

export const notificationsApi = {
  async getAll(params = {}) {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },
};
