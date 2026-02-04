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
          :showFavorite="false"
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
  padding: var(--spacing-xl) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.loading,
.error,
.no-favorites {
  text-align: center;
  padding: var(--spacing-2xl);
  font-size: 1.125rem;
}

.error {
  color: var(--color-danger);
}

.no-favorites {
  color: var(--color-text-secondary);
}

.btn-primary {
  display: inline-block;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-accent);
  color: var(--button-text);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: background-color var(--transition-base);
  min-height: var(--touch-target-min);
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
}

.resorts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .resorts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .favorites-view {
    padding: var(--spacing-lg) 0;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 360px) {
  .favorites-view {
    padding: var(--spacing-md) 0;
  }

  .container {
    padding: 0 var(--spacing-sm);
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header {
    margin-bottom: var(--spacing-lg);
  }
}
</style>
