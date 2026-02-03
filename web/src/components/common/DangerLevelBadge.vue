<template>
  <div
    v-if="level"
    :class="['danger-badge', `danger-${level}`]"
    :title="dangerText"
  >
    <span class="danger-level">{{ level }}</span>
    <span class="danger-name">{{ dangerName }}</span>
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

const dangerLevels = {
  1: { name: 'Low', color: '#ccff66' },
  2: { name: 'Moderate', color: '#ffff00' },
  3: { name: 'Considerable', color: '#ff9900' },
  4: { name: 'High', color: '#ff0000' },
  5: { name: 'Very High', color: '#9d0000' }
};

const dangerName = computed(() => {
  if (!props.level || !dangerLevels[props.level]) return '';
  return props.showText ? dangerLevels[props.level].name : '';
});

const dangerText = computed(() => {
  if (!props.level) return t('danger.unknown');
  return `${t('danger.level')} ${props.level} - ${dangerLevels[props.level].name}`;
});
</script>

<style scoped>
.danger-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.danger-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s;
}

.danger-badge:hover::before {
  left: 100%;
}

.danger-level {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-size: 1rem;
  font-weight: 700;
  animation: levelPulse 2s ease-in-out infinite;
}

@keyframes levelPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.danger-name {
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-weight: 700;
}

/* Danger Level 1 - Low */
.danger-1 {
  background-color: var(--danger-1);
  color: var(--danger-1-text);
  border: 2px solid rgba(0, 0, 0, 0.1);
}

/* Danger Level 2 - Moderate */
.danger-2 {
  background-color: var(--danger-2);
  color: var(--danger-2-text);
  border: 2px solid rgba(0, 0, 0, 0.1);
}

/* Danger Level 3 - Considerable */
.danger-3 {
  background-color: var(--danger-3);
  color: var(--danger-3-text);
  border: 2px solid rgba(0, 0, 0, 0.1);
  animation: warningPulse 2s ease-in-out infinite;
}

@keyframes warningPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(255, 153, 0, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(255, 153, 0, 0.5);
  }
}

/* Danger Level 4 - High */
.danger-4 {
  background-color: var(--danger-4);
  color: var(--danger-4-text);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: dangerPulse 1.5s ease-in-out infinite;
}

@keyframes dangerPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(255, 0, 0, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 6px 20px rgba(255, 0, 0, 0.6);
    transform: scale(1.02);
  }
}

/* Danger Level 5 - Very High */
.danger-5 {
  background-color: var(--danger-5);
  color: var(--danger-5-text);
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: criticalPulse 1s ease-in-out infinite;
}

@keyframes criticalPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(157, 0, 0, 0.5),
                0 0 20px rgba(255, 0, 0, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 6px 24px rgba(157, 0, 0, 0.7),
                0 0 30px rgba(255, 0, 0, 0.5);
    transform: scale(1.03);
  }
}

/* Unknown */
.danger-unknown {
  background-color: var(--color-background-tertiary);
  color: var(--color-text-secondary);
  border: 2px solid var(--color-border);
  animation: none;
}

/* Hover effects */
.danger-badge:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

/* Accessibility: Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .danger-badge,
  .danger-level,
  .danger-3,
  .danger-4,
  .danger-5 {
    animation: none;
  }

  .danger-badge::before {
    display: none;
  }
}
</style>
