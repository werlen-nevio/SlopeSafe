import apiClient from './client';

export const historicalApi = {
  async getHistory(slug, days = 7) {
    const response = await apiClient.get(`/resorts/${slug}/history`, { params: { days } });
    const body = response.data;
    return { success: true, history: body.history || [] };
  },

  async getTrend(slug) {
    const response = await apiClient.get(`/resorts/${slug}/trend`);
    const body = response.data;
    return { success: true, trend: body.trend, change: body.change };
  },
};
