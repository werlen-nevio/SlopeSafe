import { defineStore } from 'pinia';
import api from '@/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: !!localStorage.getItem('auth_token'),
    loading: false,
    error: null
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && !!state.token
  },

  actions: {
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.auth.register(userData);
        if (response.success) {
          this.token = response.token;
          this.user = response.user;
          this.isAuthenticated = true;
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.auth.login(credentials);
        if (response.success) {
          this.token = response.token;
          this.user = response.user;
          this.isAuthenticated = true;
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await api.auth.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    },

    async fetchUser() {
      if (!this.token) return;

      this.loading = true;
      try {
        const response = await api.auth.getUser();
        if (response.success) {
          this.user = response.user;
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        if (error.response?.status === 401) {
          this.logout();
        }
      } finally {
        this.loading = false;
      }
    },

    async updateNotificationPreferences(preferences) {
      try {
        const response = await api.auth.updateNotificationPreferences(preferences);
        if (response.success && this.user) {
          this.user = { ...this.user, ...response.user };
          localStorage.setItem('user', JSON.stringify(this.user));
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update preferences';
        throw error;
      }
    },

    initializeFromStorage() {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        this.token = token;
        this.user = JSON.parse(userStr);
        this.isAuthenticated = true;
      }
    }
  }
});
