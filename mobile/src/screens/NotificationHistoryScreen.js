import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../contexts/NotificationContext';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { theme } from '../theme';
import { formatRelativeDate } from '../utils/formatters';

const NotificationHistoryScreen = () => {
  const { notificationHistory, loading, fetchNotificationHistory } = useNotifications();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotificationHistory();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchNotificationHistory();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'danger_increase':
        return { name: 'trending-up', color: theme.colors.danger };
      case 'danger_decrease':
        return { name: 'trending-down', color: theme.colors.success };
      case 'daily_reminder':
        return { name: 'time-outline', color: theme.colors.info };
      default:
        return { name: 'notifications-outline', color: theme.colors.textSecondary };
    }
  };

  const renderItem = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    return (
      <View style={styles.item}>
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          {item.resort?.name && (
            <Text style={styles.resort}>{item.resort.name}</Text>
          )}
          <Text style={styles.time}>{formatRelativeDate(item.sent_at || item.created_at)}</Text>
        </View>
      </View>
    );
  };

  if (loading && notificationHistory.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notificationHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brandNavy} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title={t('notifications.noNotifications')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  listContainer: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: theme.colors.brandWhite,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    ...theme.shadows.card,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textPrimary,
  },
  resort: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  time: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textTertiary,
    marginTop: 4,
  },
});

export default NotificationHistoryScreen;
