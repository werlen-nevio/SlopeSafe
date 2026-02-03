import { defineStore } from 'pinia';
import api from '@/api';

export const useResortsStore = defineStore('resorts', {
  state: () => ({
    resorts: [],
    currentResort: null,
    searchResults: [],
    historicalData: null,
    trendData: null,
    loading: false,
    historicalLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      total: 0,
      perPage: 20,
      lastPage: 1
    }
  }),

  getters: {
    allResorts: (state) => state.resorts,
    getResortBySlug: (state) => (slug) => {
      return state.resorts.find(r => r.slug === slug) || state.currentResort;
    },
    sortedByDanger: (state) => {
      return [...state.resorts].sort((a, b) => (b.danger_level || 0) - (a.danger_level || 0));
    }
  },

  actions: {
    async fetchResorts(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.resorts.getAll(params);
        // Handle Laravel pagination format
        if (response.data) {
          this.resorts = response.data;
          if (response.meta) {
            this.pagination = {
              currentPage: response.meta.current_page,
              total: response.meta.total,
              perPage: response.meta.per_page,
              lastPage: response.meta.last_page
            };
          }
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch resorts';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchResortBySlug(slug) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.resorts.getBySlug(slug);
        // Handle direct data response
        if (response.data || response) {
          this.currentResort = response.data || response;

          // Update in the list if exists
          const index = this.resorts.findIndex(r => r.slug === slug);
          if (index !== -1) {
            this.resorts[index] = response.data || response;
          }
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch resort';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchResorts(query) {
      if (!query || query.trim().length === 0) {
        this.searchResults = [];
        return;
      }

      this.loading = true;
      this.error = null;
      try {
        const response = await api.resorts.search(query);
        // Handle Laravel response format
        if (response.data) {
          this.searchResults = response.data;
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Search failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearSearch() {
      this.searchResults = [];
    },

    clearCurrentResort() {
      this.currentResort = null;
    },

    async fetchHistory(slug, days = 7) {
      this.historicalLoading = true;
      this.error = null;
      try {
        const response = await api.historical.getHistory(slug, days);
        this.historicalData = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch historical data';
        throw error;
      } finally {
        this.historicalLoading = false;
      }
    },

    async fetchTrend(slug) {
      try {
        const response = await api.historical.getTrend(slug);
        this.trendData = response.data;
        return response.data;
      } catch (error) {
        console.error('Failed to fetch trend data:', error);
        return null;
      }
    },

    clearHistoricalData() {
      this.historicalData = null;
      this.trendData = null;
    }
  }
});
