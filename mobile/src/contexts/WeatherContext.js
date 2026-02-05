import React, { createContext, useState, useContext } from 'react';
import { weatherApi } from '../api/weather';

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const response = await weatherApi.getWeather(slug);
      if (response.success) {
        setWeatherData(response.weather);
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch weather';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearWeather = () => {
    setWeatherData(null);
    setError(null);
  };

  const value = {
    weatherData,
    loading,
    error,
    fetchWeather,
    clearWeather,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
