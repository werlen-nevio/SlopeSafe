import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';

const TrendIndicator = ({ trend }) => {
  const { t } = useTranslation();

  const config = {
    increasing: {
      icon: 'trending-up',
      color: theme.colors.danger,
      bg: '#FEE2E2',
      label: t('trend.increasing'),
    },
    decreasing: {
      icon: 'trending-down',
      color: theme.colors.success,
      bg: '#D1FAE5',
      label: t('trend.decreasing'),
    },
    stable: {
      icon: 'remove-outline',
      color: theme.colors.info,
      bg: '#DBEAFE',
      label: t('trend.stable'),
    },
  };

  const c = config[trend] || config.stable;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={14} color={c.color} />
      <Text style={[styles.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default TrendIndicator;
