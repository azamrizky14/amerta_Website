<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onUnmounted } from "vue";
import { API } from "@/API/";

const props = defineProps<{
  modelValue: string | File | null;
  label: string;
  url: string;
  disabled: boolean;
}>();

const emits = defineEmits(["update:modelValue", "update:file"]);

const imageSrc = ref<string | null>(
  props.modelValue instanceof File
    ? URL.createObjectURL(props.modelValue)
    : props.modelValue
);

const fileInput = ref<HTMLInputElement | null>(null);
const imageUrlInput = ref<string>("");

// **Fungsi untuk mendeteksi apakah URL berasal dari Google Drive**
const isGoogleDriveUrl = (url: string) => {
  return url.includes("drive.google.com");
};

const getGoogleDriveDirectLink = (url: string) => {
  const match = url.match(/(?:file\/d\/|id=)([\w-]+)/);
  return match ? `https://lh3.googleusercontent.com/d/${match[1]}=w500-h500` : url;
};

// **Fungsi menangani input URL**
const processImageUrl = () => {
  let inputUrl = imageUrlInput.value.trim();
  if (!inputUrl) return;

  if (isGoogleDriveUrl(inputUrl)) {
    emits("update:modelValue", getGoogleDriveDirectLink(inputUrl));
  } else {
    emits("update:modelValue", inputUrl);
  }

  imageSrc.value = inputUrl; // URL biasa
};

const previewImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (imageSrc.value) URL.revokeObjectURL(imageSrc.value); // Hapus URL lama
    imageSrc.value = URL.createObjectURL(file);
    emits("update:file", file);
    emits("update:modelValue", file);
  }
};

const removeImage = () => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value);
  imageSrc.value = null;
  emits("update:file", null);
  emits("update:modelValue", null);
  if (fileInput.value) fileInput.value.value = "";
  imageUrlInput.value = "";
};

onUnmounted(() => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value);
});

// Watch perubahan modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (imageSrc.value) URL.revokeObjectURL(imageSrc.value); // Hapus URL lama
    if (newValue instanceof File) {
      imageSrc.value = URL.createObjectURL(newValue);
    } else {
      imageSrc.value = newValue as string | null;
    }
  }
);
</script>

<template>
  <!-- Hidden File Input -->
  <input
    :disabled="disabled"
    type="file"
    accept="image/*"
    class="hidden"
    :id="label"
    @change="previewImage"
    ref="fileInput"
  />

  <!-- Upload Button -->
  <label
    :for="label"
    class="px-4 py-2 rounded transition text-center"
    :class="disabled ? 'opacity-50 cursor-default' : 'cursor-pointer'"
  >
    {{ label }}
  </label>

  <!-- Image Preview -->
  <div class="mt-4 relative">
    <!-- Jika gambar berasal dari Google Drive, ubah ke direct link -->
    <img
      v-if="imageSrc && isGoogleDriveUrl(imageSrc)"
      :src="getGoogleDriveDirectLink(imageSrc)"
      class="w-[100px] h-[100px] object-cover rounded border"
    />

    <!-- Jika gambar berasal dari URL biasa atau hasil upload -->
    <img
      v-else-if="imageSrc"
      :src="imageSrc.startsWith('http') ? imageSrc : `${API}/${url}/${imageSrc}`"
      alt="Uploaded Preview"
      class="w-[100px] h-[100px] object-cover rounded"
      :class="disabled ? 'cursor-default' : 'cursor-pointer'"
      @click="!disabled && fileInput?.click()"
    />

    <!-- Placeholder jika tidak ada gambar -->
    <img
      v-else
      src="https://placehold.co/150"
      alt="Placeholder"
      class="w-[100px] h-[100px] object-cover rounded"
      :class="disabled ? 'cursor-default' : 'cursor-pointer'"
      @click="!disabled && fileInput?.click()"
    />

    <!-- Remove button -->
    <button
      v-if="imageSrc && !disabled"
      @click="removeImage"
      class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
    >
      X
    </button>
  </div>

  <!-- Input URL -->
  <div class="mt-2 flex gap-2" v-if="!disabled">
    <input
      type="url"
      v-model="imageUrlInput"
      placeholder="Masukkan URL gambar..."
      class="border px-2 py-1 rounded w-full text-sm"
      :disabled="disabled"
    />
    <button
      @click="processImageUrl"
      class="bg-blue-500 text-white px-3 py-1 rounded text-sm"
      :disabled="disabled"
    >
      Gunakan
    </button>
  </div>
</template>
