<template>
  <div class="run-status-widget">
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="runStatusData" class="run-status-content">
      <!-- Header -->
      <div class="status-header">
        <h3>{{ $t('runStatus.title', 'Runs & Lifts Status') }}</h3>
        <span v-if="lastUpdated" class="last-updated">
          {{ $t('runStatus.updated') }}: {{ formatTime(lastUpdated) }}
        </span>
      </div>

      <!-- Summary Cards -->
      <div class="status-summary">
        <!-- Runs -->
        <div class="status-card runs">
          <div class="card-icon">⛷️</div>
          <div class="card-content">
            <h4>{{ $t('runStatus.runs', 'Runs') }}</h4>
            <div class="progress-circle-container">
              <svg class="progress-circle" viewBox="0 0 100 100">
                <circle
                  class="progress-bg"
                  cx="50"
                  cy="50"
                  r="40"
                />
                <circle
                  class="progress-bar"
                  cx="50"
                  cy="50"
                  r="40"
                  :stroke-dasharray="`${circumference}`"
                  :stroke-dashoffset="runsOffset"
                />
              </svg>
              <div class="progress-text">
                <span class="percentage">{{ runsPercentage }}%</span>
                <span class="count">{{ openRuns }}/{{ totalRuns }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lifts -->
        <div class="status-card lifts">
          <div class="card-icon">🚡</div>
          <div class="card-content">
            <h4>{{ $t('runStatus.lifts', 'Lifts') }}</h4>
            <div class="progress-circle-container">
              <svg class="progress-circle" viewBox="0 0 100 100">
                <circle
                  class="progress-bg"
                  cx="50"
                  cy="50"
                  r="40"
                />
                <circle
                  class="progress-bar"
                  cx="50"
                  cy="50"
                  r="40"
                  :stroke-dasharray="`${circumference}`"
                  :stroke-dashoffset="liftsOffset"
                />
              </svg>
              <div class="progress-text">
                <span class="percentage">{{ liftsPercentage }}%</span>
                <span class="count">{{ openLifts }}/{{ totalLifts }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Lists -->
      <div v-if="runDetails && runDetails.length > 0" class="details-section">
        <h4>{{ $t('runStatus.runDetails', 'Run Details') }}</h4>
        <div class="details-list">
          <div
            v-for="(run, index) in runDetails"
            :key="index"
            :class="['detail-item', run.status]"
          >
            <span :class="['difficulty-badge', run.difficulty]">
              {{ getDifficultyIcon(run.difficulty) }}
            </span>
            <span class="item-name">{{ run.name }}</span>
            <span :class="['status-badge', run.status]">
              {{ $t(`runStatus.${run.status}`, run.status) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="liftDetails && liftDetails.length > 0" class="details-section">
        <h4>{{ $t('runStatus.liftDetails', 'Lift Details') }}</h4>
        <div class="details-list">
          <div
            v-for="(lift, index) in liftDetails"
            :key="index"
            :class="['detail-item', lift.status]"
          >
            <span class="item-icon">🚡</span>
            <span class="item-name">{{ lift.name }}</span>
            <span v-if="lift.type" class="item-type">{{ lift.type }}</span>
            <span :class="['status-badge', lift.status]">
              {{ $t(`runStatus.${lift.status}`, lift.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, parseISO } from 'date-fns';

const props = defineProps({
  runStatusData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const { t } = useI18n();

const circumference = 2 * Math.PI * 40; // r=40

const totalRuns = computed(() => props.runStatusData?.status?.total_runs || 0);
const openRuns = computed(() => props.runStatusData?.status?.open_runs || 0);
const runsPercentage = computed(() => props.runStatusData?.status?.runs_percentage || 0);

const totalLifts = computed(() => props.runStatusData?.status?.total_lifts || 0);
const openLifts = computed(() => props.runStatusData?.status?.open_lifts || 0);
const liftsPercentage = computed(() => props.runStatusData?.status?.lifts_percentage || 0);

const runDetails = computed(() => props.runStatusData?.status?.run_details || []);
const liftDetails = computed(() => props.runStatusData?.status?.lift_details || []);
const lastUpdated = computed(() => props.runStatusData?.status?.last_updated || null);

const runsOffset = computed(() => {
  const progress = runsPercentage.value / 100;
  return circumference * (1 - progress);
});

const liftsOffset = computed(() => {
  const progress = liftsPercentage.value / 100;
  return circumference * (1 - progress);
});

const getDifficultyIcon = (difficulty) => {
  const icons = {
    green: '●',
    blue: '●',
    red: '●',
    black: '●'
  };
  return icons[difficulty] || '●';
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = parseISO(isoString);
    return format(date, 'HH:mm');
  } catch {
    return '';
  }
};
</script>

<style scoped>
.run-status-widget {
  background: var(--card-background);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
}

.loading,
.error {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-danger);
}

.run-status-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.status-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.last-updated {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.status-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.status-card {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  transition: all var(--transition-base);
}

.status-card:hover {
  background: var(--color-background-tertiary);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.card-icon {
  font-size: 2rem;
}

.card-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.card-content h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.progress-circle-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-circle {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.progress-bg {
  fill: none;
  stroke: var(--color-border);
  stroke-width: 8;
}

.progress-bar {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.count {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.details-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.details-section h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-primary);
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.detail-item:hover {
  background: var(--color-background-tertiary);
  transform: translateX(4px);
}

.detail-item.open {
  border-left: 3px solid var(--color-success);
}

.detail-item.closed {
  border-left: 3px solid var(--color-danger);
  opacity: 0.7;
}

.difficulty-badge {
  font-size: 1rem;
  font-weight: bold;
}

.difficulty-badge.green {
  color: #22c55e;
}

.difficulty-badge.blue {
  color: #3b82f6;
}

.difficulty-badge.red {
  color: #ef4444;
}

.difficulty-badge.black {
  color: #1f2937;
}

.item-icon {
  font-size: 1.125rem;
}

.item-name {
  flex: 1;
  font-weight: 600;
  color: var(--color-text-primary);
}

.item-type {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  padding: 2px 6px;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-sm);
}

.status-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.open {
  background: var(--color-success);
  color: white;
}

.status-badge.closed {
  background: var(--color-danger);
  color: white;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .run-status-widget {
    padding: var(--spacing-lg);
  }

  .status-summary {
    grid-template-columns: 1fr;
  }

  .progress-circle-container {
    width: 100px;
    height: 100px;
  }

  .percentage {
    font-size: 1.25rem;
  }
}
</style>
