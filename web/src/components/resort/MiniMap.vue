<template>
  <div class="mini-map-container">
    <div ref="mapContainer" class="mini-map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import maplibregl from 'maplibre-gl';

const props = defineProps({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  geometry: {
    type: Object,
    default: null
  },
  dangerLevel: {
    type: Number,
    default: null
  }
});

const mapContainer = ref(null);
let map = null;

const dangerColors = {
  1: '#ccff66',
  2: '#ffff00',
  3: '#ff9900',
  4: '#ff0000',
  5: '#9d0000'
};

const getDangerColor = (level) => {
  return dangerColors[level] || '#ff9900';
};

const initializeMap = () => {
  if (!mapContainer.value || !props.lat || !props.lng) return;

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
          attribution: '© OpenStreetMap'
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
    center: [props.lng, props.lat],
    zoom: props.geometry ? 10 : 11,
    attributionControl: false
  });

  // Add zoom controls
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  map.on('load', () => {
    addRegionLayer();
  });
};

const addRegionLayer = () => {
  if (!map) return;

  // Remove existing layers if any
  if (map.getLayer('region-fill')) map.removeLayer('region-fill');
  if (map.getLayer('region-outline')) map.removeLayer('region-outline');
  if (map.getLayer('resort-marker')) map.removeLayer('resort-marker');
  if (map.getSource('region')) map.removeSource('region');
  if (map.getSource('resort-point')) map.removeSource('resort-point');

  // Add region polygon if geometry is available
  if (props.geometry) {
    const geojson = {
      type: 'Feature',
      geometry: props.geometry,
      properties: {
        danger_level: props.dangerLevel
      }
    };

    map.addSource('region', {
      type: 'geojson',
      data: geojson
    });

    // Fill layer
    map.addLayer({
      id: 'region-fill',
      type: 'fill',
      source: 'region',
      paint: {
        'fill-color': getDangerColor(props.dangerLevel),
        'fill-opacity': 0.4
      }
    });

    // Outline layer
    map.addLayer({
      id: 'region-outline',
      type: 'line',
      source: 'region',
      paint: {
        'line-color': getDangerColor(props.dangerLevel),
        'line-width': 2,
        'line-opacity': 0.8
      }
    });

    // Fit bounds to region
    try {
      const bounds = new maplibregl.LngLatBounds();
      const coords = props.geometry.type === 'Polygon'
        ? props.geometry.coordinates[0]
        : props.geometry.coordinates.flat(2);

      if (props.geometry.type === 'Polygon') {
        coords.forEach(coord => bounds.extend(coord));
      } else if (props.geometry.type === 'MultiPolygon') {
        props.geometry.coordinates.forEach(polygon => {
          polygon[0].forEach(coord => bounds.extend(coord));
        });
      }

      map.fitBounds(bounds, { padding: 20, maxZoom: 12 });
    } catch (e) {
      console.warn('Could not fit bounds to region:', e);
    }
  }

  // Add resort marker point
  map.addSource('resort-point', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [props.lng, props.lat]
      },
      properties: {
        name: props.name
      }
    }
  });

  map.addLayer({
    id: 'resort-marker',
    type: 'circle',
    source: 'resort-point',
    paint: {
      'circle-radius': 8,
      'circle-color': '#1e3a5f',
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff'
    }
  });
};

watch(() => [props.geometry, props.dangerLevel], () => {
  if (map && map.loaded()) {
    addRegionLayer();
  }
});

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
.mini-map-container {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.mini-map {
  width: 100%;
  height: 100%;
}
</style>
