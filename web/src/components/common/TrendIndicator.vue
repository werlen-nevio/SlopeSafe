<template>
  <div :class="['trend-indicator', trendClass]" :title="trendText">
    <span class="trend-icon" v-html="trendIcon"></span>
    <span v-if="showText" class="trend-text">{{ trendText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  trend: {
    type: String,
    required: true,
    validator: (value) => ['increasing', 'decreasing', 'stable'].includes(value)
  },
  showText: {
    type: Boolean,
    default: true
  },
  change: {
    type: Number,
    default: null
  }
});

const { t } = useI18n();

const trendClass = computed(() => `trend-${props.trend}`);

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'increasing':
      return '↗';
    case 'decreasing':
      return '↘';
    case 'stable':
      return '→';
    default:
      return '→';
  }
});

const trendText = computed(() => {
  if (props.change !== null) {
    const sign = props.change > 0 ? '+' : '';
    return `${getTrendLabel()} (${sign}${props.change})`;
  }
  return getTrendLabel();
});

const getTrendLabel = () => {
  switch (props.trend) {
    case 'increasing':
      return t('trend.increasing', 'Increasing');
    case 'decreasing':
      return t('trend.decreasing', 'Decreasing');
    case 'stable':
      return t('trend.stable', 'Stable');
    default:
      return t('trend.unknown', 'Unknown');
  }
};
</script>

<style scoped>
.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  transition: all var(--transition-base);
}

.trend-icon {
  font-size: 1.125rem;
  line-height: 1;
  font-weight: bold;
}

.trend-text {
  text-transform: capitalize;
}

/* Trend: Increasing (Danger) */
.trend-increasing {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

[data-theme="dark"] .trend-increasing {
  background-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Trend: Decreasing (Good) */
.trend-decreasing {
  background-color: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

[data-theme="dark"] .trend-decreasing {
  background-color: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

/* Trend: Stable */
.trend-stable {
  background-color: rgba(107, 114, 128, 0.1);
  color: #4b5563;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

[data-theme="dark"] .trend-stable {
  background-color: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
}

/* Animation */
.trend-increasing .trend-icon,
.trend-decreasing .trend-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
