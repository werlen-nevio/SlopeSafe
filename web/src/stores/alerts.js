import { defineStore } from 'pinia';
import alertsApi from '../api/alerts';

export const useAlertsStore = defineStore('alerts', {
  state: () => ({
    alertRules: [],
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Get all active alert rules
     */
    activeRules: (state) => {
      return state.alertRules.filter(rule => rule.is_active);
    },

    /**
     * Get all inactive alert rules
     */
    inactiveRules: (state) => {
      return state.alertRules.filter(rule => !rule.is_active);
    },

    /**
     * Get rules for a specific resort
     */
    rulesForResort: (state) => (resortId) => {
      return state.alertRules.filter(rule => rule.ski_resort_id === resortId);
    },

    /**
     * Get rules that apply to all resorts
     */
    globalRules: (state) => {
      return state.alertRules.filter(rule => rule.applies_to_all_resorts);
    },

    /**
     * Get rules with daily reminders enabled
     */
    dailyReminderRules: (state) => {
      return state.alertRules.filter(rule => rule.daily_reminder_enabled);
    },

    /**
     * Count of active rules
     */
    activeRuleCount: (state) => {
      return state.alertRules.filter(rule => rule.is_active).length;
    },
  },

  actions: {
    /**
     * Fetch all alert rules for the authenticated user
     */
    async fetchAlertRules() {
      this.loading = true;
      this.error = null;

      try {
        const response = await alertsApi.getAlertRules();
        this.alertRules = response.data.rules || [];
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load alert rules';
        console.error('Error fetching alert rules:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Create a new alert rule
     */
    async createAlertRule(ruleData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await alertsApi.createAlertRule(ruleData);

        // Add the new rule to the state
        if (response.data.rule) {
          this.alertRules.push(response.data.rule);
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create alert rule';
        console.error('Error creating alert rule:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update an existing alert rule
     */
    async updateAlertRule(id, ruleData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await alertsApi.updateAlertRule(id, ruleData);

        // Update the rule in state
        if (response.data.rule) {
          const index = this.alertRules.findIndex(r => r.id === id);
          if (index !== -1) {
            this.alertRules[index] = response.data.rule;
          }
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update alert rule';
        console.error('Error updating alert rule:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete an alert rule
     */
    async deleteAlertRule(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await alertsApi.deleteAlertRule(id);

        // Remove the rule from state
        this.alertRules = this.alertRules.filter(r => r.id !== id);

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete alert rule';
        console.error('Error deleting alert rule:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Toggle active status of an alert rule
     */
    async toggleAlertRule(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await alertsApi.toggleAlertRule(id);

        // Update the rule in state
        if (response.data.rule) {
          const index = this.alertRules.findIndex(r => r.id === id);
          if (index !== -1) {
            this.alertRules[index] = response.data.rule;
          }
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to toggle alert rule';
        console.error('Error toggling alert rule:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null;
    },
  },
});
