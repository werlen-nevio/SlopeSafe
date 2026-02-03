<template>
  <div class="favorites-view">
    <div class="container">
      <div class="page-header">
        <h1>{{ $t('favorites.title') }}</h1>
        <p class="subtitle">{{ $t('favorites.subtitle') }}</p>
      </div>

      <div v-if="loading" class="loading">
        {{ $t('common.loading') }}...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else-if="favorites.length === 0" class="no-favorites">
        <p>{{ $t('favorites.noFavorites') }}</p>
        <router-link to="/" class="btn-primary">
          {{ $t('favorites.browseResorts') }}
        </router-link>
      </div>

      <div v-else class="resorts-grid">
        <ResortCard
          v-for="resort in favorites"
          :key="resort.id"
          :resort="resort"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFavoritesStore } from '@/stores/favorites';
import ResortCard from '@/components/resort/ResortCard.vue';

const { t } = useI18n();
const favoritesStore = useFavoritesStore();

const loading = computed(() => favoritesStore.loading);
const error = computed(() => favoritesStore.error);
const favorites = computed(() => favoritesStore.allFavorites);

onMounted(async () => {
  await favoritesStore.fetchFavorites();
});
</script>

<style scoped>
.favorites-view {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.loading,
.error,
.no-favorites {
  text-align: center;
  padding: 3rem;
  font-size: 1.125rem;
}

.error {
  color: #ef4444;
}

.no-favorites {
  color: #6b7280;
}

.btn-primary {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #2563eb;
  color: #ffffff;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.resorts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .resorts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
