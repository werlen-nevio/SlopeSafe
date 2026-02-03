import apiClient from './client';

export default {
  async getAll() {
    const response = await apiClient.get('/favorites');
    return response.data;
  },

  async add(resortId) {
    const response = await apiClient.post('/favorites', { ski_resort_id: resortId });
    return response.data;
  },

  async remove(resortId) {
    const response = await apiClient.delete(`/favorites/${resortId}`);
    return response.data;
  }
};
