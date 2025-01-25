<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";

// Properti tabs diambil dari defineProps
const props = defineProps({
  tabs: {
    type: Array as () => { name: string; label: string }[],
    required: true,
  },
});

const activeTab = ref(props.tabs[0]?.name || ""); // Default ke tab pertama
const contentMap = ref<Record<string, HTMLElement | null>>({});

onMounted(() => {
  // Map konten berdasarkan ID (dari elemen anak)
  contentMap.value = props.tabs.reduce((map, tab) => {
    map[tab.name] = document.getElementById(tab.name);
    return map;
  }, {} as Record<string, HTMLElement | null>);
});

watchEffect(() => {
  // Sembunyikan semua konten kecuali tab aktif
  for (const key in contentMap.value) {
    if (contentMap.value[key]) {
      contentMap.value[key]!.style.display = key === activeTab.value ? "block" : "none";
    }
  }
});
</script>

<template>
  <div
    class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
  >
    <!-- Header Tabs -->
    <div class="flex border-b border-gray-200">
      <button
        v-for="tab in props.tabs"
        :key="tab.name"
        @click="activeTab = tab.name"
        :class="[
          'px-4 py-2 font-medium',
          activeTab === tab.name
            ? 'border-l border-r border-stroke bg-white rounded-t-md text-primary custom-border-bottom'
            : 'text-gray-500 hover:text-primary',
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Slot Konten -->
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>
