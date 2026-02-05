import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme, getWeatherIcon } from '../../theme';
import { formatDayLabel } from '../../utils/formatters';

const WeatherWidget = ({ weather }) => {
  const { t } = useTranslation();

  if (!weather) return null;

  const conditionIcon = getWeatherIcon(weather.condition);
  const conditionText = t(`weather.conditions.${weather.condition}`, t('weather.conditions.unknown'));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('weather.current')}</Text>

      <View style={styles.currentWeather}>
        <View style={styles.mainTemp}>
          <Text style={styles.weatherIcon}>{conditionIcon}</Text>
          <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
          <Text style={styles.condition}>{conditionText}</Text>
        </View>
        {weather.temperature_min != null && weather.temperature_max != null && (
          <Text style={styles.tempRange}>
            {Math.round(weather.temperature_min)}° / {Math.round(weather.temperature_max)}°
          </Text>
        )}
      </View>

      <View style={styles.detailsGrid}>
        <DetailItem label={t('weather.wind')} value={weather.wind_speed != null ? `${weather.wind_speed} km/h` : '-'} />
        <DetailItem label={t('weather.visibility')} value={weather.visibility != null ? `${weather.visibility} km` : '-'} />
      </View>

      {weather.forecast && weather.forecast.length > 0 && (
        <>
          <Text style={styles.forecastTitle}>{t('weather.forecast')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastRow}>
            {weather.forecast.map((day, index) => (
              <View key={index} style={styles.forecastDay}>
                <Text style={styles.forecastDate}>{formatDayLabel(day.date, t)}</Text>
                <Text style={styles.forecastIcon}>{getWeatherIcon(day.condition)}</Text>
                <Text style={styles.forecastTemp}>
                  {Math.round(day.temperature_max)}°
                </Text>
                <Text style={styles.forecastTempLow}>
                  {Math.round(day.temperature_min)}°
                </Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const DetailItem = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.brandWhite,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    ...theme.shadows.card,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  currentWeather: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  mainTemp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherIcon: {
    fontSize: 32,
  },
  temperature: {
    fontSize: theme.typography.sizes['3xl'],
    fontFamily: 'Inter_700Bold',
    color: theme.colors.textPrimary,
  },
  condition: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textSecondary,
  },
  tempRange: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textTertiary,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 12,
  },
  detailItem: {
    width: '50%',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textTertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
  },
  forecastTitle: {
    fontSize: theme.typography.sizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 10,
  },
  forecastRow: {
    gap: 10,
    paddingRight: 8,
  },
  forecastDay: {
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: 10,
    minWidth: 64,
  },
  forecastDate: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_500Medium',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  forecastIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: 'Inter_600SemiBold',
    color: theme.colors.textPrimary,
  },
  forecastTempLow: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.textTertiary,
  },
});

export default WeatherWidget;
