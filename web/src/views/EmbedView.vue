<template>
  <div class="embed-view">
    <div class="page-header">
      <h1 class="page-title">{{ $t('embed.title') }}</h1>
      <p class="page-description">{{ $t('embed.description') }}</p>
    </div>

    <!-- Resort Selection -->
    <div class="section">
      <h2 class="section-title">{{ $t('embed.selectResort') }}</h2>
      <select v-model="selectedResort" class="resort-select" @change="updatePreview">
        <option :value="null" disabled>{{ $t('embed.chooseResort') }}</option>
        <option v-for="resort in resorts" :key="resort.id" :value="resort">
          {{ resort.name }}
        </option>
      </select>
    </div>

    <!-- Embed Options -->
    <div v-if="selectedResort" class="section">
      <h2 class="section-title">{{ $t('embed.options') }}</h2>

      <div class="options-grid">
        <div class="option-group">
          <label class="option-label">{{ $t('embed.type') }}</label>
          <select v-model="embedOptions.type" class="option-select" @change="updatePreview">
            <option value="widget">{{ $t('embed.compactWidget') }}</option>
            <option value="fullscreen">{{ $t('embed.fullscreenDashboard') }}</option>
          </select>
        </div>

        <div class="option-group">
          <label class="option-label">{{ $t('embed.theme') }}</label>
          <select v-model="embedOptions.theme" class="option-select" @change="updatePreview">
            <option value="light">{{ $t('embed.lightTheme') }}</option>
            <option value="dark">{{ $t('embed.darkTheme') }}</option>
          </select>
        </div>

        <div class="option-group">
          <label class="option-label">{{ $t('embed.language') }}</label>
          <select v-model="embedOptions.lang" class="option-select" @change="updatePreview">
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="selectedResort" class="section">
      <h2 class="section-title">{{ $t('embed.preview') }}</h2>
      <div class="preview-container" :class="`preview-${embedOptions.type}`">
        <iframe
          :src="previewUrl"
          :class="embedOptions.type === 'fullscreen' ? 'preview-fullscreen' : 'preview-widget'"
          frameborder="0"
        ></iframe>
      </div>
    </div>

    <!-- Embed Code -->
    <div v-if="selectedResort && iframeCode" class="section">
      <h2 class="section-title">{{ $t('embed.embedCode') }}</h2>
      <div class="code-container">
        <pre class="code-block">{{ iframeCode }}</pre>
        <button @click="copyCode" class="btn btn-primary">
          {{ copied ? $t('embed.copied') : $t('embed.copyCode') }}
        </button>
      </div>
    </div>

    <!-- QR Code -->
    <div v-if="selectedResort" class="section">
      <h2 class="section-title">{{ $t('embed.qrCode') }}</h2>
      <QRCodeDisplay
        :url="resortUrl"
        :size="250"
        :show-url="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useResortsStore } from '../stores/resorts';
import embedsApi from '../api/embeds';
import QRCodeDisplay from '../components/embed/QRCodeDisplay.vue';

const { t } = useI18n();
const resortsStore = useResortsStore();

const selectedResort = ref(null);
const embedOptions = ref({
  type: 'widget',
  theme: 'light',
  lang: 'de',
});

const iframeCode = ref('');
const copied = ref(false);

const resorts = computed(() => resortsStore.resorts);

const previewUrl = computed(() => {
  if (!selectedResort.value) return '';

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const params = new URLSearchParams({
    theme: embedOptions.value.theme,
    lang: embedOptions.value.lang,
  });

  return `${baseUrl}/api/v1/embed/${selectedResort.value.slug}/${embedOptions.value.type}?${params}`;
});

const resortUrl = computed(() => {
  if (!selectedResort.value) return '';
  const baseUrl = window.location.origin;
  return `${baseUrl}/resorts/${selectedResort.value.slug}`;
});

const updatePreview = async () => {
  if (!selectedResort.value) return;

  try {
    const response = await embedsApi.getIframeCode(selectedResort.value.slug, embedOptions.value);
    iframeCode.value = response.data.code;
  } catch (error) {
    console.error('Failed to get iframe code:', error);
  }
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(iframeCode.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy code:', error);
  }
};

onMounted(async () => {
  if (resorts.value.length === 0) {
    await resortsStore.fetchResorts();
  }
});
</script>

<style scoped>
.embed-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.page-description {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.resort-select {
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 1rem;
}

.resort-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.option-select {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.option-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.preview-container {
  background-color: var(--color-surface-variant);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-widget {
  width: 100%;
  max-width: 400px;
  height: 350px;
  border-radius: var(--radius-md);
}

.preview-fullscreen {
  width: 100%;
  height: 600px;
  border-radius: var(--radius-md);
}

.code-container {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.code-block {
  padding: var(--spacing-lg);
  margin: 0;
  background-color: var(--color-surface-variant);
  color: var(--color-text-primary);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.btn {
  width: 100%;
  padding: var(--spacing-md);
  border: none;
  border-radius: 0;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

@media (max-width: 768px) {
  .embed-view {
    padding: var(--spacing-md);
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .preview-fullscreen {
    height: 400px;
  }
}
</style>
