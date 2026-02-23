import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resortsApi } from '../api';

const CACHE_KEY_RESORTS = '@slopesafe_resorts';
const CACHE_KEY_TIMESTAMP = '@slopesafe_resorts_ts';

const ResortsContext = createContext();

export const ResortsProvider = ({ children }) => {
  const [resorts, setResorts] = useState([]);
  const [currentResort, setCurrentResort] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadCachedResorts();
  }, []);

  const loadCachedResorts = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY_RESORTS);
      if (cached) {
        setResorts(JSON.parse(cached));
      }
    } catch (err) {
      // Silently fail on cache read
    }
  };

  const cacheResorts = async (data) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY_RESORTS, JSON.stringify(data));
      await AsyncStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
    } catch (err) {
      // Silently fail on cache write
    }
  };

  const fetchResorts = async (params = {}) => {
    setLoading(true);
    setError(null);
    setIsOffline(false);
    try {
      const response = await resortsApi.getAll(params);
      if (response.success) {
        setResorts(response.resorts);
        cacheResorts(response.resorts);
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch resorts';
      setError(errorMessage);
      if (!err.response) {
        setIsOffline(true);
        await loadCachedResorts();
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchResortBySlug = async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const response = await resortsApi.getBySlug(slug);
      if (response.success) {
        setCurrentResort(response.resort);
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch resort';
      setError(errorMessage);
      if (!err.response) {
        setIsOffline(true);
        const cached = resorts.find((r) => r.slug === slug);
        if (cached) {
          setCurrentResort(cached);
          return { success: true, resort: cached };
        }
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchResorts = async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setError(null);
    try {
      const response = await resortsApi.search(query);
      if (response.success) {
        setSearchResults(response.resorts);
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Search failed';
      setError(errorMessage);
      if (!err.response) {
        const lowerQuery = query.toLowerCase();
        const localResults = resorts.filter(
          (r) =>
            r.name?.toLowerCase().includes(lowerQuery) ||
            r.canton?.toLowerCase().includes(lowerQuery)
        );
        setSearchResults(localResults);
        return { success: true, resorts: localResults };
      }
      throw err;
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
  };

  const value = {
    resorts,
    currentResort,
    searchResults,
    loading,
    searchLoading,
    error,
    isOffline,
    fetchResorts,
    fetchResortBySlug,
    searchResorts,
    clearSearch,
  };

  return <ResortsContext.Provider value={value}>{children}</ResortsContext.Provider>;
};

export const useResorts = () => {
  const context = useContext(ResortsContext);
  if (!context) {
    throw new Error('useResorts must be used within a ResortsProvider');
  }
  return context;
};
