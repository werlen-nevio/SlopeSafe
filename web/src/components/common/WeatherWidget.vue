<template>
  <div class="weather-widget">
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="weatherData" class="weather-content">
      <!-- Current Weather -->
      <div class="current-weather">
        <div class="weather-header">
          <h3>{{ $t('weather.current', 'Current Weather') }}</h3>
          <span v-if="lastUpdated" class="last-updated">
            {{ $t('weather.updated') }}: {{ formatTime(lastUpdated) }}
          </span>
        </div>

        <div class="current-details">
          <div class="temperature-main">
            <span class="weather-icon">{{ getWeatherIcon(weatherData.current.condition) }}</span>
            <span class="temp-value">{{ Math.round(weatherData.current.temperature) }}°C</span>
          </div>

          <div class="condition">
            {{ $t(`weather.conditions.${weatherData.current.condition}`, weatherData.current.condition) }}
          </div>

          <div class="temp-range">
            <span class="temp-min">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              {{ Math.round(weatherData.current.temperature_min) }}°
            </span>
            <span class="temp-max">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              {{ Math.round(weatherData.current.temperature_max) }}°
            </span>
          </div>
        </div>

        <div class="weather-details-grid">
          <div v-if="weatherData.snow?.depth_cm !== null" class="detail-item">
            <span class="detail-icon">❄️</span>
            <div class="detail-text">
              <span class="detail-label">{{ $t('weather.snowDepth', 'Snow Depth') }}</span>
              <span class="detail-value">{{ weatherData.snow.depth_cm }} cm</span>
            </div>
          </div>

          <div v-if="weatherData.snow?.new_snow_24h_cm !== null" class="detail-item">
            <span class="detail-icon">🌨️</span>
            <div class="detail-text">
              <span class="detail-label">{{ $t('weather.newSnow24h', 'New Snow 24h') }}</span>
              <span class="detail-value">{{ weatherData.snow.new_snow_24h_cm }} cm</span>
            </div>
          </div>

          <div v-if="weatherData.current.wind_speed_kmh !== null" class="detail-item">
            <span class="detail-icon"> </span>
            <div class="detail-text">
              <span class="detail-label">{{ $t('weather.wind', 'Wind') }}</span>
              <span class="detail-value">{{ Math.round(weatherData.current.wind_speed_kmh) }} km/h</span>
            </div>
          </div>

          <div v-if="weatherData.current.visibility_km !== null" class="detail-item">
            <span class="detail-icon"> </span>
            <div class="detail-text">
              <span class="detail-label">{{ $t('weather.visibility', 'Visibility') }}</span>
              <span class="detail-value">{{ Math.round(weatherData.current.visibility_km) }} km</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Forecast -->
      <div v-if="weatherData.forecast && weatherData.forecast.length > 0" class="forecast">
        <h4>{{ $t('weather.forecast', '5-Day Forecast') }}</h4>
        <div class="forecast-list">
          <div
            v-for="(day, index) in weatherData.forecast"
            :key="index"
            class="forecast-item"
          >
            <div class="forecast-date">{{ formatForecastDate(day.date) }}</div>
            <div class="forecast-icon">{{ getWeatherIcon(day.condition) }}</div>
            <div class="forecast-temps">
              <span class="forecast-temp-max">{{ Math.round(day.temp_max) }}°</span>
              <span class="forecast-temp-min">{{ Math.round(day.temp_min) }}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, parseISO } from 'date-fns';

const props = defineProps({
  weatherData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const { t } = useI18n();

const lastUpdated = computed(() => props.weatherData?.last_updated || null);

const getWeatherIcon = (condition) => {
  const icons = {
    clear: '☀️',
    clouds: '☁️',
    rain: '🌧️',
    drizzle: '🌦️',
    thunderstorm: '⛈️',
    snow: '🌨️',
    mist: '🌫️',
    fog: '🌫️',
    haze: '🌫️',
    unknown: '🌤️'
  };
  return icons[condition?.toLowerCase()] || icons.unknown;
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = parseISO(isoString);
    return format(date, 'HH:mm');
  } catch {
    return '';
  }
};

const formatForecastDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return t('weather.today', 'Today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('weather.tomorrow', 'Tomorrow');
    }
    return format(date, 'EEE');
  } catch {
    return '';
  }
};
</script>

<style scoped>
.weather-widget {
  background: var(--card-background);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
  min-width: 0;
  overflow: hidden;
}

.loading,
.error {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-danger);
}

.weather-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.current-weather {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.weather-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.last-updated {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.current-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.temperature-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.weather-icon {
  font-size: 3rem;
}

.temp-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.condition {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.temp-range {
  display: flex;
  gap: var(--spacing-lg);
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.temp-min,
.temp-max {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.temp-min .icon {
  width: 16px;
  height: 16px;
  color: var(--color-info);
}

.temp-max .icon {
  width: 16px;
  height: 16px;
  color: var(--color-danger);
}

.weather-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.detail-item:hover {
  background: var(--color-background-tertiary);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.detail-icon {
  font-size: 1.5rem;
}

.detail-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.forecast {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.forecast h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-primary);
}

.forecast-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
}

.forecast-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
  flex: 1 1 calc(20% - var(--spacing-sm));
  min-width: 60px;
  max-width: 120px;
}

.forecast-item:hover {
  background: var(--color-background-tertiary);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.forecast-date {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.forecast-icon {
  font-size: 2rem;
}

.forecast-temps {
  display: flex;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
}

.forecast-temp-max {
  font-weight: 600;
  color: var(--color-text-primary);
}

.forecast-temp-min {
  color: var(--color-text-tertiary);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .weather-widget {
    padding: var(--spacing-lg);
  }

  .temperature-main {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .temp-value {
    font-size: 2.5rem;
  }

  .weather-icon {
    font-size: 2.5rem;
  }

  .weather-details-grid {
    grid-template-columns: 1fr;
  }

  .forecast-item {
    flex: 1 1 calc(20% - var(--spacing-sm));
    min-width: 55px;
    max-width: none;
  }
}

@media (max-width: 360px) {
  .weather-widget {
    padding: var(--spacing-md);
  }

  .weather-header h3 {
    font-size: 1.25rem;
  }

  .temp-value {
    font-size: 2rem;
  }

  .weather-icon {
    font-size: 2rem;
  }

  .current-details {
    padding: var(--spacing-sm);
  }

  .forecast-list {
    gap: var(--spacing-xs);
  }

  .forecast-item {
    padding: var(--spacing-sm);
    min-width: 50px;
  }

  .forecast-icon {
    font-size: 1.5rem;
  }

  .detail-item {
    padding: var(--spacing-sm);
  }

  .forecast h4 {
    font-size: 1rem;
  }
}
</style>
