import apiClient from './client';

export default {
  /**
   * Get all alert rules for the authenticated user
   * @returns {Promise}
   */
  getAlertRules() {
    return apiClient.get('/alert-rules');
  },

  /**
   * Create a new alert rule
   * @param {Object} data - Alert rule data
   * @returns {Promise}
   */
  createAlertRule(data) {
    return apiClient.post('/alert-rules', data);
  },

  /**
   * Update an existing alert rule
   * @param {number} id - Alert rule ID
   * @param {Object} data - Updated alert rule data
   * @returns {Promise}
   */
  updateAlertRule(id, data) {
    return apiClient.put(`/alert-rules/${id}`, data);
  },

  /**
   * Delete an alert rule
   * @param {number} id - Alert rule ID
   * @returns {Promise}
   */
  deleteAlertRule(id) {
    return apiClient.delete(`/alert-rules/${id}`);
  },

  /**
   * Toggle active status of an alert rule
   * @param {number} id - Alert rule ID
   * @returns {Promise}
   */
  toggleAlertRule(id) {
    return apiClient.post(`/alert-rules/${id}/toggle`);
  }
};
