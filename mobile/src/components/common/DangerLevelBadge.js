import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme, getDangerColor, getDangerTextColor } from '../../theme';
import { getDangerLevelName } from '../../utils/formatters';

const DangerLevelBadge = ({ level, compact = false, size = 'medium' }) => {
  const { t } = useTranslation();

  if (!level || level < 1 || level > 5) {
    if (compact) {
      return (
        <View style={[styles.compactDot, { backgroundColor: '#E0E0E0' }]} />
      );
    }
    return (
      <View style={[styles.badge, styles.unknown]}>
        <Text style={styles.unknownText}>{t('danger.unknown')}</Text>
      </View>
    );
  }

  const backgroundColor = getDangerColor(level);
  const textColor = getDangerTextColor(level);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={[styles.compactDot, { backgroundColor }]} />
      </View>
    );
  }

  const sizeStyles = size === 'large' ? styles.badgeLarge : styles.badge;
  const circleSizeStyles = size === 'large' ? styles.levelCircleLarge : styles.levelCircle;
  const numberSizeStyles = size === 'large' ? styles.levelNumberLarge : styles.levelNumber;
  const nameSizeStyles = size === 'large' ? styles.levelNameLarge : styles.levelName;

  return (
    <View
      style={[sizeStyles, { backgroundColor }]}
      accessibilityRole="text"
      accessibilityLabel={`${t('danger.level')} ${level}: ${getDangerLevelName(level, t)}`}
    >
      <View style={circleSizeStyles}>
        <Text style={[numberSizeStyles, { color: textColor }]}>{level}</Text>
      </View>
      <Text style={[nameSizeStyles, { color: textColor }]}>
        {getDangerLevelName(level, t)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
  },
  badgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
    gap: 12,
  },
  unknown: {
    backgroundColor: '#E0E0E0',
  },
  unknownText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_600SemiBold',
    color: '#666666',
  },
  levelCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelCircleLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_700Bold',
  },
  levelNumberLarge: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: 'Inter_700Bold',
  },
  levelName: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelNameLarge: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactContainer: {
    alignItems: 'center',
  },
  compactDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DangerLevelBadge;
