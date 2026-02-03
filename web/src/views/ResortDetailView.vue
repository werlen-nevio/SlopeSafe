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
          <div class="header-top">
            <router-link to="/" class="back-link">← {{ $t('common.back') }}</router-link>
            <button
              v-if="isLoggedIn"
              @click="toggleFavorite"
              :class="['favorite-btn-large', { active: isFavorited }]"
            >
              <span class="icon">{{ isFavorited ? '★' : '☆' }}</span>
              {{ isFavorited ? $t('favorites.remove') : $t('favorites.add') }}
            </button>
          </div>

          <h1>{{ resort.name }}</h1>

          <div class="resort-meta">
            <span class="meta-item">
              <strong>{{ $t('resort.canton') }}:</strong> {{ resort.canton }}
            </span>
            <span class="meta-item">
              <strong>{{ $t('resort.region') }}:</strong> {{ resort.region || '-' }}
            </span>
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
                  {{ resort.current_status.danger_levels?.low || '-' }}
                </span>
              </div>
              <div class="detail-row">
                <span class="label">{{ $t('resort.dangerHigh') }}:</span>
                <span class="value">
                  <DangerLevelBadge
                    :level="resort.current_status.danger_levels?.high"
                    :show-text="false"
                  />
                  {{ resort.current_status.danger_levels?.high || '-' }}
                </span>
              </div>
              <div class="detail-row">
                <span class="label">{{ $t('resort.dangerMax') }}:</span>
                <span class="value">
                  <DangerLevelBadge
                    :level="resort.current_status.danger_levels?.max"
                    :show-text="false"
                  />
                  {{ resort.current_status.danger_levels?.max }}
                </span>
              </div>
            </div>
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

          <div class="weather-section">
            <WeatherWidget
              :weather-data="weatherData"
              :loading="weatherLoading"
              :error="weatherError"
            />
          </div>

          <div class="run-status-section">
            <RunStatusWidget
              :run-status-data="runStatusData"
              :loading="runStatusLoading"
              :error="runStatusError"
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

          <div v-if="resort.current_status?.avalanche_problems" class="info-card">
            <h2>{{ $t('resort.avalancheProblems') }}</h2>
            <div class="problems-list">
              <div
                v-for="(problem, index) in resort.current_status.avalanche_problems"
                :key="index"
                class="problem-item"
              >
                {{ problem }}
              </div>
            </div>
          </div>

          <div v-if="resort.current_status?.aspects" class="info-card">
            <h2>{{ $t('resort.aspects') }}</h2>
            <div class="aspects-list">
              <div
                v-for="(aspect, index) in resort.current_status.aspects"
                :key="index"
                class="aspect-item"
              >
                {{ aspect }}
              </div>
            </div>
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
import { useRunStatusStore } from '@/stores/runStatus';
import DangerLevelBadge from '@/components/common/DangerLevelBadge.vue';
import HistoricalTimeline from '@/components/resort/HistoricalTimeline.vue';
import WeatherWidget from '@/components/common/WeatherWidget.vue';
import RunStatusWidget from '@/components/common/RunStatusWidget.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const resortsStore = useResortsStore();
const authStore = useAuthStore();
const favoritesStore = useFavoritesStore();
const weatherStore = useWeatherStore();
const runStatusStore = useRunStatusStore();

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

const weatherData = computed(() => weatherStore.weatherData);
const weatherLoading = computed(() => weatherStore.loading);
const weatherError = computed(() => weatherStore.error);

const runStatusData = computed(() => runStatusStore.runStatusData);
const runStatusLoading = computed(() => runStatusStore.loading);
const runStatusError = computed(() => runStatusStore.error);

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

  // Fetch run status
  try {
    await runStatusStore.fetchRunStatus(slug);
  } catch (error) {
    console.error('Error fetching run status:', error);
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
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
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

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
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

.favorite-btn-large {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--card-background);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.favorite-btn-large:hover {
  border-color: #fbbf24;
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.favorite-btn-large.active {
  border-color: #fbbf24;
  background-color: rgba(251, 191, 36, 0.1);
}

.favorite-btn-large .icon {
  font-size: 1.5rem;
  color: var(--color-border);
  transition: all var(--transition-base);
}

.favorite-btn-large:hover .icon {
  transform: scale(1.1);
}

.favorite-btn-large.active .icon {
  color: #fbbf24;
  animation: starPulse 1s ease-in-out infinite;
}

@keyframes starPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.detail-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.2;
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

  .info-card:first-child {
    grid-column: 1 / -1;
  }
}

.weather-section {
  grid-column: 1 / -1;
  margin: var(--spacing-md) 0;
}

.run-status-section {
  grid-column: 1 / -1;
  margin: var(--spacing-md) 0;
}

.historical-section {
  grid-column: 1 / -1;
  margin: var(--spacing-md) 0;
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

.danger-display {
  display: flex;
  justify-content: center;
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-lg);
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
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

.problems-list,
.aspects-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.problem-item,
.aspect-item {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

.problem-item:hover,
.aspect-item:hover {
  background-color: var(--color-background-tertiary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.last-updated {
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

  .detail-header {
    padding: var(--spacing-lg);
  }

  .detail-header h1 {
    font-size: 2rem;
  }

  .resort-meta {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .favorite-btn-large {
    width: 100%;
    justify-content: center;
  }

  .info-card {
    padding: var(--spacing-lg);
  }

  .info-card h2 {
    font-size: 1.25rem;
  }

  .detail-content {
    grid-template-columns: 1fr;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .container {
    max-width: 720px;
  }
}
</style>
