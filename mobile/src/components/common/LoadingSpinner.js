import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';

const LoadingSpinner = ({ message, size = 'large' }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.colors.brandNavy} />
      {message !== false && (
        <Text style={styles.text}>{message || t('common.loading')}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  text: {
    marginTop: 12,
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
  },
});

export default LoadingSpinner;
