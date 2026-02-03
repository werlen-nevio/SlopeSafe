import apiClient from './client';

export default {
  /**
   * Get current run status for a resort
   * @param {string} slug - Resort slug
   * @returns {Promise}
   */
  getRunStatus(slug) {
    return apiClient.get(`/resorts/${slug}/run-status`);
  },

  /**
   * Update run status for a resort (admin only)
   * @param {string} slug - Resort slug
   * @param {Object} data - Run status data
   * @returns {Promise}
   */
  updateRunStatus(slug, data) {
    return apiClient.post(`/admin/resorts/${slug}/run-status`, data);
  }
};
