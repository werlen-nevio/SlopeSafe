<template>
  <div class="resort-detail-view">
    <div class="container">
      <div v-if="loading" class="loading">
        {{ $t('common.loading') }}...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
        <router-link to="/" class="back-link">{{ $t('common.backToHome') }}</router-link>
      </div>

      <div v-else-if="resort" class="resort-detail">
        <div class="detail-header">
          <div class="header-main">
            <div class="header-info">
              <div class="title-row">
                <router-link to="/" class="back-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </router-link>
                <div class="title-content">
                  <h1>{{ resort.name }}</h1>
                  <div class="resort-meta">
                    <span class="meta-item">
                      <strong>{{ $t('resort.canton') }}:</strong> {{ resort.canton }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="header-right">
              <button
                v-if="isLoggedIn"
                @click="toggleFavorite"
                :class="['favorite-btn', { active: isFavorited }]"
                :title="isFavorited ? $t('favorites.remove') : $t('favorites.add')"
              >
                <svg viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>

              <div class="resort-logo">
              <img
                v-if="resort.logo_url && !logoError"
                :src="resort.logo_url"
                :alt="resort.name"
                class="logo-image"
                @error="logoError = true"
              />
              <span v-else class="logo-fallback">{{ resort.name?.charAt(0) }}</span>
            </div>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <div class="info-card">
            <h2>{{ $t('resort.currentStatus') }}</h2>
            <div class="danger-display">
              <DangerLevelBadge :level="resort.current_status?.danger_levels?.max" />
            </div>

            <div v-if="resort.current_status" class="status-details">
              <div class="detail-row">
                <span class="label">{{ $t('resort.dangerLow') }}:</span>
                <span class="value">
                  <DangerLevelBadge
                    :level="resort.current_status.danger_levels?.low"
                    :show-text="false"
                  />
                </span>
              </div>
              <div class="detail-row">
                <span class="label">{{ $t('resort.dangerHigh') }}:</span>
                <span class="value">
                  <DangerLevelBadge
                    :level="resort.current_status.danger_levels?.high"
                    :show-text="false"
                  />
                </span>
              </div>
              <div class="detail-row">
                <span class="label">{{ $t('resort.dangerMax') }}:</span>
                <span class="value">
                  <DangerLevelBadge
                    :level="resort.current_status.danger_levels?.max"
                    :show-text="false"
                  />
                </span>
              </div>
            </div>
          </div>

          <div v-if="resort.current_status?.avalanche_problems?.length" class="info-card avalanche-problems-card">
            <h2>{{ $t('resort.avalancheProblems') }}</h2>
            <div class="problems-list">
              <div
                v-for="(problem, index) in resort.current_status.avalanche_problems"
                :key="index"
                class="problem-card"
              >
                <div class="problem-content">
                  <div class="problem-info">
                    <div class="problem-header">
                      <span class="problem-type">{{ formatProblemType(problem.type) }}</span>
                    </div>
                    <div class="problem-elevation">
                      {{ formatElevation(problem.elevation_lower, problem.elevation_upper) }}
                    </div>
                  </div>
                  <div class="problem-compass">
                    <span class="compass-label">{{ $t('resort.aspects') }}</span>
                    <AspectCompass :aspects="problem.aspects" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="weather-section">
            <WeatherWidget
              :weather-data="weatherData"
              :loading="weatherLoading"
              :error="weatherError"
            />
          </div>

          <div class="info-card">
            <h2>{{ $t('resort.info') }}</h2>
            <div class="detail-row">
              <span class="label">{{ $t('resort.elevationMin') }}:</span>
              <span class="value">{{ resort.elevation?.min }}m</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('resort.elevationMax') }}:</span>
              <span class="value">{{ resort.elevation?.max }}m</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ $t('resort.coordinates') }}:</span>
              <span class="value">{{ resort.coordinates?.lat }}, {{ resort.coordinates?.lng }}</span>
            </div>
          </div>

          <div class="info-card map-card" v-if="resort.coordinates?.lat && resort.coordinates?.lng">
            <h2>{{ $t('resort.location', 'Standort') }}</h2>
            <MiniMap
              :lat="resort.coordinates.lat"
              :lng="resort.coordinates.lng"
              :name="resort.name"
              :geometry="resort.warning_region?.geometry"
              :danger-level="resort.current_status?.danger_levels?.max"
            />
          </div>

          <div class="historical-section">
            <HistoricalTimeline
              :history="historicalData"
              :loading="historicalLoading"
              :error="historicalError"
              @update:days="handleDaysChange"
            />
          </div>

          <div v-if="resort.last_updated" class="last-updated">
            {{ $t('resort.lastUpdated') }}: {{ formatDate(resort.last_updated) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useResortsStore } from '@/stores/resorts';
import { useAuthStore } from '@/stores/auth';
import { useFavoritesStore } from '@/stores/favorites';
import { useWeatherStore } from '@/stores/weather';
import DangerLevelBadge from '@/components/common/DangerLevelBadge.vue';
import HistoricalTimeline from '@/components/resort/HistoricalTimeline.vue';
import WeatherWidget from '@/components/common/WeatherWidget.vue';
import MiniMap from '@/components/resort/MiniMap.vue';
import AspectCompass from '@/components/common/AspectCompass.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const resortsStore = useResortsStore();
const authStore = useAuthStore();
const favoritesStore = useFavoritesStore();
const weatherStore = useWeatherStore();

const loading = computed(() => resortsStore.loading);
const error = computed(() => resortsStore.error);
const resort = computed(() => resortsStore.currentResort);
const isLoggedIn = computed(() => authStore.isLoggedIn);
const isFavorited = computed(() =>
  resort.value ? favoritesStore.isFavorite(resort.value.id) : false
);

const historicalData = computed(() => resortsStore.historicalData);
const historicalLoading = computed(() => resortsStore.historicalLoading);
const historicalError = ref(null);
const logoError = ref(false);

const weatherData = computed(() => weatherStore.weatherData);
const weatherLoading = computed(() => weatherStore.loading);
const weatherError = computed(() => weatherStore.error);

const toggleFavorite = async () => {
  if (!resort.value) return;
  try {
    await favoritesStore.toggleFavorite(resort.value.id);
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const formatProblemType = (type) => {
  if (!type) return t('avalancheTypes.unknown');
  return t(`avalancheTypes.${type}`, type.replace(/_/g, ' '));
};

const formatElevation = (lower, upper) => {
  if (!lower && !upper) return t('elevation.allElevations');
  if (lower && upper) return t('elevation.between', { lower, upper });
  if (lower) return t('elevation.above', { elevation: lower });
  if (upper) return t('elevation.below', { elevation: upper });
  return t('elevation.allElevations');
};

const handleDaysChange = async (days) => {
  const slug = route.params.slug;
  try {
    await resortsStore.fetchHistory(slug, days);
  } catch (error) {
    historicalError.value = 'Failed to load historical data';
    console.error('Error fetching historical data:', error);
  }
};

onMounted(async () => {
  const slug = route.params.slug;
  await resortsStore.fetchResortBySlug(slug);

  // Fetch favorites if logged in
  if (authStore.isLoggedIn) {
    try {
      await favoritesStore.fetchFavorites();
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }

  // Fetch historical data (default 7 days)
  try {
    await resortsStore.fetchHistory(slug, 7);
  } catch (error) {
    historicalError.value = 'Failed to load historical data';
    console.error('Error fetching historical data:', error);
  }

  // Fetch weather data
  try {
    await weatherStore.fetchWeather(slug);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
});
</script>

<style scoped>
.resort-detail-view {
  padding: var(--spacing-xl) 0;
  background: var(--color-background);
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.loading,
.error {
  text-align: center;
  padding: var(--spacing-2xl);
  font-size: 1.125rem;
  color: var(--color-text-primary);
}

.error {
  color: var(--color-danger);
  background: var(--card-background);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
}

.detail-header {
  margin-bottom: var(--spacing-xl);
  background: var(--card-background);
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.favorite-btn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  transform: scale(1.05);
}

.favorite-btn.active {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.favorite-btn svg {
  width: 22px;
  height: 22px;
}

.back-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
}

.back-link:hover {
  background: var(--color-background-secondary);
  transform: translateX(-4px);
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xl);
}

.header-info {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.back-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  transform: translateX(-2px);
}

.back-btn svg {
  width: 24px;
  height: 24px;
}

.detail-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
}

.resort-logo {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: var(--spacing-sm);
}

.logo-fallback {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.resort-meta {
  display: flex;
  gap: var(--spacing-xl);
  color: var(--color-text-secondary);
  font-size: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.meta-item strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 768px) {
  .detail-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

.weather-section,
.historical-section {
  grid-column: 1 / -1;
}

.info-card {
  background: var(--card-background);
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.info-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.info-card h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg) 0;
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-primary);
}

.map-card {
  display: flex;
  flex-direction: column;
}

.map-card .mini-map-container {
  flex: 1;
  min-height: 180px;
}

.danger-display {
  display: flex;
  justify-content: center;
  margin: var(--spacing-md) 0;
}

.danger-display :deep(.danger-badge) {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: 1rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
}

.danger-display :deep(.danger-level) {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 1rem;
  font-weight: 700;
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-base);
}

.detail-row:hover {
  background: var(--color-background-secondary);
  margin: 0 calc(-1 * var(--spacing-sm));
  padding-left: var(--spacing-sm);
  padding-right: var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.value {
  color: var(--color-text-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.problems-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}


.problem-card {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-base);
}

.problem-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.problem-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.problem-info {
  flex: 1;
}

.problem-header {
  margin-bottom: var(--spacing-sm);
}

.problem-type {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.problem-elevation {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.problem-compass {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.compass-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.last-updated {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  padding-top: var(--spacing-lg);
  font-style: italic;
  border-top: 1px solid var(--color-border);
  margin-top: var(--spacing-lg);
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .resort-detail-view {
    padding: var(--spacing-md) 0;
  }

  .container {
    padding: 0 var(--spacing-md);
  }

  .detail-header {
    padding: var(--spacing-lg);
  }

  .detail-header h1 {
    font-size: 1.75rem;
  }

  .header-main {
    flex-direction: row;
    align-items: center;
  }

  .resort-logo {
    width: 60px;
    height: 60px;
  }

  .logo-fallback {
    font-size: 1.5rem;
  }

  .back-btn {
    width: 40px;
    height: 40px;
  }

  .back-btn svg {
    width: 20px;
    height: 20px;
  }

  .title-row {
    gap: var(--spacing-md);
  }

  .favorite-btn {
    width: 36px;
    height: 36px;
  }

  .favorite-btn svg {
    width: 18px;
    height: 18px;
  }

  .info-card {
    padding: var(--spacing-md);
  }

  .info-card h2 {
    font-size: 1.125rem;
  }

  .detail-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .problem-card {
    padding: var(--spacing-md);
  }

  .problem-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .problem-compass {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .last-updated {
    grid-column: 1 / -1;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .container {
    max-width: 100%;
    padding: 0 var(--spacing-xl);
  }
}

/* Large Desktop */
@media (min-width: 1200px) {
  .container {
    max-width: 1400px;
    padding: 0 var(--spacing-2xl);
  }

  .detail-header h1 {
    font-size: 2.75rem;
  }

  .resort-logo {
    width: 100px;
    height: 100px;
  }

  .logo-fallback {
    font-size: 2.5rem;
  }
}
</style>
