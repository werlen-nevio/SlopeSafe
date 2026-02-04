<template>
  <div class="custom-select" :class="{ 'is-open': isOpen, 'is-disabled': disabled }" ref="selectRef">
    <button
      type="button"
      class="custom-select-trigger"
      @click="toggle"
      @keydown="handleKeydown"
      :disabled="disabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      <span class="custom-select-value">{{ displayValue }}</span>
      <svg class="custom-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="custom-select-dropdown" role="listbox">
        <div
          v-for="option in options"
          :key="option.value"
          class="custom-select-option"
          :class="{
            'is-selected': option.value === modelValue,
            'is-focused': option.value === focusedValue
          }"
          @click="selectOption(option)"
          @mouseenter="focusedValue = option.value"
          role="option"
          :aria-selected="option.value === modelValue"
        >
          <span class="option-label">{{ option.label }}</span>
          <svg v-if="option.value === modelValue" class="option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: null
  },
  options: {
    type: Array,
    required: true
    // Expected format: [{ value: 'x', label: 'Label' }, ...]
  },
  placeholder: {
    type: String,
    default: 'Select...'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const focusedValue = ref(null);
const selectRef = ref(null);

const displayValue = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : props.placeholder;
});

const toggle = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      focusedValue.value = props.modelValue;
    }
  }
};

const selectOption = (option) => {
  emit('update:modelValue', option.value);
  emit('change', option.value);
  isOpen.value = false;
};

const handleKeydown = (e) => {
  if (props.disabled) return;

  const currentIndex = props.options.findIndex(opt => opt.value === focusedValue.value);

  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (isOpen.value && focusedValue.value !== null) {
        const option = props.options.find(opt => opt.value === focusedValue.value);
        if (option) selectOption(option);
      } else {
        toggle();
      }
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (!isOpen.value) {
        isOpen.value = true;
        focusedValue.value = props.modelValue || props.options[0]?.value;
      } else if (currentIndex < props.options.length - 1) {
        focusedValue.value = props.options[currentIndex + 1].value;
      }
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (isOpen.value && currentIndex > 0) {
        focusedValue.value = props.options[currentIndex - 1].value;
      }
      break;
    case 'Escape':
      isOpen.value = false;
      break;
  }
};

const handleClickOutside = (e) => {
  if (selectRef.value && !selectRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}

.custom-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 14px;
  background-color: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border, #E2E8F0);
  border-radius: var(--radius-md, 8px);
  color: var(--color-text-primary, #1B3B5F);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  text-align: left;
}

.custom-select-trigger:hover:not(:disabled) {
  border-color: var(--color-primary, #5BA4D4);
  box-shadow: 0 2px 4px rgba(91, 164, 212, 0.1);
}

.custom-select.is-open .custom-select-trigger {
  border-color: var(--color-primary, #5BA4D4);
  box-shadow: 0 0 0 3px rgba(91, 164, 212, 0.15), 0 2px 4px rgba(91, 164, 212, 0.1);
}

.custom-select-trigger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-surface-variant, #F8FAFC);
}

.custom-select-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-select-arrow {
  width: 18px;
  height: 18px;
  margin-left: 8px;
  color: var(--color-text-secondary, #64748B);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.custom-select.is-open .custom-select-arrow {
  transform: rotate(180deg);
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background-color: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border, #E2E8F0);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  overflow: hidden;
  max-height: 280px;
  overflow-y: auto;
}

.custom-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--color-text-primary, #1B3B5F);
  font-size: 0.9375rem;
}

.custom-select-option:hover,
.custom-select-option.is-focused {
  background-color: var(--color-primary-light, #EBF5FB);
}

.custom-select-option.is-selected {
  background-color: var(--color-primary-light, #EBF5FB);
  color: var(--color-primary, #5BA4D4);
  font-weight: 600;
}

.custom-select-option.is-selected:hover {
  background-color: #DCF0FA;
}

.option-label {
  flex: 1;
}

.option-check {
  width: 16px;
  height: 16px;
  color: var(--color-primary, #5BA4D4);
  flex-shrink: 0;
  margin-left: 8px;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Scrollbar styling */
.custom-select-dropdown::-webkit-scrollbar {
  width: 6px;
}

.custom-select-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.custom-select-dropdown::-webkit-scrollbar-thumb {
  background-color: var(--color-border, #E2E8F0);
  border-radius: 3px;
}

.custom-select-dropdown::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-tertiary, #94A3B8);
}
</style>
