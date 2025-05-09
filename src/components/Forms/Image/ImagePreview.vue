<script setup>
import { ref } from "vue";
import { API } from "@/API/";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  url: {
    type: String,
  },
  alt: {
    type: String,
    default: "Preview image",
  },
  size: {
    type: String,
  },
});

const showPreview = ref(false);
</script>

<template>
  <div>
    <!-- Thumbnail kecil -->
    <img
      :src="`${API}/${url}/${src}`"
      :alt="alt"
      class="object-cover cursor-pointer border rounded-lg shadow"
      :class="size ? size : 'w-[100px] h-[100px] '"
      @click="showPreview = true"
    />

    <!-- Modal Preview Gambar -->
    <div
      v-if="showPreview"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70"
      @click.self="showPreview = false"
    >
      <img
        :src="`${API}/${url}/${src}`"
        :alt="alt"
        class="max-w-[90%] max-h-[90%] rounded-lg shadow-lg border-4 border-white"
      />
    </div>
  </div>
</template>
