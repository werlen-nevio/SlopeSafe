<template>
  <div class="alert-rule-form">
    <form @submit.prevent="handleSubmit">
      <!-- Resort Selection -->
      <div class="form-group">
        <label class="form-label">
          {{ $t('alerts.resort') }}
        </label>
        <CustomSelect
          v-model="formData.ski_resort_id"
          :options="resortOptions"
          :placeholder="$t('alerts.allResorts')"
        />
      </div>

      <!-- Alert Triggers -->
      <div class="form-group">
        <label class="form-label">{{ $t('alerts.triggerOn') }}</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.on_increase"
              class="checkbox-input"
            />
            <span>{{ $t('alerts.onIncrease') }}</span>
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.on_decrease"
              class="checkbox-input"
            />
            <span>{{ $t('alerts.onDecrease') }}</span>
          </label>
        </div>
      </div>

      <!-- Danger Level Thresholds -->
      <div class="form-group">
        <label class="form-label">{{ $t('alerts.dangerLevelRange') }}</label>
        <div class="range-inputs">
          <div class="range-input-group">
            <label class="range-label">
              {{ $t('alerts.minLevel') }}
            </label>
            <CustomSelect
              v-model="formData.min_danger_level"
              :options="dangerLevelOptions"
              :placeholder="$t('alerts.noLimit')"
            />
          </div>

          <div class="range-input-group">
            <label class="range-label">
              {{ $t('alerts.maxLevel') }}
            </label>
            <CustomSelect
              v-model="formData.max_danger_level"
              :options="dangerLevelOptions"
              :placeholder="$t('alerts.noLimit')"
            />
          </div>
        </div>
      </div>

      <!-- Daily Reminder -->
      <div class="form-group">
        <label class="checkbox-label checkbox-label-primary">
          <input
            type="checkbox"
            v-model="formData.daily_reminder_enabled"
            class="checkbox-input"
          />
          <span>{{ $t('alerts.enableDailyReminder') }}</span>
        </label>

        <div v-if="formData.daily_reminder_enabled" class="daily-reminder-settings">
          <!-- Reminder Time -->
          <div class="form-group-sm">
            <label for="reminder-time" class="form-label">
              {{ $t('alerts.reminderTime') }}
            </label>
            <input
              id="reminder-time"
              type="time"
              v-model="formData.daily_reminder_time"
              class="form-input-time"
            />
          </div>

          <!-- Active Days -->
          <div class="form-group-sm">
            <label class="form-label">{{ $t('alerts.activeDays') }}</label>
            <div class="days-grid">
              <label
                v-for="day in weekDays"
                :key="day.value"
                class="day-checkbox"
              >
                <input
                  type="checkbox"
                  :value="day.value"
                  v-model="formData.active_days"
                  class="checkbox-input"
                />
                <span class="day-label">{{ day.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Status -->
      <div class="form-group">
        <label class="checkbox-label checkbox-label-primary">
          <input
            type="checkbox"
            v-model="formData.is_active"
            class="checkbox-input"
          />
          <span>{{ $t('alerts.ruleActive') }}</span>
        </label>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          type="button"
          @click="$emit('cancel')"
          class="btn btn-secondary"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="!isFormValid || loading"
          class="btn btn-primary"
        >
          {{ loading ? $t('common.saving') : (isEditing ? $t('common.update') : $t('common.create')) }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useResortsStore } from '../../stores/resorts';
import CustomSelect from '../common/CustomSelect.vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const { t } = useI18n();
const resortsStore = useResortsStore();

// Form data
const formData = ref({
  ski_resort_id: null,
  on_increase: true,
  on_decrease: false,
  min_danger_level: null,
  max_danger_level: null,
  daily_reminder_time: '07:00',
  daily_reminder_enabled: false,
  active_days: [],
  is_active: true,
});

// Week days for selection
const weekDays = computed(() => [
  { value: 'monday', label: t('alerts.days.monday') },
  { value: 'tuesday', label: t('alerts.days.tuesday') },
  { value: 'wednesday', label: t('alerts.days.wednesday') },
  { value: 'thursday', label: t('alerts.days.thursday') },
  { value: 'friday', label: t('alerts.days.friday') },
  { value: 'saturday', label: t('alerts.days.saturday') },
  { value: 'sunday', label: t('alerts.days.sunday') },
]);

// Check if editing existing rule
const isEditing = computed(() => props.initialData !== null);

// Form validation
const isFormValid = computed(() => {
  // At least one trigger must be selected
  if (!formData.value.on_increase && !formData.value.on_decrease) {
    return false;
  }

  // If daily reminder is enabled, time and at least one day must be selected
  if (formData.value.daily_reminder_enabled) {
    if (!formData.value.daily_reminder_time || formData.value.active_days.length === 0) {
      return false;
    }
  }

  return true;
});

// Resorts list
const resorts = computed(() => resortsStore.resorts);

const resortOptions = computed(() => [
  { value: null, label: t('alerts.allResorts') },
  ...resorts.value.map(resort => ({
    value: resort.id,
    label: resort.name
  }))
]);

const dangerLevelOptions = computed(() => [
  { value: 1, label: `1 - ${t('danger.levels.1')}` },
  { value: 2, label: `2 - ${t('danger.levels.2')}` },
  { value: 3, label: `3 - ${t('danger.levels.3')}` },
  { value: 4, label: `4 - ${t('danger.levels.4')}` },
  { value: 5, label: `5 - ${t('danger.levels.5')}` }
]);

// Load resorts on mount
onMounted(async () => {
  if (resorts.value.length === 0) {
    await resortsStore.fetchResorts();
  }
});

// Initialize form with initial data if provided
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = {
      ski_resort_id: newData.ski_resort_id || null,
      on_increase: newData.on_increase ?? true,
      on_decrease: newData.on_decrease ?? false,
      min_danger_level: newData.min_danger_level || null,
      max_danger_level: newData.max_danger_level || null,
      daily_reminder_time: newData.daily_reminder_time || '07:00',
      daily_reminder_enabled: newData.daily_reminder_enabled ?? false,
      active_days: newData.active_days || [],
      is_active: newData.is_active ?? true,
    };
  }
}, { immediate: true });

// Handle form submission
const handleSubmit = () => {
  if (!isFormValid.value) return;

  // Prepare data for submission
  const submitData = {
    ...formData.value,
    // Ensure active_days is null if daily reminder is disabled
    active_days: formData.value.daily_reminder_enabled ? formData.value.active_days : null,
    daily_reminder_time: formData.value.daily_reminder_enabled ? formData.value.daily_reminder_time : null,
  };

  emit('submit', submitData);
};
</script>

<style scoped>
.alert-rule-form {
  padding: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group-sm {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.range-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}


.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.checkbox-label-primary {
  font-weight: 600;
}

.checkbox-input {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.range-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.range-input-group {
  display: flex;
  flex-direction: column;
}

.daily-reminder-settings {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.form-input-time {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-base);
}

.form-input-time:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-sm);
}

.day-checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.day-checkbox:hover {
  background-color: var(--color-surface-variant);
}

.day-checkbox:has(input:checked) {
  background-color: var(--color-primary-alpha);
  border-color: var(--color-primary);
}

.day-label {
  font-size: 0.8125rem;
  white-space: nowrap;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-secondary {
  background-color: var(--color-surface-variant);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-surface);
}

@media (max-width: 768px) {
  .range-inputs {
    grid-template-columns: 1fr;
  }

  .days-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
