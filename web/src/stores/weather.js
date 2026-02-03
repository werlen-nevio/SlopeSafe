import { defineStore } from 'pinia';
import api from '@/api';

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    weatherData: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasWeatherData: (state) => state.weatherData !== null,
    currentTemperature: (state) => state.weatherData?.current?.temperature,
    weatherCondition: (state) => state.weatherData?.current?.condition,
    forecast: (state) => state.weatherData?.forecast || [],
  },

  actions: {
    async fetchWeather(slug) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.weather.getWeather(slug);
        this.weatherData = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch weather data';
        console.error('Failed to fetch weather:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    clearWeather() {
      this.weatherData = null;
      this.error = null;
    }
  }
});
