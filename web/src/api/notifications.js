import apiClient from './client';

export default {
  async getAll(params = {}) {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  }
};
