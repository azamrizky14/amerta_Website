<script setup lang="ts">
import { ref } from 'vue';

// Reactive variable to track the current step
const currentStep = ref(0);

// Step content definition
const steps = [
  { content: 'Enter your name and personal details' },
  { content: 'Enter your email address and phone number' },
  { content: 'Review your information and confirm' },
];

// Navigate to a specific step
const goToStep = (stepIndex: number) => {
  if (stepIndex >= 0 && stepIndex < steps.length) {
    currentStep.value = stepIndex;
  }
};

// Move to the next step
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

// Move to the previous step
const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <!-- Progress bar -->
    <div class="flex items-center justify-between mb-8">
      <template v-for="(step, index) in steps" :key="index">
        <div class="flex items-center space-x-2">
          <!-- Clickable step indicators -->
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full focus:outline-none"
            :class="currentStep === index ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'"
            @click="goToStep(index)"
          >
            {{ index + 1 }}
          </button>
        </div>
        <div
          v-if="index < steps.length - 1"
          class="w-full h-[2px]"
          :class="currentStep > index ? 'bg-primary' : 'bg-gray-300'"
        ></div>
      </template>
    </div>

    <!-- Step Content -->
    <div>
      <!-- Dynamically display the content of the active step -->
      <h2 class="text-xl font-bold mb-4">Step {{ currentStep + 1 }}</h2>
      <p class="mb-4">{{ steps[currentStep].content }}</p>

      <!-- Form Inputs based on step -->
      <div>
        <div v-if="currentStep === 0">
          <input
            type="text"
            placeholder="Your Name"
            class="block w-full p-2 mb-4 border border-gray-300 rounded-md"
          />
        </div>
        <div v-if="currentStep === 1">
          <input
            type="email"
            placeholder="Your Email"
            class="block w-full p-2 mb-4 border border-gray-300 rounded-md"
          />
        </div>
        <div v-if="currentStep === 2">
          <p>Review your details before submitting.</p>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex space-x-4">
        <button
          v-if="currentStep > 0"
          @click="previousStep"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back
        </button>
        <button
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Next
        </button>
        <button
          v-if="currentStep === steps.length - 1"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* Custom styles for primary colors */
.bg-primary {
  background-color: #4f46e5; /* Tailwind Indigo-600 */
}

.bg-primary-dark {
  background-color: #4338ca; /* Tailwind Indigo-700 */
}
</style>
