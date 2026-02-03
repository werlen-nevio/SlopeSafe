import apiClient from './client';

export default {
  /**
   * Get current weather data for a resort
   * @param {string} slug - Resort slug
   * @returns {Promise}
   */
  getWeather(slug) {
    return apiClient.get(`/resorts/${slug}/weather`);
  }
};
