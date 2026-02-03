<template>
  <div class="alert-rule-list">
    <!-- Empty State -->
    <div v-if="rules.length === 0" class="empty-state">
      <div class="empty-icon">🔔</div>
      <h3 class="empty-title">{{ $t('alerts.noRules') }}</h3>
      <p class="empty-text">{{ $t('alerts.noRulesDescription') }}</p>
    </div>

    <!-- Rules List -->
    <div v-else class="rules-grid">
      <div
        v-for="rule in rules"
        :key="rule.id"
        class="rule-card"
        :class="{ 'rule-inactive': !rule.is_active }"
      >
        <!-- Rule Header -->
        <div class="rule-header">
          <div class="rule-title">
            <h3 class="rule-resort-name">
              {{ rule.resort ? rule.resort.name : $t('alerts.allResorts') }}
            </h3>
            <span
              class="rule-status-badge"
              :class="rule.is_active ? 'badge-active' : 'badge-inactive'"
            >
              {{ rule.is_active ? $t('alerts.active') : $t('alerts.inactive') }}
            </span>
          </div>

          <!-- Rule Actions -->
          <div class="rule-actions">
            <button
              @click="$emit('toggle', rule.id)"
              class="action-btn"
              :title="rule.is_active ? $t('alerts.deactivate') : $t('alerts.activate')"
            >
              {{ rule.is_active ? '⏸️' : '▶️' }}
            </button>
            <button
              @click="$emit('edit', rule)"
              class="action-btn"
              :title="$t('common.edit')"
            >
              ✏️
            </button>
            <button
              @click="$emit('delete', rule.id)"
              class="action-btn action-btn-danger"
              :title="$t('common.delete')"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Rule Details -->
        <div class="rule-details">
          <!-- Trigger Conditions -->
          <div class="detail-section">
            <h4 class="detail-label">{{ $t('alerts.triggers') }}:</h4>
            <div class="detail-value">
              <span v-if="rule.on_increase" class="trigger-badge trigger-increase">
                ↗ {{ $t('alerts.increase') }}
              </span>
              <span v-if="rule.on_decrease" class="trigger-badge trigger-decrease">
                ↘ {{ $t('alerts.decrease') }}
              </span>
            </div>
          </div>

          <!-- Danger Level Range -->
          <div v-if="rule.min_danger_level || rule.max_danger_level" class="detail-section">
            <h4 class="detail-label">{{ $t('alerts.dangerRange') }}:</h4>
            <div class="detail-value">
              <span class="level-range">
                <span v-if="rule.min_danger_level">
                  {{ $t('alerts.min') }}: <strong>{{ rule.min_danger_level }}</strong>
                </span>
                <span v-if="rule.min_danger_level && rule.max_danger_level">•</span>
                <span v-if="rule.max_danger_level">
                  {{ $t('alerts.max') }}: <strong>{{ rule.max_danger_level }}</strong>
                </span>
              </span>
            </div>
          </div>

          <!-- Daily Reminder -->
          <div v-if="rule.daily_reminder_enabled" class="detail-section">
            <h4 class="detail-label">{{ $t('alerts.dailyReminder') }}:</h4>
            <div class="detail-value">
              <span class="reminder-time">🕐 {{ rule.daily_reminder_time }}</span>
              <div v-if="rule.active_days && rule.active_days.length > 0" class="active-days">
                <span
                  v-for="day in rule.active_days"
                  :key="day"
                  class="day-badge"
                >
                  {{ $t(`alerts.days.${day}Short`) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="rule-meta">
            <span class="meta-item">
              {{ $t('alerts.created') }}: {{ formatDate(rule.created_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format, parseISO } from 'date-fns';

defineProps({
  rules: {
    type: Array,
    required: true,
  },
});

defineEmits(['edit', 'delete', 'toggle']);

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'dd.MM.yyyy');
  } catch (error) {
    return dateString;
  }
};
</script>

<style scoped>
.alert-rule-list {
  padding: var(--spacing-md);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-text {
  font-size: 0.875rem;
  max-width: 400px;
  margin: 0 auto;
}

/* Rules Grid */
.rules-grid {
  display: grid;
  gap: var(--spacing-md);
}

/* Rule Card */
.rule-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-base);
}

.rule-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-alpha);
}

.rule-inactive {
  opacity: 0.6;
}

/* Rule Header */
.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.rule-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.rule-resort-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.rule-status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-active {
  background-color: var(--color-success-alpha);
  color: var(--color-success);
}

.badge-inactive {
  background-color: var(--color-text-tertiary);
  color: var(--color-text-secondary);
}

/* Rule Actions */
.rule-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.action-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--transition-base);
}

.action-btn:hover {
  background-color: var(--color-surface);
  transform: scale(1.05);
}

.action-btn-danger:hover {
  background-color: var(--color-danger-alpha);
  border-color: var(--color-danger);
}

/* Rule Details */
.rule-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  margin: 0;
}

.detail-value {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  align-items: center;
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

/* Trigger Badges */
.trigger-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
}

.trigger-increase {
  background-color: var(--color-warning-alpha);
  color: var(--color-warning);
}

.trigger-decrease {
  background-color: var(--color-info-alpha);
  color: var(--color-info);
}

/* Level Range */
.level-range {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

/* Reminder Info */
.reminder-time {
  font-weight: 600;
}

.active-days {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.day-badge {
  padding: 2px 6px;
  background-color: var(--color-primary-alpha);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

/* Rule Metadata */
.rule-meta {
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.meta-item {
  display: inline-block;
}

@media (max-width: 768px) {
  .rule-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .rule-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
