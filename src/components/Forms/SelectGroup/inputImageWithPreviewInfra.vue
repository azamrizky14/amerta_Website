<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, computed, onUnmounted } from "vue";
import { mdiImageOutline } from "@mdi/js";

const props = defineProps<{
  modelValue: (string | File)[]; // Model value berupa array
  label: string;
}>();

const emits = defineEmits(["update:modelValue"]);

const images = ref<(string | File)[]>([...props.modelValue]); // Salin dari props
const fileInput = ref<HTMLInputElement | null>(null);
const imageUrlInput = ref<string>("");

// **Computed untuk menangani URL sementara dari File**
const previewImages = computed(() =>
  images.value.map((img) => (img instanceof File ? URL.createObjectURL(img) : img))
);

// **Fungsi untuk mendeteksi URL dari Google Drive**
const isGoogleDriveUrl = (url: string) => url.includes("drive.google.com");
const getGoogleDriveDirectLink = (url: string) => {
  const match = url.match(/(?:file\/d\/|id=)([\w-]+)/);
  return match ? `https://lh3.googleusercontent.com/d/${match[1]}=w500-h500` : url;
};

// **Menambah gambar dari URL**
const addImageUrl = () => {
  let inputUrl = imageUrlInput.value.trim();
  if (!inputUrl) return;

  const newUrl = isGoogleDriveUrl(inputUrl)
    ? getGoogleDriveDirectLink(inputUrl)
    : inputUrl;
  images.value.push(newUrl); // Tambahkan URL ke array
  emits("update:modelValue", images.value);
  imageUrlInput.value = ""; // Reset input URL
};

// **Menambah gambar dari file upload**
const addImageFile = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;

  for (const file of files) {
    images.value.push(file);
  }
  emits("update:modelValue", images.value);
};

// **Menghapus gambar dari daftar**
const removeImage = (index: number) => {
  const removed = images.value.splice(index, 1)[0]; // Hapus dari array
  if (removed instanceof File) URL.revokeObjectURL(previewImages.value[index]); // Bersihkan blob
  emits("update:modelValue", images.value);
};

// **Hapus semua URL blob saat komponen dilepas**
onUnmounted(() => {
  previewImages.value.forEach((url) => URL.revokeObjectURL(url));
});

// **Update saat modelValue berubah di parent**
watch(
  () => props.modelValue,
  (newValue) => {
    images.value = [...newValue];
  }
);
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <!-- Input file -->
    <input
      type="file"
      accept="image/*"
      class="hidden"
      ref="fileInput"
      multiple
      @change="addImageFile"
    />
    <label
      class="cursor-pointer bg-blue-500 text-white pl-2 px-3 py-1 rounded text-sm flex max-xl:w-full max-xl:justify-center mt-2"
      @click="fileInput?.click()"
    >
      <svg
        class="fill-current mr-1"
        width="18"
        height="18"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path :d="mdiImageOutline" />
      </svg>
      {{ label ? label : "Upload" }}
    </label>
    <span class="max-xl:w-full max-xl:text-center mt-2">atau</span>
    <!-- Input URL -->
    <div class="flex gap-2 mt-2 max-xl:w-full max-xl:text-center">
      <input
        type="url"
        v-model="imageUrlInput"
        placeholder="Masukkan URL gambar..."
        class="border px-2 py-1 rounded w-full text-sm"
      />
      <button
        @click="addImageUrl"
        class="bg-blue-500 text-white px-3 py-1 rounded text-sm"
      >
        Tambah
      </button>
    </div>
  </div>

  <!-- Preview Images -->
  <div class="flex gap-2 flex-wrap mt-4">
    <div v-for="(img, index) in previewImages" :key="index" class="relative">
      <img :src="img" class="w-[100px] h-[100px] object-cover rounded border" />
      <!-- Remove Image Button -->
      <button
        @click="removeImage(index)"
        class="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full text-xs"
      >
        ✕
      </button>
    </div>
  </div>
</template>
