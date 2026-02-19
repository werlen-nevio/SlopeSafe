import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../contexts/NotificationContext';
import { useResorts } from '../contexts/ResortsContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { theme } from '../theme';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const AlertRuleFormScreen = ({ route, navigation }) => {
  const existingRule = route.params?.rule;
  const { createAlertRule, updateAlertRule } = useNotifications();
  const { resorts, fetchResorts } = useResorts();
  const { favorites } = useFavorites();
  const { t } = useTranslation();

  const [resortId, setResortId] = useState(existingRule?.ski_resort_id || null);
  const [onIncrease, setOnIncrease] = useState(existingRule?.on_increase ?? true);
  const [onDecrease, setOnDecrease] = useState(existingRule?.on_decrease ?? false);
  const [minLevel, setMinLevel] = useState(existingRule?.min_danger_level || 1);
  const [maxLevel, setMaxLevel] = useState(existingRule?.max_danger_level || 5);
  const [dailyReminder, setDailyReminder] = useState(existingRule?.daily_reminder_enabled ?? false);
  const [activeDays, setActiveDays] = useState(existingRule?.active_days || DAYS);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (resorts.length === 0) fetchResorts();
  }, []);

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  const filteredResorts = useMemo(() => {
    const query = search.toLowerCase().trim();
    const matched = query
      ? resorts.filter((r) => r.name.toLowerCase().includes(query))
      : resorts;
    const favs = matched.filter((r) => favoriteIds.has(r.id));
    const rest = matched.filter((r) => !favoriteIds.has(r.id));
    return [...favs, ...rest];
  }, [resorts, favorites, favoriteIds, search]);

  const toggleDay = (day) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ski_resort_id: resortId,
      on_increase: onIncrease,
      on_decrease: onDecrease,
      min_danger_level: minLevel,
      max_danger_level: maxLevel,
      daily_reminder_enabled: dailyReminder,
      daily_reminder_time: dailyReminder ? '08:00' : null,
      active_days: activeDays,
      is_active: true,
    };

    try {
      if (existingRule) {
        await updateAlertRule(existingRule.id, data);
      } else {
        await createAlertRule(data);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('notifications.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Resort selector */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('notifications.resort')}</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color={theme.colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={theme.colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.option, !resortId && styles.optionActive]}
          onPress={() => setResortId(null)}
        >
          <Text style={[styles.optionText, !resortId && styles.optionTextActive]}>
            {t('notifications.allResorts')}
          </Text>
        </TouchableOpacity>
        <ScrollView style={styles.resortList} nestedScrollEnabled>
          {filteredResorts.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.resortRow, resortId === r.id && styles.resortRowActive]}
              onPress={() => setResortId(r.id)}
            >
              {favoriteIds.has(r.id) && (
                <Ionicons name="star" size={14} color={resortId === r.id ? theme.colors.brandWhite : theme.colors.brandOrange} />
              )}
              <Text
                style={[styles.resortRowText, resortId === r.id && styles.resortRowTextActive]}
                numberOfLines={1}
              >
                {r.name}
              </Text>
            </TouchableOpacity>
          ))}
          {filteredResorts.length === 0 && search.length > 0 && (
            <Text style={styles.noResults}>{t('common.noResults')}</Text>
          )}
        </ScrollView>
      </View>

      {/* Triggers */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('notifications.triggers')}</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('notifications.onIncrease')}</Text>
          <Switch
            value={onIncrease}
            onValueChange={setOnIncrease}
            trackColor={{ false: theme.colors.border, true: theme.colors.brandSkyBlue }}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('notifications.onDecrease')}</Text>
          <Switch
            value={onDecrease}
            onValueChange={setOnDecrease}
            trackColor={{ false: theme.colors.border, true: theme.colors.brandSkyBlue }}
          />
        </View>
      </View>

      {/* Danger level range */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('map.dangerLevel')}</Text>
        <View style={styles.levelRow}>
          <Text style={styles.switchLabel}>{t('notifications.minDangerLevel')}</Text>
          <View style={styles.levelPicker}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.levelBtn, minLevel === level && styles.levelBtnActive]}
                onPress={() => setMinLevel(level)}
              >
                <Text style={[styles.levelBtnText, minLevel === level && styles.levelBtnTextActive]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.switchLabel}>{t('notifications.maxDangerLevel')}</Text>
          <View style={styles.levelPicker}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.levelBtn, maxLevel === level && styles.levelBtnActive]}
                onPress={() => setMaxLevel(level)}
              >
                <Text style={[styles.levelBtnText, maxLevel === level && styles.levelBtnTextActive]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Daily reminder */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('notifications.dailyReminder')}</Text>
          <Switch
            value={dailyReminder}
            onValueChange={setDailyReminder}
            trackColor={{ false: theme.colors.border, true: theme.colors.brandSkyBlue }}
          />
        </View>
        {dailyReminder && (
          <>
            <Text style={styles.subLabel}>{t('notifications.activeDays')}</Text>
            <View style={styles.daysRow}>
              {DAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayBtn, activeDays.includes(day) && styles.dayBtnActive]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayBtnText, activeDays.includes(day) && styles.dayBtnTextActive]}>
                    {t(`days.${day}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? t('common.saving') : existingRule ? t('common.update') : t('common.create')}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
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
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.card,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 10,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textPrimary,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 6,
  },
  optionActive: {
    backgroundColor: theme.colors.brandNavy,
    borderColor: theme.colors.brandNavy,
  },
  optionText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textSecondary,
  },
  optionTextActive: {
    color: theme.colors.brandWhite,
  },
  resortList: {
    maxHeight: 200,
  },
  resortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 6,
  },
  resortRowActive: {
    backgroundColor: theme.colors.brandNavy,
    borderColor: theme.colors.brandNavy,
  },
  resortRowText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textSecondary,
  },
  resortRowTextActive: {
    color: theme.colors.brandWhite,
  },
  noResults: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textPrimary,
  },
  subLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  levelRow: {
    marginBottom: 8,
  },
  levelPicker: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  levelBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  levelBtnActive: {
    backgroundColor: theme.colors.brandNavy,
    borderColor: theme.colors.brandNavy,
  },
  levelBtnText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textSecondary,
  },
  levelBtnTextActive: {
    color: theme.colors.brandWhite,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayBtnActive: {
    backgroundColor: theme.colors.brandNavy,
    borderColor: theme.colors.brandNavy,
  },
  dayBtnText: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textSecondary,
  },
  dayBtnTextActive: {
    color: theme.colors.brandWhite,
  },
  saveButton: {
    backgroundColor: theme.colors.brandOrange,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.brandWhite,
  },
});

export default AlertRuleFormScreen;
