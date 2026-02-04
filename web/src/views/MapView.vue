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

    // Fetch danger layer first (renders below markers)
    await loadDangerLayer();

    // Fetch and add resort markers (renders on top)
    await loadResorts();

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

    // Create GeoJSON FeatureCollection for all resorts
    const resortsGeoJson = {
      type: 'FeatureCollection',
      features: resorts
        .filter(resort => resort.coordinates)
        .map(resort => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [resort.coordinates.lng, resort.coordinates.lat]
          },
          properties: {
            name: resort.name,
            slug: resort.slug,
            danger_level: resort.danger_level
          }
        }))
    };

    // Add resorts as a GeoJSON source
    map.addSource('resorts', {
      type: 'geojson',
      data: resortsGeoJson
    });

    // Add circle layer for resort markers (same style as MiniMap)
    map.addLayer({
      id: 'resort-markers',
      type: 'circle',
      source: 'resorts',
      paint: {
        'circle-radius': 8,
        'circle-color': '#1e3a5f',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add click handler for resort markers
    map.on('click', 'resort-markers', (e) => {
      const feature = e.features[0];
      if (feature) {
        router.push(`/resorts/${feature.properties.slug}`);
      }
    });

    // Show popup on hover
    map.on('mouseenter', 'resort-markers', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const feature = e.features[0];
      if (feature) {
        const popup = new maplibregl.Popup({
          offset: 15,
          closeButton: false,
          closeOnClick: false
        })
          .setLngLat(feature.geometry.coordinates)
          .setHTML(`
            <div class="map-popup">
              <h3>${feature.properties.name}</h3>
              <div class="map-popup-content">
                <div class="map-popup-row">
                  <span class="map-popup-label">${t('danger.level')}:</span>
                  <span class="map-popup-value">${feature.properties.danger_level || '-'}</span>
                </div>
              </div>
            </div>
          `)
          .addTo(map);

        map._currentPopup = popup;
      }
    });

    map.on('mouseleave', 'resort-markers', () => {
      map.getCanvas().style.cursor = '';
      if (map._currentPopup) {
        map._currentPopup.remove();
        map._currentPopup = null;
      }
    });
  } catch (err) {
    console.error('Failed to load resorts:', err);
  }
};

const loadDangerLayer = async () => {
  try {
    const response = await api.map.getDangerLayer();
    dangerLayerData = response;

    // Show danger layer by default
    if (dangerLayerData && map) {
      map.addSource('danger-source', {
        type: 'geojson',
        data: dangerLayerData
      });

      map.addLayer({
        id: 'danger-fill',
        type: 'fill',
        source: 'danger-source',
        filter: ['>=', ['get', 'danger_level'], 1],
        paint: {
          'fill-color': [
            'match',
            ['get', 'danger_level'],
            1, '#ccff66',
            2, '#ffff00',
            3, '#ff9900',
            4, '#ff0000',
            5, '#9d0000',
            'transparent'
          ],
          'fill-opacity': 0.4
        }
      });

      map.addLayer({
        id: 'danger-outline',
        type: 'line',
        source: 'danger-source',
        filter: ['>=', ['get', 'danger_level'], 1],
        paint: {
          'line-color': [
            'match',
            ['get', 'danger_level'],
            1, '#ccff66',
            2, '#ffff00',
            3, '#ff9900',
            4, '#ff0000',
            5, '#9d0000',
            'transparent'
          ],
          'line-width': 2,
          'line-opacity': 0.8
        }
      });
    }
  } catch (err) {
    console.error('Failed to load danger layer:', err);
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
