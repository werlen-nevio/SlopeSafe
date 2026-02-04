<template>
  <div
    v-if="level"
    :class="['danger-badge', `danger-${level}`, { 'compact': !showText }]"
    :title="dangerText"
  >
    <span v-if="showText" class="danger-level">{{ level }}</span>
    <span v-if="showText" class="danger-name">{{ dangerName }}</span>
  </div>
  <div v-else class="danger-badge danger-unknown">
    <span class="danger-name">{{ $t('danger.unknown') }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  level: {
    type: Number,
    default: null
  },
  showText: {
    type: Boolean,
    default: true
  }
});

const { t } = useI18n();

const dangerLevelKeys = {
  1: 'low',
  2: 'moderate',
  3: 'considerable',
  4: 'high',
  5: 'veryHigh'
};

const dangerName = computed(() => {
  if (!props.level || !dangerLevelKeys[props.level]) return '';
  return props.showText ? t(`danger.${dangerLevelKeys[props.level]}`) : '';
});

const dangerText = computed(() => {
  if (!props.level) return t('danger.unknown');
  return `${t('danger.level')} ${props.level} - ${t(`danger.${dangerLevelKeys[props.level]}`)}`;
});
</script>

<style scoped>
.danger-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.8rem;
}

.danger-level {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
}

.danger-name {
  letter-spacing: 0.01em;
  font-weight: 500;
}

/* Danger Level 1 - Low */
.danger-1 {
  background-color: #e8f5e9;
  color: #2e7d32;
}

/* Danger Level 2 - Moderate */
.danger-2 {
  background-color: #fff8e1;
  color: #f57f17;
}

/* Danger Level 3 - Considerable */
.danger-3 {
  background-color: #fff3e0;
  color: #e65100;
}

/* Danger Level 4 - High */
.danger-4 {
  background-color: #ffebee;
  color: #c62828;
}

/* Danger Level 5 - Very High */
.danger-5 {
  background-color: #fce4ec;
  color: #ad1457;
}

/* Unknown */
.danger-unknown {
  background-color: var(--color-background-tertiary);
  color: var(--color-text-secondary);
}

/* Compact mode - colored dot */
.danger-badge.compact {
  padding: 0;
  border-radius: 50%;
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
}

.danger-badge.compact.danger-1 {
  background-color: #4caf50;
}

.danger-badge.compact.danger-2 {
  background-color: #ffc107;
}

.danger-badge.compact.danger-3 {
  background-color: #ff9800;
}

.danger-badge.compact.danger-4 {
  background-color: #f44336;
}

.danger-badge.compact.danger-5 {
  background-color: #9c27b0;
}
</style>
