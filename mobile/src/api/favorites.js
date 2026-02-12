import apiClient from './client';
import { normalizeResort } from './resorts';

export const favoritesApi = {
  async getAll() {
    const response = await apiClient.get('/favorites');
    const data = response.data;
    return {
      ...data,
      favorites: (data.favorites || []).map(normalizeResort),
    };
  },

  async add(resortId) {
    const response = await apiClient.post('/favorites', { resort_id: resortId });
    return response.data;
  },

  async remove(resortId) {
    const response = await apiClient.delete(`/favorites/${resortId}`);
    return response.data;
  }
};
