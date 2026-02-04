<template>
  <div class="aspect-compass">
    <div class="compass-container">
      <!-- Top label (N) -->
      <span :class="['label label-n', { active: isActive('N') }]">N</span>

      <div class="compass-row">
        <!-- Left label (W) -->
        <span :class="['label label-w', { active: isActive('W') }]">W</span>

        <svg viewBox="0 0 100 100" class="compass-svg">
          <!-- Background circle -->
          <circle cx="50" cy="50" r="48" class="compass-bg" />

          <!-- Direction segments -->
          <path
            v-for="direction in directions"
            :key="direction.id"
            :d="direction.path"
            :class="['segment', { active: isActive(direction.id) }]"
          />

          <!-- Center circle -->
          <circle cx="50" cy="50" r="15" class="compass-center" />
        </svg>

        <!-- Right label (E) -->
        <span :class="['label label-e', { active: isActive('E') }]">O</span>
      </div>

      <!-- Bottom label (S) -->
      <span :class="['label label-s', { active: isActive('S') }]">S</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  aspects: {
    type: Array,
    default: () => []
  }
});

const directions = [
  { id: 'N', path: 'M50,50 L50,2 A48,48 0 0,1 83.94,16.06 Z' },
  { id: 'NE', path: 'M50,50 L83.94,16.06 A48,48 0 0,1 98,50 Z' },
  { id: 'E', path: 'M50,50 L98,50 A48,48 0 0,1 83.94,83.94 Z' },
  { id: 'SE', path: 'M50,50 L83.94,83.94 A48,48 0 0,1 50,98 Z' },
  { id: 'S', path: 'M50,50 L50,98 A48,48 0 0,1 16.06,83.94 Z' },
  { id: 'SW', path: 'M50,50 L16.06,83.94 A48,48 0 0,1 2,50 Z' },
  { id: 'W', path: 'M50,50 L2,50 A48,48 0 0,1 16.06,16.06 Z' },
  { id: 'NW', path: 'M50,50 L16.06,16.06 A48,48 0 0,1 50,2 Z' }
];

const isActive = (direction) => {
  return props.aspects?.includes(direction);
};
</script>

<style scoped>
.aspect-compass {
  flex-shrink: 0;
}

.compass-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.compass-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.compass-svg {
  width: 60px;
  height: 60px;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  min-width: 14px;
  text-align: center;
}

.label.active {
  color: var(--color-danger);
  font-weight: 700;
}

.compass-bg {
  fill: var(--color-background-tertiary);
  stroke: var(--color-border);
  stroke-width: 1;
}

.segment {
  fill: var(--color-background-secondary);
  stroke: var(--color-border);
  stroke-width: 0.5;
  transition: fill 0.2s ease;
}

.segment.active {
  fill: var(--color-danger);
  stroke: var(--color-danger);
}

.compass-center {
  fill: var(--card-background);
  stroke: var(--color-border);
  stroke-width: 1;
}
</style>
