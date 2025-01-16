<script setup lang="ts">
import { ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core';

interface Option {
  label: string
  [key: string]: any
}

const props = defineProps<{
  options: Option[],
  modelValue: string | Option,
  placeholder?: string,
  disabled: boolean,
}>()

const emit = defineEmits(['update:modelValue', 'option-changed'])

const isOpen = ref(false)
const selectedLabel = ref(
  typeof props.modelValue === 'string'
    ? props.modelValue
    : props.modelValue?.label || ''
)

const toggleDropdown = () => {
  if (!props.disabled) isOpen.value = !isOpen.value
}

const selectOption = (option: Option) => {
  selectedLabel.value = option.label
  emit('update:modelValue', option)
  emit('option-changed', option) // Emit option-changed when an option is selected
  isOpen.value = false
}

// Watch for changes in modelValue and update selectedLabel
watch(() => props.modelValue, (newValue) => {
  selectedLabel.value = typeof newValue === 'string'
    ? newValue
    : newValue?.label || ''
}, { immediate: true })

// Handle closing the dropdown when clicking outside
const dropdownRef = ref(null);
onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <!-- Input box -->
    <div
      @click="toggleDropdown"
      :class="[
        'w-full rounded border-[1.5px] bg-transparent py-3 px-4 text-black transition dark:border-form-strokedark dark:bg-form-input dark:text-white',
        props.disabled ? 'cursor-not-allowed bg-gray-200' : 'cursor-pointer focus:border-primary active:border-primary'
      ]"
    >
  <span class="truncate block overflow-hidden whitespace-nowrap">
    {{ selectedLabel || props.placeholder || 'Select an option' }}
  </span>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-10 mt-1 w-full max-h-[200px] overflow-y-auto bg-white border rounded shadow-lg dark:bg-form-input dark:border-form-strokedark"
    >
      <div
        v-for="option in props.options"
        :key="option.label"
        @click="selectOption(option)"
        class="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>
