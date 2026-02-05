import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

const EmptyState = ({ icon = 'folder-open-outline', title, message, actionLabel, onAction }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={theme.colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: theme.colors.brandOrange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
  },
  buttonText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.brandWhite,
  },
});

export default EmptyState;
