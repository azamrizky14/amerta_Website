<script setup lang="ts">
const props = defineProps(["cardTitle", "class", "download", "payment", "paymentCancel"]);
import { mdiDownload, mdiCash, mdiCashOff } from "@mdi/js";

// Emit event ke parent
const emit = defineEmits(["download", "payment", "paymentCancel"]);
</script>

<template>
  <div
    class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
    :class="props.class"
  >
    <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
      <h3 class="font-medium text-black dark:text-white">
        <div class="grid gap-0 grid-cols-3">
          <div class="col-span-2">{{ props.cardTitle }}</div>
          <div class="col-span-1 flex justify-end">
            <button
              :class="props.download ? '' : 'hidden'"
              @click="emit('download')"
              class="ml-1 p-1 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              <svg
                class="fill-white dark:hover:fill-primary"
                width="20"
                height="20"
                viewBox="0 0 23 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path :d="mdiDownload" fill="" />
              </svg>
            </button>
            <button
              :class="props.payment ? '' : 'hidden'"
              @click="emit('payment')"
              class="ml-1 p-1 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              <svg
                class="fill-white dark:hover:fill-primary"
                width="20"
                height="20"
                viewBox="0 0 23 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path :d="mdiCash" fill="" />
              </svg>
            </button>
            <button
              :class="props.paymentCancel ? '' : 'hidden'"
              @click="emit('paymentCancel')"
              class="ml-1 p-1 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              <svg
                class="fill-white dark:hover:fill-primary"
                width="20"
                height="20"
                viewBox="0 0 23 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path :d="mdiCashOff" fill="" />
              </svg>
            </button>
          </div>
        </div>
      </h3>
    </div>
    <slot></slot>
  </div>
</template>
