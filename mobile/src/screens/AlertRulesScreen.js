import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../contexts/NotificationContext';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { theme } from '../theme';

const AlertRulesScreen = ({ navigation }) => {
  const { alertRules, loading, fetchAlertRules, toggleAlertRule, deleteAlertRule } = useNotifications();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAlertRules();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAlertRules();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleDelete = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      t('notifications.deleteRule'),
      t('notifications.deleteRuleConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deleteAlertRule(id) },
      ]
    );
  };

  const renderRule = ({ item }) => (
    <View style={styles.ruleCard}>
      <View style={styles.ruleHeader}>
        <Text style={styles.ruleName}>
          {item.ski_resort?.name || t('notifications.allResorts')}
        </Text>
        <Switch
          value={item.is_active}
          onValueChange={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleAlertRule(item.id);
          }}
          trackColor={{ false: theme.colors.border, true: theme.colors.brandSkyBlue }}
          thumbColor={item.is_active ? theme.colors.brandNavy : theme.colors.textTertiary}
        />
      </View>

      <View style={styles.ruleDetails}>
        {item.on_increase && (
          <View style={styles.tag}>
            <Ionicons name="trending-up" size={12} color={theme.colors.danger} />
            <Text style={styles.tagText}>{t('notifications.onIncrease')}</Text>
          </View>
        )}
        {item.on_decrease && (
          <View style={styles.tag}>
            <Ionicons name="trending-down" size={12} color={theme.colors.success} />
            <Text style={styles.tagText}>{t('notifications.onDecrease')}</Text>
          </View>
        )}
        {item.daily_reminder_enabled && (
          <View style={styles.tag}>
            <Ionicons name="time-outline" size={12} color={theme.colors.info} />
            <Text style={styles.tagText}>{item.daily_reminder_time}</Text>
          </View>
        )}
      </View>

      <View style={styles.ruleActions}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AlertRuleForm', { rule: item })}
          style={styles.editBtn}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && alertRules.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={alertRules}
        renderItem={renderRule}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brandNavy} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title={t('notifications.noRules')}
          />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AlertRuleForm', {})}
        accessibilityRole="button"
        accessibilityLabel={t('notifications.createRule')}
      >
        <Ionicons name="add" size={28} color={theme.colors.brandWhite} />
      </TouchableOpacity>
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
    paddingBottom: 80,
  },
  ruleCard: {
    backgroundColor: theme.colors.brandWhite,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginBottom: 10,
    ...theme.shadows.card,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleName: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  ruleDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
  },
  ruleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 8,
  },
  editBtn: {
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.brandOrange,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.cardElevated,
  },
});

export default AlertRulesScreen;
