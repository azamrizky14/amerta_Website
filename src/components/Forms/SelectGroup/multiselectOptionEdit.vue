<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';

interface Option {
  id: number;
  name: string;
}

let props = defineProps<{
  options: Option[]; // Available options
  modelValue: Option[]; // Selected options from the parent
  placeholder?: string; // Placeholder text
  value?: string; // Parent prop for the search query
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Option[]): void;
}>();

const searchQuery = ref(props.value || ''); // Search query
const isOpen = ref(false);
const selectedOptions = ref<Option[]>([]); // Initialize empty

const updateSelectedOptions = () => {
  if (!props.modelValue || !props.options) return;
  selectedOptions.value = props.options.filter((option) =>
    props.modelValue.some((selected) => selected.name === option.name)
  );
};


// Watch for changes in parent-provided modelValue and options
watch(
  () => props.modelValue,
  updateSelectedOptions,
  { immediate: true, deep: true } // React to changes immediately
);

watch(
  () => props.options,
  updateSelectedOptions,
  { immediate: true, deep: true } // React to changes immediately
);

// Filter options based on the search query
const filteredOptions = computed(() =>
  props.options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

// Handle toggling selection of an option
const toggleSelection = (option: Option) => {
  const index = selectedOptions.value.findIndex((o) => o.name === option.name);
  if (index > -1) {
    selectedOptions.value.splice(index, 1);
  } else {
    selectedOptions.value.push(option);
  }
  emit('update:modelValue', selectedOptions.value);
};


// Check if an option is selected
const isSelected = (option: Option) =>
  selectedOptions.value.some((o) => o.name === option.name);

// Handle closing the dropdown when clicking outside
const dropdownRef = ref(null);
onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});
</script>

<template>
  <div class="relative w-full" ref="dropdownRef">
    <!-- Selected Items -->
    <div
      :class="props.disabled ? 'bg-whiter' : ''"
      class="border-[1.5px] rounded-lg p-3 cursor-pointer text-black bg-transparent transition focus:border-primary dark:text-white dark:bg-form-input"
      @click="isOpen = !isOpen"
    >
      <div class="flex flex-wrap gap-2">
        <template v-if="selectedOptions.length">
          <span
            v-for="item in selectedOptions"
            :key="item.id"
            class="bg-primary text-white rounded px-3 py-1 text-sm"
          >
            {{ item.name }}
          </span>
        </template>
        <span v-else class="text-gray-500">
          <span v-if="props.placeholder">{{ props.placeholder }}</span>
          <span v-else>Select options...</span>
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
            @click="toggleSelection(option)"
            class="cursor-pointer p-3 hover:bg-gray-100 flex items-center transition-colors dark:hover:bg-gray-700"
          >
            <input
              type="checkbox"
              :checked="isSelected(option)"
              class="mr-3 cursor-pointer"
              readonly
            />
            {{ option.name }}
          </div>
        </template>
        <p v-else class="p-3 text-gray-500">No options found</p>
      </div>
    </div>
  </div>
</template>
