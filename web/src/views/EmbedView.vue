<template>
  <div class="embed-view">
    <div class="page-header">
      <h1 class="page-title">{{ $t('embed.title') }}</h1>
      <p class="page-description">{{ $t('embed.description') }}</p>
    </div>

    <!-- Resort Selection -->
    <div class="section">
      <h2 class="section-title">{{ $t('embed.selectResort') }}</h2>
      <CustomSelect
        v-model="selectedResortId"
        :options="resortOptions"
        :placeholder="$t('embed.chooseResort')"
        @change="handleResortChange"
        class="resort-select"
      />
    </div>

    <!-- Embed Options -->
    <div v-if="selectedResort" class="section">
      <h2 class="section-title">{{ $t('embed.options') }}</h2>

      <div class="options-grid">
        <div class="option-group">
          <label class="option-label">{{ $t('embed.type') }}</label>
          <CustomSelect
            v-model="embedOptions.type"
            :options="typeOptions"
            @change="updatePreview"
          />
        </div>

        <div class="option-group">
          <label class="option-label">{{ $t('embed.theme') }}</label>
          <CustomSelect
            v-model="embedOptions.theme"
            :options="themeOptions"
            @change="updatePreview"
          />
        </div>

        <div class="option-group">
          <label class="option-label">{{ $t('embed.language') }}</label>
          <CustomSelect
            v-model="embedOptions.lang"
            :options="langOptions"
            @change="updatePreview"
          />
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
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useResortsStore } from '../stores/resorts';
import embedsApi from '../api/embeds';
import QRCodeDisplay from '../components/embed/QRCodeDisplay.vue';
import CustomSelect from '../components/common/CustomSelect.vue';

const { t } = useI18n();
const resortsStore = useResortsStore();

const selectedResortId = ref(null);
const selectedResort = computed(() =>
  resorts.value.find(r => r.id === selectedResortId.value) || null
);

const resortOptions = computed(() =>
  resorts.value.map(resort => ({
    value: resort.id,
    label: resort.name
  }))
);

const typeOptions = computed(() => [
  { value: 'widget', label: t('embed.compactWidget') },
  { value: 'fullscreen', label: t('embed.fullscreenDashboard') }
]);

const themeOptions = computed(() => [
  { value: 'light', label: t('embed.lightTheme') },
  { value: 'dark', label: t('embed.darkTheme') }
]);

const langOptions = [
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'it', label: 'Italiano' },
  { value: 'en', label: 'English' }
];

const handleResortChange = () => {
  updatePreview();
};
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
  max-width: 400px;
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
