import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';

const SORT_OPTIONS = [
  { key: 'distance', icon: 'navigate-outline', labelKey: 'home.sortByDistance' },
  { key: 'name', icon: 'text-outline', labelKey: 'home.sortByName' },
  { key: 'danger', icon: 'warning-outline', labelKey: 'home.sortByDanger' },
  { key: 'canton', icon: 'location-outline', labelKey: 'home.sortByCanton' },
];

const SortSelector = ({ activeSort, onSortChange }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('home.sortBy')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
        {SORT_OPTIONS.map((option) => {
          const isActive = activeSort === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.option, isActive && styles.optionActive]}
              onPress={() => onSortChange(option.key)}
            >
              <Ionicons
                name={option.icon}
                size={14}
                color={isActive ? theme.colors.brandWhite : theme.colors.textSecondary}
              />
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                {t(option.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textSecondary,
    marginRight: 10,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  optionActive: {
    backgroundColor: theme.colors.brandNavy,
    borderColor: theme.colors.brandNavy,
  },
  optionText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textSecondary,
  },
  optionTextActive: {
    color: theme.colors.brandWhite,
  },
});

export default SortSelector;
