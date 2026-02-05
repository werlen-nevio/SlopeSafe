import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { alertRulesApi } from '../api/alertRules';
import { notificationsApi } from '../api/notifications';
import {
  registerForPushNotifications,
  addNotificationListener,
  addNotificationResponseListener,
} from '../utils/notifications';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [pushToken, setPushToken] = useState(null);
  const [alertRules, setAlertRules] = useState([]);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigationRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      registerNotifications();
    }

    notificationListener.current = addNotificationListener((notification) => {
      setLastNotification(notification);
    });

    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.resort_slug && navigationRef.current) {
        navigationRef.current.navigate('HomeTab', {
          screen: 'ResortDetail',
          params: { slug: data.resort_slug },
        });
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);

  const setNavigationRef = (ref) => {
    navigationRef.current = ref;
  };

  const registerNotifications = async () => {
    try {
      const token = await registerForPushNotifications();
      setPushToken(token);
    } catch (err) {
      console.error('Failed to register notifications:', err);
    }
  };

  const fetchAlertRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await alertRulesApi.getAll();
      if (response.success) {
        setAlertRules(response.alert_rules || response.data || []);
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch alert rules');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createAlertRule = async (data) => {
    setLoading(true);
    try {
      const response = await alertRulesApi.create(data);
      await fetchAlertRules();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create alert rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAlertRule = async (id, data) => {
    setLoading(true);
    try {
      const response = await alertRulesApi.update(id, data);
      await fetchAlertRules();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update alert rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAlertRule = async (id) => {
    setLoading(true);
    try {
      const response = await alertRulesApi.remove(id);
      setAlertRules((prev) => prev.filter((r) => r.id !== id));
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete alert rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleAlertRule = async (id) => {
    try {
      const response = await alertRulesApi.toggle(id);
      await fetchAlertRules();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle alert rule');
      throw err;
    }
  };

  const fetchNotificationHistory = async (params = {}) => {
    setLoading(true);
    try {
      const response = await notificationsApi.getAll(params);
      if (response.success) {
        setNotificationHistory(response.notifications || response.data || []);
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = () => {
    setLastNotification(null);
  };

  const value = {
    pushToken,
    alertRules,
    notificationHistory,
    loading,
    error,
    lastNotification,
    setNavigationRef,
    registerNotifications,
    fetchAlertRules,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    toggleAlertRule,
    fetchNotificationHistory,
    dismissNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
