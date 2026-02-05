import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favoritesApi } from '../api';

const CACHE_KEY_FAVORITES = '@slopesafe_favorites';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCachedFavorites();
  }, []);

  const loadCachedFavorites = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY_FAVORITES);
      if (cached) {
        setFavorites(JSON.parse(cached));
      }
    } catch (err) {
      // Silently fail
    }
  };

  const cacheFavorites = async (data) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY_FAVORITES, JSON.stringify(data));
    } catch (err) {
      // Silently fail
    }
  };

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await favoritesApi.getAll();
      if (response.success) {
        setFavorites(response.favorites);
        cacheFavorites(response.favorites);
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch favorites';
      setError(errorMessage);
      if (!err.response) {
        await loadCachedFavorites();
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (resortId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await favoritesApi.add(resortId);
      if (response.success) {
        await fetchFavorites();
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add favorite';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (resortId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await favoritesApi.remove(resortId);
      if (response.success) {
        const updated = favorites.filter(f => f.id !== resortId);
        setFavorites(updated);
        cacheFavorites(updated);
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove favorite';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (resortId) => {
    return favorites.some(f => f.id === resortId);
  };

  const toggleFavorite = async (resortId) => {
    if (isFavorite(resortId)) {
      return await removeFavorite(resortId);
    } else {
      return await addFavorite(resortId);
    }
  };

  const value = {
    favorites,
    loading,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
