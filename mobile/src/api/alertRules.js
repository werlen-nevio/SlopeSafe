import apiClient from './client';

export const alertRulesApi = {
  async getAll() {
    const response = await apiClient.get('/alert-rules');
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/alert-rules', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/alert-rules/${id}`, data);
    return response.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/alert-rules/${id}`);
    return response.data;
  },

  async toggle(id) {
    const response = await apiClient.post(`/alert-rules/${id}/toggle`);
    return response.data;
  },
};
