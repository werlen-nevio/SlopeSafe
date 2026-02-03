import apiClient from './client';

export default {
  async getAll(params = {}) {
    const response = await apiClient.get('/resorts', { params });
    return response.data;
  },

  async search(query) {
    const response = await apiClient.get('/resorts/search', { params: { q: query } });
    return response.data;
  },

  async getBySlug(slug) {
    const response = await apiClient.get(`/resorts/${slug}`);
    return response.data;
  },

  async getStatus(slug) {
    const response = await apiClient.get(`/resorts/${slug}/status`);
    return response.data;
  }
};
