import React, { createContext, useState, useContext } from 'react';
import { favoritesApi } from '../api';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await favoritesApi.getAll();
      if (response.success) {
        setFavorites(response.favorites);
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch favorites';
      setError(errorMessage);
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
        setFavorites(favorites.filter(f => f.id !== resortId));
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
    toggleFavorite
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
