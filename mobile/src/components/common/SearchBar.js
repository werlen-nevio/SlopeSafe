import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';

const SearchBar = ({ value, onChangeText, placeholder }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={theme.colors.textTertiary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder || t('home.searchPlaceholder')}
        placeholderTextColor={theme.colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder || t('home.searchPlaceholder')}
        accessibilityRole="search"
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton} accessibilityLabel="Clear search" accessibilityRole="button">
          <Ionicons name="close-circle" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.brandWhite,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    height: 48,
    ...theme.shadows.card,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});

export default SearchBar;
