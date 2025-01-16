<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';

interface Option {
  id: number;
  name: string;
}

let props = defineProps<{
  options: Option[];
  modelValue: Option | null; // Single selection
  placeholder?: string;
  value?: string; // Parent prop for the search query
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Option | null): void;
  (e: 'data-change', value: Option | null): void; // Custom event for data changes
}>();

const searchQuery = ref(props.value || ''); // Initialize with the prop value
const isOpen = ref(false);
const selectedOption = ref<Option | null>(props.modelValue || null);

// Watch for changes in modelValue and update selectedOption
watch(
  () => props.modelValue,
  (newValue) => {
    selectedOption.value = newValue;
    searchQuery.value = ''; // Reset search query when modelValue changes
  },
  { immediate: true } // Run immediately to sync selectedOption on mount
);

// Filter options based on the search query
const filteredOptions = computed(() =>
  props.options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

// Select an option
const selectOption = (option: Option) => {
  selectedOption.value = option;
  emit('update:modelValue', option);
  emit('data-change', option); // Emit custom data-change event
  isOpen.value = false; // Close dropdown after selection
};

// Handle closing the dropdown when clicking outside
const dropdownRef = ref(null);
onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});
</script>

<template>
  <div class="relative w-full" ref="dropdownRef">
    <!-- Selected Item -->
    <div
      :class="props.disabled ? 'bg-whiter' : ''"
      class="border-[1.5px] rounded-lg p-3 cursor-pointer text-black bg-transparent transition focus:border-primary dark:text-white dark:bg-form-input"
      @click="!props.disabled && (isOpen = !isOpen)"
    >
      <div>
        <span v-if="selectedOption">
          {{ selectedOption.name }}
        </span>
        <span v-else class="text-gray-500">
          <span v-if="props.placeholder">{{ props.placeholder }}</span>
          <span v-else>Select an option...</span>
        </span>
      </div>
    </div>

    <!-- Dropdown with Search -->
    <div
      v-if="isOpen"
      class="absolute mt-2 bg-white border rounded-lg shadow-lg w-full z-10 dark:bg-form-input"
    >
      <!-- Search Input -->
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search..."
        class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary dark:text-white dark:bg-form-input"
      />

      <!-- Options List -->
      <div class="max-h-40 overflow-y-auto">
        <template v-if="filteredOptions.length">
          <div
            v-for="option in filteredOptions"
            :key="option.id"
            @click="selectOption(option)"
            class="cursor-pointer p-3 hover:bg-gray-100 flex items-center transition-colors dark:hover:bg-gray-700"
          >
            {{ option.name }}
          </div>
        </template>
        <p v-else class="p-3 text-gray-500">No options found</p>
      </div>
    </div>
  </div>
</template>
