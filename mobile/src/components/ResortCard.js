import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import DangerLevelBadge from './common/DangerLevelBadge';
import { theme } from '../theme';
import { formatRelativeDate, formatElevation } from '../utils/formatters';

const ResortCard = ({ resort, onPress }) => {
  const { t } = useTranslation();

  const initial = resort.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${resort.name}, ${resort.canton}, ${t('danger.level')} ${resort.danger_level || '?'}`}
    >
      <View style={styles.header}>
        <View style={styles.identity}>
          {resort.logo_url ? (
            <Image source={{ uri: resort.logo_url }} style={styles.logo} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoInitial}>{initial}</Text>
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{resort.name}</Text>
            <Text style={styles.canton}>{resort.canton}</Text>
          </View>
        </View>
        <DangerLevelBadge level={resort.danger_level} compact />
      </View>

      <View style={styles.body}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('resort.elevation')}</Text>
          <Text style={styles.value}>{formatElevation(resort.elevation_min, resort.elevation_max)}</Text>
        </View>
      </View>

      {resort.last_updated && (
        <Text style={styles.updated}>
          {t('resort.lastUpdated')}: {formatRelativeDate(resort.last_updated)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.brandWhite,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  logoFallback: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.brandNavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_700Bold',
    color: theme.colors.brandWhite,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
  },
  canton: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  body: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textPrimary,
  },
  updated: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textTertiary,
    textAlign: 'right',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ResortCard;
