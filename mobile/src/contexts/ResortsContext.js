import React, { createContext, useState, useContext } from 'react';
import { resortsApi } from '../api';

const ResortsContext = createContext();

export const ResortsProvider = ({ children }) => {
  const [resorts, setResorts] = useState([]);
  const [currentResort, setCurrentResort] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResorts = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await resortsApi.getAll(params);
      if (response.success) {
        setResorts(response.resorts);
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch resorts';
      setError(errorMessage);
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

    setLoading(true);
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
      throw err;
    } finally {
      setLoading(false);
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
    error,
    fetchResorts,
    fetchResortBySlug,
    searchResorts,
    clearSearch
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
