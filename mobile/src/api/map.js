import apiClient from './client';

export const mapApi = {
  async getResorts() {
    const response = await apiClient.get('/map/resorts');
    return response.data;
  },

  async getDangerLayer(lang = 'de') {
    const response = await apiClient.get('/map/danger-layer', { params: { lang } });
    return response.data;
  },
};
