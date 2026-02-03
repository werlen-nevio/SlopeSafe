import { defineStore } from 'pinia';
import api from '@/api';

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: [],
    loading: false,
    error: null
  }),

  getters: {
    allFavorites: (state) => state.favorites,
    isFavorite: (state) => (resortId) => {
      return state.favorites.some(f => f.id === resortId);
    },
    favoriteCount: (state) => state.favorites.length
  },

  actions: {
    async fetchFavorites() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.favorites.getAll();
        if (response.success) {
          this.favorites = response.favorites;
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch favorites';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addFavorite(resortId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.favorites.add(resortId);
        if (response.success) {
          // Refresh favorites list
          await this.fetchFavorites();
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add favorite';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async removeFavorite(resortId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.favorites.remove(resortId);
        if (response.success) {
          // Remove from local state
          this.favorites = this.favorites.filter(f => f.id !== resortId);
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to remove favorite';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async toggleFavorite(resortId) {
      if (this.isFavorite(resortId)) {
        return await this.removeFavorite(resortId);
      } else {
        return await this.addFavorite(resortId);
      }
    }
  }
});
