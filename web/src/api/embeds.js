import apiClient from './client';

export default {
  /**
   * Get widget HTML/JSON for a resort
   * @param {string} slug - Resort slug
   * @param {Object} options - Widget options (lang, theme, format, config_key)
   * @returns {Promise}
   */
  getWidget(slug, options = {}) {
    return apiClient.get(`/embed/${slug}/widget`, { params: options });
  },

  /**
   * Get fullscreen dashboard HTML for a resort
   * @param {string} slug - Resort slug
   * @param {Object} options - Dashboard options (lang, theme, auto_rotate, config_key)
   * @returns {Promise}
   */
  getFullscreen(slug, options = {}) {
    return apiClient.get(`/embed/${slug}/fullscreen`, { params: options });
  },

  /**
   * Get QR code data for a resort
   * @param {string} slug - Resort slug
   * @param {string} url - Optional URL to encode in QR code
   * @returns {Promise}
   */
  getQRCode(slug, url = null) {
    const params = url ? { url } : {};
    return apiClient.get(`/embed/${slug}/qr`, { params });
  },

  /**
   * Get iframe embed code for a resort
   * @param {string} slug - Resort slug
   * @param {Object} options - Embed options (type, theme, lang)
   * @returns {Promise}
   */
  getIframeCode(slug, options = {}) {
    return apiClient.get(`/embed/${slug}/iframe-code`, { params: options });
  },
};
