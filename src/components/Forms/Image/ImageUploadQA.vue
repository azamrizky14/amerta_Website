<script setup>
import { ref, watch } from "vue";
import { mdiCamera } from "@mdi/js";

const props = defineProps({
  modelValue: File, // Gunakan File
  index: Number,
});

const emit = defineEmits(["update:modelValue"]);

const previewUrl = ref(null);
const fileInputRef = ref(null);

// Buat preview jika modelValue adalah File
watch(
  () => props.modelValue,
  (val) => {
    if (val instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        previewUrl.value = reader.result;
      };
      reader.readAsDataURL(val);
    } else {
      previewUrl.value = null;
    }
  },
  { immediate: true }
);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    emit("update:modelValue", file); // Emit sebagai File
  }
};

const removeImage = () => {
  previewUrl.value = null;
  emit("update:modelValue", null);
  if (fileInputRef.value) {
    fileInputRef.value.value = null;
  }
};
</script>

<template>
  <div class="relative flex items-center justify-center">
    <input
      ref="fileInputRef"
      type="file"
      :id="'fileInput_' + props.index"
      class="hidden"
      accept="image/*"
      @change="handleFileChange"
    />
    <label
      :for="'fileInput_' + props.index"
      class="cursor-pointer w-full h-full flex items-center justify-center relative"
    >
      <template v-if="previewUrl">
        <img :src="previewUrl" alt="Preview" class="object-cover w-full h-full" />
        <button
          type="button"
          @click.stop.prevent="removeImage"
          class="absolute inset-0 m-auto bg-black/60 text-white rounded-full p-0.5 px-2 flex items-center justify-center hover:bg-red-600"
          title="Hapus gambar"
        >
          ✕
        </button>
      </template>
      <template v-else>
        <svg
          class="fill-current text-gray-500"
          width="20"
          height="20"
          viewBox="0 0 23 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path :d="mdiCamera" />
        </svg>
      </template>
    </label>
  </div>
</template>
