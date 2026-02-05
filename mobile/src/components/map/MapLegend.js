import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme, getDangerColor } from '../../theme';
import { getDangerLevelName } from '../../utils/formatters';

const MapLegend = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('map.legend')}</Text>
      {[1, 2, 3, 4, 5].map((level) => (
        <View key={level} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: getDangerColor(level) }]} />
          <Text style={styles.label}>{getDangerLevelName(level, t)}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.lg,
    padding: 10,
    ...theme.shadows.cardElevated,
  },
  title: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
  },
});

export default MapLegend;
