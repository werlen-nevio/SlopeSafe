import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../constants/config';
import { theme } from '../theme';

const LanguagePickerScreen = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {LANGUAGES.map((lang, index) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.item, index < LANGUAGES.length - 1 && styles.itemBorder]}
            onPress={() => handleSelect(lang.code)}
          >
            <Text style={styles.label}>{lang.name}</Text>
            {currentLang === lang.code && (
              <Ionicons name="checkmark-circle" size={22} color={theme.colors.brandSkyBlue} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.brandWhite,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.card,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  label: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textPrimary,
  },
});

export default LanguagePickerScreen;
