import { defineStore } from 'pinia';
import api from '@/api';

export const useRunStatusStore = defineStore('runStatus', {
  state: () => ({
    runStatusData: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasRunStatusData: (state) => state.runStatusData !== null,
    totalRuns: (state) => state.runStatusData?.status?.total_runs || 0,
    openRuns: (state) => state.runStatusData?.status?.open_runs || 0,
    runsPercentage: (state) => state.runStatusData?.status?.runs_percentage || 0,
    totalLifts: (state) => state.runStatusData?.status?.total_lifts || 0,
    openLifts: (state) => state.runStatusData?.status?.open_lifts || 0,
    liftsPercentage: (state) => state.runStatusData?.status?.lifts_percentage || 0,
    runDetails: (state) => state.runStatusData?.status?.run_details || [],
    liftDetails: (state) => state.runStatusData?.status?.lift_details || [],
  },

  actions: {
    async fetchRunStatus(slug) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.runStatus.getRunStatus(slug);
        this.runStatusData = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch run status';
        console.error('Failed to fetch run status:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateRunStatus(slug, data) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.runStatus.updateRunStatus(slug, data);
        this.runStatusData = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update run status';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearRunStatus() {
      this.runStatusData = null;
      this.error = null;
    }
  }
});
