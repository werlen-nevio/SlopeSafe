import apiClient from './client';

export default {
  async getLatest(lang = 'de') {
    const response = await apiClient.get('/bulletins/latest', { params: { lang } });
    return response.data;
  }
};
