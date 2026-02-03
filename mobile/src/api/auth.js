import apiClient from './client';

export const authApi = {
  async register(data) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async getUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async updateDeviceToken(deviceToken) {
    const response = await apiClient.post('/auth/device-token', { device_token: deviceToken });
    return response.data;
  },

  async updateNotificationPreferences(preferences) {
    const response = await apiClient.put('/auth/notifications/preferences', preferences);
    return response.data;
  }
};
