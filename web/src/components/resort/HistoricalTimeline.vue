<template>
  <div class="historical-timeline">
    <div class="timeline-header">
      <div class="header-content">
        <h3>{{ $t('historical.title', 'Danger Level History') }}</h3>
        <TrendIndicator
          v-if="trend"
          :trend="trend"
          :change="change"
          :show-text="true"
        />
      </div>
      <div class="time-selector">
        <button
          v-for="option in timeOptions"
          :key="option.days"
          @click="selectDays(option.days)"
          :class="['time-btn', { active: selectedDays === option.days }]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="chartData" class="timeline-content">
      <div class="chart-container">
        <LineChart
          :data="chartData"
          :options="chartOptions"
          :height="300"
        />
      </div>

      <div class="timeline-details">
        <h4>{{ $t('historical.recentChanges', 'Recent Changes') }}</h4>
        <div class="timeline-list">
          <div
            v-for="(day, index) in recentHistory"
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-date">
              <span class="date-text">{{ formatDate(day.date) }}</span>
            </div>
            <div class="timeline-badge">
              <DangerLevelBadge :level="day.danger_level_max" :show-text="false" />
            </div>
            <div class="timeline-info">
              <div class="danger-levels">
                <span class="level-label">{{ $t('resort.dangerMax') }}:</span>
                <span class="level-value">{{ day.danger_level_max || '-' }}</span>
                <span v-if="day.danger_level_high" class="level-detail">
                  ({{ $t('resort.dangerLow') }}: {{ day.danger_level_low }},
                  {{ $t('resort.dangerHigh') }}: {{ day.danger_level_high }})
                </span>
              </div>
              <div v-if="day.avalanche_problems && day.avalanche_problems.length > 0" class="problems">
                <span class="problems-label">{{ $t('resort.avalancheProblems') }}:</span>
                <span class="problems-list">
                  {{ formatProblems(day.avalanche_problems) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { format } from 'date-fns';
import LineChart from '@/components/common/LineChart.vue';
import TrendIndicator from '@/components/common/TrendIndicator.vue';
import DangerLevelBadge from '@/components/common/DangerLevelBadge.vue';

const props = defineProps({
  history: {
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

const emit = defineEmits(['update:days']);

const { t } = useI18n();

const timeOptions = [
  { days: 7, label: '7d' },
  { days: 14, label: '14d' },
  { days: 30, label: '30d' }
];

const selectedDays = ref(7);

const trend = computed(() => props.history?.trend || null);
const change = computed(() => props.history?.change || 0);
const chartData = computed(() => props.history?.chart_data || null);

const recentHistory = computed(() => {
  if (!props.history?.history) return [];
  return props.history.history.slice(0, 5); // Show only the 5 most recent entries
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    y: {
      min: 0,
      max: 5,
      ticks: {
        stepSize: 1
      },
      title: {
        display: true,
        text: t('danger.level', 'Danger Level')
      }
    },
    x: {
      title: {
        display: true,
        text: t('common.date', 'Date')
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
};

const selectDays = (days) => {
  selectedDays.value = days;
  emit('update:days', days);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy');
};

const formatProblems = (problems) => {
  if (!problems || problems.length === 0) return '';
  return problems.map(p => t(`avalancheTypes.${p.type}`, p.type?.replace(/_/g, ' ') || '')).join(', ');
};
</script>

<style scoped>
.historical-timeline {
  background: var(--card-background);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
  min-width: 0;
  overflow: hidden;
}

.timeline-header {
  margin-bottom: var(--spacing-xl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.header-content h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.time-selector {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.time-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.time-btn:hover {
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
}

.time-btn.active {
  background: var(--color-primary);
  color: white;
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

.chart-container {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  min-width: 0;
  overflow: hidden;
}

.timeline-details h4 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-primary);
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.timeline-item {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
  align-items: center;
}

.timeline-item:hover {
  background: var(--color-background-tertiary);
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.timeline-date {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.date-text {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.timeline-badge {
  display: flex;
  align-items: center;
}

.timeline-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
  overflow: hidden;
}

.danger-levels {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.level-label {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.level-value {
  font-weight: 700;
  color: var(--color-text-primary);
  font-size: 1rem;
}

.level-detail {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.problems {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.problems-label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.problems-list {
  color: var(--color-text-primary);
  text-transform: capitalize;
  word-break: break-word;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .historical-timeline {
    padding: var(--spacing-lg);
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-item {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .timeline-date {
    min-width: auto;
  }

  .time-selector {
    width: 100%;
    justify-content: space-between;
  }

  .time-btn {
    min-width: var(--touch-target-min);
    min-height: var(--touch-target-min);
    padding: var(--spacing-sm);
  }
}

@media (max-width: 360px) {
  .historical-timeline {
    padding: var(--spacing-md);
  }

  .header-content h3 {
    font-size: 1.25rem;
  }

  .timeline-details h4 {
    font-size: 1rem;
  }

  .chart-container {
    padding: var(--spacing-sm);
  }

  .timeline-item {
    padding: var(--spacing-sm);
  }

  .date-text {
    font-size: 0.8125rem;
  }

  .level-value {
    font-size: 0.875rem;
  }
}
</style>
