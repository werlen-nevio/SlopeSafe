<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ $t('home.title') }}</h1>
        <p class="hero-subtitle">{{ $t('home.subtitle') }}</p>
        <div class="hero-search">
          <div class="search-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              :placeholder="$t('home.searchPlaceholder')"
              class="hero-search-input"
            />
          </div>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="hero-shape hero-shape-1"></div>
        <div class="hero-shape hero-shape-2"></div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-section">
      <div class="section-container">
        <div class="toolbar">
          <div class="sort-controls">
            <label class="sort-label">{{ $t('home.sortBy') }}:</label>
            <select v-model="sortBy" @change="handleSort" class="sort-select">
              <option value="distance">{{ $t('home.sortByDistance') }}</option>
              <option value="name">{{ $t('home.sortByName') }}</option>
              <option value="danger">{{ $t('home.sortByDanger') }}</option>
              <option value="canton">{{ $t('home.sortByCanton') }}</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>{{ $t('common.loading') }}...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="displayResorts.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p>{{ $t('home.noResorts') }}</p>
        </div>

        <div v-else class="resorts-grid">
          <ResortCard
            v-for="resort in displayResorts"
            :key="resort.id"
            :resort="resort"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useResortsStore } from '@/stores/resorts';
import ResortCard from '@/components/resort/ResortCard.vue';

const { t } = useI18n();
const resortsStore = useResortsStore();

const searchQuery = ref('');
const sortBy = ref('distance');
const userLocation = ref(null);
const loading = computed(() => resortsStore.loading);
const error = computed(() => resortsStore.error);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const displayResorts = computed(() => {
  let resorts = searchQuery.value
    ? resortsStore.searchResults
    : resortsStore.allResorts;

  if (sortBy.value === 'distance' && userLocation.value) {
    resorts = [...resorts].sort((a, b) => {
      const distA = calculateDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        a.coordinates?.lat || 0,
        a.coordinates?.lng || 0
      );
      const distB = calculateDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        b.coordinates?.lat || 0,
        b.coordinates?.lng || 0
      );
      return distA - distB;
    });
  } else if (sortBy.value === 'distance' && !userLocation.value) {
    resorts = [...resorts].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'danger') {
    resorts = [...resorts].sort((a, b) => (b.danger_level || 0) - (a.danger_level || 0));
  } else if (sortBy.value === 'name') {
    resorts = [...resorts].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'canton') {
    resorts = [...resorts].sort((a, b) => a.canton.localeCompare(b.canton));
  }

  return resorts;
});

const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    await resortsStore.searchResorts(searchQuery.value);
  } else {
    resortsStore.clearSearch();
  }
};

const handleSort = () => {
  // Sorting is handled by the computed property
};

const getUserLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      },
      () => {
        sortBy.value = 'name';
      }
    );
  } else {
    sortBy.value = 'name';
  }
};

onMounted(async () => {
  getUserLocation();
  await resortsStore.fetchResorts();
});
</script>

<style scoped>
.home-view {
  width: 100%;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-navy-light) 100%);
  padding: var(--spacing-3xl) var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 var(--spacing-2xl) 0;
  line-height: 1.6;
}

.hero-search {
  max-width: 600px;
  margin: 0 auto;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-lg);
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.hero-search-input {
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg) 56px;
  font-size: 1.125rem;
  border: none;
  border-radius: var(--radius-xl);
  background-color: #FFFFFF;
  color: var(--color-text-primary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all var(--transition-base);
}

.hero-search-input::placeholder {
  color: var(--color-text-tertiary);
}

.hero-search-input:focus {
  outline: none;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(91, 164, 212, 0.3);
}

.hero-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.hero-shape-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -100px;
}

.hero-shape-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -50px;
}

/* Main Section */
.main-section {
  padding: var(--spacing-2xl) var(--spacing-xl);
  background-color: var(--color-background);
}

.section-container {
  width: 100%;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sort-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  background-color: var(--input-background);
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.sort-select:hover {
  border-color: var(--color-primary);
}

.sort-select:focus {
  outline: none;
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px rgba(91, 164, 212, 0.2);
}

/* Resorts Grid */
.resorts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--spacing-lg);
}

/* States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p,
.empty-state p {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.error-state p {
  font-size: 1.125rem;
  color: var(--color-danger);
  margin: 0;
}

.error-icon,
.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--spacing-md);
}

.error-icon {
  color: var(--color-danger);
}

.empty-icon {
  color: var(--color-text-tertiary);
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-section {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .main-section {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .hero-search-input {
    padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 48px;
    font-size: 1rem;
  }

  .search-icon {
    left: var(--spacing-md);
  }

  .main-section {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .resorts-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-controls {
    justify-content: space-between;
  }
}
</style>
