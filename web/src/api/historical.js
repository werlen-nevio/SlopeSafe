import apiClient from './client';

export default {
  /**
   * Get historical danger level data for a resort
   * @param {string} slug - Resort slug
   * @param {number} days - Number of days of history (default: 7, max: 30)
   * @returns {Promise}
   */
  getHistory(slug, days = 7) {
    return apiClient.get(`/resorts/${slug}/history`, {
      params: { days }
    });
  },

  /**
   * Get trend information for a resort
   * @param {string} slug - Resort slug
   * @returns {Promise}
   */
  getTrend(slug) {
    return apiClient.get(`/resorts/${slug}/trend`);
  }
};
