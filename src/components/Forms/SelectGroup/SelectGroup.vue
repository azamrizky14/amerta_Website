<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'

interface Option {
  label: string
  value: string
}

// Define props and emits
const props = defineProps<{
  // label: string,
  options: Option[],
  modelValue: string,
  placeholder: string,
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// Local state for the selected option
const selectedOption = ref<string>(props.modelValue)

// Watch for changes in `modelValue` and update `selectedOption`
watch(() => props.modelValue, (newValue) => {
  selectedOption.value = newValue
})

// Update the parent when `selectedOption` changes
const updateSelection = () => {
  emit('update:modelValue', selectedOption.value)
}
</script>

<template>
  <div>
    <!-- <label class="mb-3 block text-sm font-medium text-black dark:text-white">
      <span v-if="props.label">{{ props.label }}</span>
      <span v-else>Select Option</span>
    </label> -->
    <div class="relative z-20 bg-white dark:bg-form-input">
      <select
        v-model="selectedOption"
        @change="updateSelection"
        class="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
      >
        <option value="" disabled>
          <span v-if="props.placeholder">{{ props.placeholder }}</span>
          <span v-else>Select an option</span>
        </option>
        <option
          v-for="option in props.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>
