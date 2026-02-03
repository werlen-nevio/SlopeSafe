<template>
  <div class="map-view">
    <div class="map-wrapper">
      <div v-if="loading" class="map-loading">
        <div class="map-loading-spinner"></div>
      </div>

      <div v-if="error" class="map-error">
        {{ error }}
      </div>

      <div ref="mapContainer" class="map-container"></div>

      <!-- Map Legend -->
      <div v-if="!loading" class="map-legend">
        <h4>{{ $t('map.dangerLevel', 'Danger Level') }}</h4>
        <div class="legend-items">
          <div class="legend-item" v-for="level in dangerLevels" :key="level.value">
            <div class="legend-color" :style="{ backgroundColor: level.color }"></div>
            <span class="legend-label">{{ level.value }} - {{ level.label }}</span>
          </div>
        </div>
      </div>

      <!-- Map Controls -->
      <div v-if="!loading" class="map-controls">
        <button
          @click="toggleDangerLayer"
          :class="['map-control-btn', { active: showDangerLayer }]"
        >
          {{ showDangerLayer ? $t('map.hideDanger', 'Hide Danger Zones') : $t('map.showDanger', 'Show Danger Zones') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import maplibregl from 'maplibre-gl';
import api from '@/api';

const { t } = useI18n();
const router = useRouter();
const mapContainer = ref(null);
const loading = ref(true);
const error = ref(null);
const showDangerLayer = ref(false);

let map = null;
let resorts = [];
let dangerLayerData = null;

const dangerLevels = [
  { value: 1, label: t('danger.low', 'Low'), color: '#ccff66' },
  { value: 2, label: t('danger.moderate', 'Moderate'), color: '#ffff00' },
  { value: 3, label: t('danger.considerable', 'Considerable'), color: '#ff9900' },
  { value: 4, label: t('danger.high', 'High'), color: '#ff0000' },
  { value: 5, label: t('danger.veryHigh', 'Very High'), color: '#9d0000' }
];

const initializeMap = async () => {
  if (!mapContainer.value) return;

  try {
    // Create map centered on Switzerland
    map = new maplibregl.Map({
      container: mapContainer.value,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [8.2275, 46.8182], // Switzerland center
      zoom: 7,
      maxZoom: 15,
      minZoom: 6
    });

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Wait for map to load
    await new Promise((resolve) => map.on('load', resolve));

    // Fetch and add resort markers
    await loadResorts();

    // Fetch danger layer data
    await loadDangerLayer();

    loading.value = false;
  } catch (err) {
    console.error('Failed to initialize map:', err);
    error.value = 'Failed to load map';
    loading.value = false;
  }
};

const loadResorts = async () => {
  try {
    const response = await api.map.getResorts();
    resorts = response.resorts || [];

    // Add markers for each resort
    resorts.forEach(resort => {
      if (resort.coordinates) {
        const markerEl = document.createElement('div');
        markerEl.className = `resort-marker danger-${resort.danger_level || 0}`;
        markerEl.textContent = resort.danger_level || '?';

        const marker = new maplibregl.Marker({ element: markerEl })
          .setLngLat([resort.coordinates.lng, resort.coordinates.lat])
          .setPopup(createPopup(resort))
          .addTo(map);

        // Add click handler
        markerEl.addEventListener('click', () => {
          router.push(`/resorts/${resort.slug}`);
        });
      }
    });
  } catch (err) {
    console.error('Failed to load resorts:', err);
  }
};

const createPopup = (resort) => {
  const popupContent = `
    <div class="map-popup">
      <h3>${resort.name}</h3>
      <div class="map-popup-content">
        <div class="map-popup-row">
          <span class="map-popup-label">${t('danger.level')}:</span>
          <span class="map-popup-value">${resort.danger_level || '-'}</span>
        </div>
      </div>
      <div class="map-popup-link">
        <a href="/resorts/${resort.slug}">${t('common.viewDetails', 'View Details')}</a>
      </div>
    </div>
  `;

  return new maplibregl.Popup({
    offset: 25,
    closeButton: true,
    closeOnClick: false
  }).setHTML(popupContent);
};

const loadDangerLayer = async () => {
  try {
    const response = await api.map.getDangerLayer();
    dangerLayerData = response;
  } catch (err) {
    console.error('Failed to load danger layer:', err);
  }
};

const toggleDangerLayer = () => {
  if (!map || !dangerLayerData) return;

  if (showDangerLayer.value) {
    // Remove danger layer
    if (map.getLayer('danger-layer')) {
      map.removeLayer('danger-layer');
    }
    if (map.getSource('danger-source')) {
      map.removeSource('danger-source');
    }
    showDangerLayer.value = false;
  } else {
    // Add danger layer
    if (!map.getSource('danger-source')) {
      map.addSource('danger-source', {
        type: 'geojson',
        data: dangerLayerData
      });
    }

    if (!map.getLayer('danger-layer')) {
      map.addLayer({
        id: 'danger-layer',
        type: 'fill',
        source: 'danger-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'danger_level'],
            1, '#ccff66',
            2, '#ffff00',
            3, '#ff9900',
            4, '#ff0000',
            5, '#9d0000',
            '#cccccc' // default
          ],
          'fill-opacity': 0.4
        }
      }, 'osm'); // Add below OSM layer
    }

    showDangerLayer.value = true;
  }
};

onMounted(() => {
  initializeMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});
</script>

<style scoped>
.map-view {
  padding: var(--spacing-lg);
  background: var(--color-background);
  min-height: calc(100vh - 200px);
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 250px);
  min-height: 600px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.map-container {
  width: 100%;
  height: 100%;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .map-view {
    padding: var(--spacing-md);
  }

  .map-wrapper {
    height: calc(100vh - 200px);
    min-height: 400px;
  }
}
</style>
