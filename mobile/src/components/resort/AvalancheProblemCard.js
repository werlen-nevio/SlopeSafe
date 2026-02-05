import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import AspectCompass from '../common/AspectCompass';
import { getAvalancheTypeName } from '../../utils/formatters';

const AvalancheProblemCard = ({ problem }) => {
  const { t } = useTranslation();

  const typeName = getAvalancheTypeName(problem.type, t);

  let elevationText = t('elevation.allElevations');
  if (problem.elevation_lower && problem.elevation_upper) {
    elevationText = t('elevation.between', {
      lower: problem.elevation_lower,
      upper: problem.elevation_upper,
    });
  } else if (problem.elevation_lower) {
    elevationText = t('elevation.above', { elevation: problem.elevation_lower });
  } else if (problem.elevation_upper) {
    elevationText = t('elevation.below', { elevation: problem.elevation_upper });
  }

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.type}>{typeName}</Text>
        <Text style={styles.elevation}>{elevationText}</Text>
      </View>
      {problem.aspects && problem.aspects.length > 0 && (
        <AspectCompass aspects={problem.aspects} size={80} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  type: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  elevation: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
  },
});

export default AvalancheProblemCard;
