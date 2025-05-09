<script setup lang="ts">
const props = defineProps(["pageTitle"]);
</script>

<template>
  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <h2 class="text-title-md2 font-semibold text-black dark:text-white">
      {{ props.pageTitle }}
    </h2>
  </div>
</template>
