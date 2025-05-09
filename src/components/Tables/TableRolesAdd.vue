<script setup lang="ts">
import DefaultCardTable from "@/components/Forms/DefaultCardAccessPage.vue";
import { ref, onMounted, defineEmits } from "vue";
import { useIndexStore } from "@/stores";

const props = defineProps<{
  hierarchyCode: string | null;
  dataPage: Array;
}>();

const emits = defineEmits(["update:modelValue", "update:file"]);

const dataHeader = ref([
  { name: "No.", class: "min-w-[30px] py-2 px-4" }, // Kolom checkbox
  { name: "Nama Halaman", class: "min-w-[100px] py-2 px-4" },
  { name: "Kode", class: "min-w-[100px] py-2 px-4" },
  { name: "Kategori", class: "min-w-[100px] py-2 px-4" },
  { name: "Tipe", class: "min-w-[100px] py-2 px-4" },
  { name: "Grup", class: "min-w-[100px] py-2 px-4" },
  { name: "Halaman Tujuan", class: "min-w-[150px] py-2 px-4" },
]);

let dataTable = ref([]);
const indexStore = useIndexStore();
const switcherToggle = ref<boolean>(false);

onMounted(async () => {
  const pageData = await indexStore.getUtilPage();
  dataTable.value = pageData.utilData.map((item) => ({
    ...item,
    checked: false, // Tambahkan properti checked untuk mengontrol checkbox
  }));
});

const toggleCheckboxes = (value, index = null) => {
  if (value === "all") {
    // Toggle semua checkbox sesuai dengan nilai switcherToggle
    dataTable.value = dataTable.value.map((item) => ({
      ...item,
      checked: switcherToggle.value,
    }));
    if (switcherToggle.value) emits("update:modelValue", ["all"]); // Emit seluruh dataTable
  } else if (index !== null) {
    switcherToggle.value = false;
    emits(
      "update:modelValue",
      dataTable.value.filter((item) => item.checked)
    );
  }
};
</script>

<template>
  <div class="flex flex-col gap-9 col-span-2">
    <DefaultCardTable cardTitle="List Page">
      <template #card-tools>
        <label for="toggleAll" class="flex cursor-pointer select-none items-center">
          <div class="relative">
            <input
              type="checkbox"
              id="toggleAll"
              class="sr-only"
              :checked="switcherToggle"
              @change="
                switcherToggle = !switcherToggle;
                toggleCheckboxes('all');
              "
            />
            <div
              :class="switcherToggle && '!bg-primary'"
              class="block h-8 w-14 rounded-full bg-black"
            ></div>
            <div
              :class="switcherToggle && '!right-1 !translate-x-full'"
              class="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition"
            ></div>
          </div>
        </label>
      </template>

      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th
                v-for="data in dataHeader"
                :class="data.class"
                class="font-medium text-black dark:text-white text-center"
              >
                {{ data.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in dataTable" :key="index" class="border">
              <td class="py-2 px-4 flex align-middle justify-center">
                <input
                  type="checkbox"
                  v-model="item.checked"
                  @change="toggleCheckboxes('single', index)"
                />
              </td>
              <td class="py-1.5 px-2 border align-top">
                <p class="font-medium text-black dark:text-white text-xs">
                  {{ item.pageName }}
                </p>
              </td>
              <td class="py-1.5 px-2 border align-top">
                <p class="font-medium text-black dark:text-white text-xs text-center">
                  {{ item.pageCode }}
                </p>
              </td>
              <td class="py-1.5 px-2 border align-top">
                <p class="font-medium text-xs text-black dark:text-white text-center">
                  {{ item.pageCategory }}
                </p>
              </td>
              <td class="py-1.5 px-2 border align-top">
                <h5 class="font-medium text-black text-xs dark:text-white text-center">
                  {{ item.pageType }}
                </h5>
                <!-- <p class="text-xs">{{ item.picId }}</p> -->
              </td>
              <td class="py-1 px-4 text-center border">
                <h5 class="font-medium text-black text-xs dark:text-white text-left">
                  {{ item.pageGroup }}
                </h5>
                <!-- <p class="text-xs">{{ item }}</p> -->
              </td>
              <td class="py-1.5 px-2 border align-top">
                <h5 class="font-medium text-black text-xs dark:text-white">
                  {{ item.pageRoutes }}
                </h5>
                <!-- <p class="text-xs">{{ item.picId }}</p> -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DefaultCardTable>
  </div>
</template>
