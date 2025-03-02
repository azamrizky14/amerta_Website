<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onUnmounted } from "vue";

const props = defineProps<{
  modelValue: string | File | null;
  url: string;
  label: string;
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
    imageSrc.value = getGoogleDriveDirectLink(inputUrl);
  } else {
    imageSrc.value = inputUrl; // URL biasa
  }

  emits("update:modelValue", imageSrc.value);
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

// Handle removing the image
const removeImage = () => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value); // Bersihkan URL objek
  imageSrc.value = null;
  emits("update:modelValue", null);
  imageUrlInput.value = "";
  fileInput.value = null; // Reset input file sepenuhnya
};

// Reset the file input value
const resetFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ""; // Reset the input field value
  }
};

// Cleanup URL objects to prevent memory leaks
onUnmounted(() => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value);
});

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
  <!-- Hidden file input with click-triggering label -->
  <input
    type="file"
    accept="image/*"
    class="hidden"
    :id="label"
    @change="previewImage"
    ref="fileInput"
    :key="imageSrc"
  />
  <label :for="label" class="cursor-pointer px-4 py-2 rounded transition text-center">
    {{ label }}
  </label>

  <!-- Image preview with placeholder support and click to change -->
  <div class="mt-4">
    <!-- Jika gambar berasal dari Google Drive, ubah ke direct link -->
    <img
      v-if="imageSrc"
      :src="imageSrc"
      class="w-[100px] h-[100px] object-cover rounded border"
    />
    <img
      v-else
      :src="imageSrc || 'https://placehold.co/150'"
      alt="Uploaded Preview"
      class="w-[100px] h-[100px] object-cover rounded cursor-pointer"
      @click="fileInput?.click()"
    />

    <!-- Remove Image Button -->
    <button
      v-if="imageSrc"
      @click="removeImage"
      class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
    >
      X
    </button>
  </div>

  <!-- Input URL -->
  <div class="mt-2 flex gap-2">
    <input
      type="url"
      v-model="imageUrlInput"
      placeholder="Masukkan URL gambar..."
      class="border px-2 py-1 rounded w-full text-sm"
    />
    <button
      @click="processImageUrl"
      class="bg-blue-500 text-white px-3 py-1 rounded text-sm"
    >
      Gunakan
    </button>
  </div>
</template>
