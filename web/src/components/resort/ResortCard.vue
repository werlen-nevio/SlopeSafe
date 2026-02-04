<template>
  <div class="resort-card">
    <router-link :to="`/resorts/${resort.slug}`" class="card-link">
      <div class="card-header">
        <div class="resort-identity">
          <div class="resort-logo">
            <img
              v-if="resort.logo_url && !logoError"
              :src="resort.logo_url"
              :alt="resort.name"
              class="logo-image"
              @error="onLogoError"
            />
            <span v-else class="logo-fallback">{{ resortInitial }}</span>
          </div>
          <h3 class="resort-name">{{ resort.name }}</h3>
        </div>
        <div class="header-right">
          <DangerLevelBadge :level="resort.danger_level" :showText="false" />
          <button
            v-if="showFavorite && isLoggedIn"
            @click.prevent="toggleFavorite"
            :class="['favorite-btn', { active: isFavorited }]"
            :title="isFavorited ? $t('favorites.remove') : $t('favorites.add')"
          >
            <span class="favorite-icon">{{ isFavorited ? '★' : '☆' }}</span>
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="resort-info">
          <div class="info-item">
            <span class="label">{{ $t('resort.canton') }}:</span>
            <span class="value">{{ resort.canton }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('resort.elevation') }}:</span>
            <span class="value">{{ resort.elevation?.min || resort.elevation_min }}m - {{ resort.elevation?.max || resort.elevation_max }}m</span>
          </div>
        </div>

        <div v-if="resort.last_updated" class="last-updated">
          {{ $t('resort.updated') }}: {{ formatDate(resort.last_updated) }}
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useFavoritesStore } from '@/stores/favorites';
import DangerLevelBadge from '@/components/common/DangerLevelBadge.vue';

const props = defineProps({
  resort: {
    type: Object,
    required: true
  },
  showFavorite: {
    type: Boolean,
    default: true
  }
});

const { t } = useI18n();
const authStore = useAuthStore();
const favoritesStore = useFavoritesStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const isFavorited = computed(() => favoritesStore.isFavorite(props.resort.id));
const resortInitial = computed(() => props.resort.name?.charAt(0).toUpperCase() || '?');
const logoError = ref(false);

const onLogoError = () => {
  logoError.value = true;
};

const toggleFavorite = async () => {
  try {
    await favoritesStore.toggleFavorite(props.resort.id);
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.resort-card {
  background: var(--card-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  transition: all var(--transition-slow);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.resort-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-secondary);
}

.resort-identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.resort-logo {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-fallback {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.resort-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  transition: color var(--transition-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.resort-card:hover .resort-name {
  color: var(--color-primary);
}

.favorite-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  font-size: 1.5rem;
  color: var(--color-border);
  transition: all var(--transition-base);
}

.favorite-btn:hover {
  transform: scale(1.15) rotate(15deg);
}

.favorite-btn.active {
  color: #fbbf24;
  animation: heartbeat 0.5s ease;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.favorite-icon {
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.card-body {
  padding: var(--spacing-lg);
}

.resort-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.info-item {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.value {
  color: var(--color-text-primary);
  font-weight: 500;
}

.last-updated {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  text-align: center;
  margin-top: var(--spacing-md);
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .card-header {
    padding: var(--spacing-md);
  }

  .card-body {
    padding: var(--spacing-md);
  }

  .resort-logo {
    width: 32px;
    height: 32px;
  }

  .logo-fallback {
    font-size: 1rem;
  }

  .resort-name {
    font-size: 1.125rem;
  }
}
</style>
