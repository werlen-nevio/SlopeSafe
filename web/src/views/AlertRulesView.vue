<template>
  <div class="alert-rules-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ $t('alerts.title') }}</h1>
        <p class="page-description">{{ $t('alerts.description') }}</p>
      </div>
      <button
        v-if="!showForm"
        @click="startCreateRule"
        class="btn btn-primary"
      >
        + {{ $t('alerts.createRule') }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="alertsStore.error" class="error-banner">
      <span>⚠️ {{ alertsStore.error }}</span>
      <button @click="alertsStore.clearError()" class="error-close">×</button>
    </div>

    <!-- Create/Edit Form -->
    <div v-if="showForm" class="form-container">
      <div class="form-header">
        <h2 class="form-title">
          {{ editingRule ? $t('alerts.editRule') : $t('alerts.createNewRule') }}
        </h2>
      </div>

      <AlertRuleForm
        :initial-data="editingRule"
        :loading="alertsStore.loading"
        @submit="handleFormSubmit"
        @cancel="cancelForm"
      />
    </div>

    <!-- Rules List -->
    <div v-if="!showForm" class="rules-container">
      <!-- Loading State -->
      <div v-if="alertsStore.loading && alertsStore.alertRules.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}...</p>
      </div>

      <!-- Rules List -->
      <AlertRuleList
        v-else
        :rules="alertsStore.alertRules"
        @edit="startEditRule"
        @delete="confirmDeleteRule"
        @toggle="handleToggleRule"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">{{ $t('alerts.confirmDelete') }}</h3>
        <p class="modal-text">{{ $t('alerts.confirmDeleteDescription') }}</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-secondary">
            {{ $t('common.cancel') }}
          </button>
          <button @click="executeDelete" class="btn btn-danger">
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAlertsStore } from '../stores/alerts';
import { useI18n } from 'vue-i18n';
import AlertRuleForm from '../components/alerts/AlertRuleForm.vue';
import AlertRuleList from '../components/alerts/AlertRuleList.vue';

const { t } = useI18n();
const alertsStore = useAlertsStore();

// Component state
const showForm = ref(false);
const editingRule = ref(null);
const showDeleteModal = ref(false);
const ruleToDelete = ref(null);

// Load alert rules on mount
onMounted(async () => {
  await alertsStore.fetchAlertRules();
});

// Start creating a new rule
const startCreateRule = () => {
  editingRule.value = null;
  showForm.value = true;
};

// Start editing an existing rule
const startEditRule = (rule) => {
  editingRule.value = rule;
  showForm.value = true;
};

// Cancel form (create or edit)
const cancelForm = () => {
  showForm.value = false;
  editingRule.value = null;
};

// Handle form submission (create or update)
const handleFormSubmit = async (formData) => {
  try {
    if (editingRule.value) {
      // Update existing rule
      await alertsStore.updateAlertRule(editingRule.value.id, formData);
    } else {
      // Create new rule
      await alertsStore.createAlertRule(formData);
    }

    // Close form on success
    cancelForm();
  } catch (error) {
    // Error is handled by the store
    console.error('Failed to save alert rule:', error);
  }
};

// Confirm delete rule
const confirmDeleteRule = (ruleId) => {
  ruleToDelete.value = ruleId;
  showDeleteModal.value = true;
};

// Cancel delete
const cancelDelete = () => {
  showDeleteModal.value = false;
  ruleToDelete.value = null;
};

// Execute delete
const executeDelete = async () => {
  if (!ruleToDelete.value) return;

  try {
    await alertsStore.deleteAlertRule(ruleToDelete.value);
    cancelDelete();
  } catch (error) {
    // Error is handled by the store
    console.error('Failed to delete alert rule:', error);
  }
};

// Toggle rule active status
const handleToggleRule = async (ruleId) => {
  try {
    await alertsStore.toggleAlertRule(ruleId);
  } catch (error) {
    // Error is handled by the store
    console.error('Failed to toggle alert rule:', error);
  }
};
</script>

<style scoped>
.alert-rules-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-md);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.page-description {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Error Banner */
.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  background-color: var(--color-danger-alpha);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 0.875rem;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-danger);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-close:hover {
  opacity: 0.7;
}

/* Form Container */
.form-container {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
}

.form-header {
  padding: var(--spacing-lg);
  background-color: var(--color-surface-variant);
  border-bottom: 1px solid var(--color-border);
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

/* Rules Container */
.rules-container {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Buttons */
.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
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

.btn-danger {
  background-color: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background-color: var(--color-danger-dark);
}

/* Delete Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-content {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.modal-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .alert-rules-view {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions .btn {
    width: 100%;
  }
}
</style>
