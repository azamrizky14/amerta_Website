<script setup lang="ts">
import DefaultCardTable from "@/components/Forms/DefaultCardAccessPage.vue";
import { ref, watch, computed, onMounted } from "vue";
import { useIndexStore } from "@/stores";

const props = defineProps<{
  dataPage?: any[];
  hierarchy: boolean;
}>();

const dataHeader = ref([
  { name: "No.", class: "min-w-[30px] py-2 px-4" }, // Kolom checkbox
  { name: "Nama Halaman", class: "min-w-[100px] py-2 px-4" },
  { name: "Kode", class: "min-w-[100px] py-2 px-4" },
  { name: "Kategori", class: "min-w-[100px] py-2 px-4" },
  { name: "Tipe", class: "min-w-[100px] py-2 px-4" },
  { name: "Grup", class: "min-w-[100px] py-2 px-4" },
  { name: "Halaman Tujuan", class: "min-w-[150px] py-2 px-4" },
]);

const emits = defineEmits(["update:modelValue"]);

let dataTable = ref<any[]>([]); // Pastikan ini array kosong sejak awal
const indexStore = useIndexStore();
const switcherToggle = ref<boolean>(false);

onMounted(async () => {
  const pageData = await indexStore.getUtilPage();
  // console.log(pageData);
  dataTable.value = pageData.utilData.map((item) => ({
    ...item,
    checked: false, // Tambahkan properti checked untuk mengontrol checkbox
  }));
});

// Menandai item di dataTable berdasarkan dataPage
const checkedTable = ref(
  (dataTable.value ?? []).map((item) => ({
    ...item,
    checked: (props.dataPage ?? []).some((page) => page.pageCode === item.pageCode),
  }))
);

const checkedAllData = (value) => {
  checkedTable.value = dataTable.value.map((item) => ({
    ...item,
    checked: value,
  }));
};

const toggleCheckboxes = (value: "all" | "single", index: number | null = null) => {
  if (value === "all") {
    checkedAllData(switcherToggle.value);

    // Emit semua data jika seluruhnya dicentang, atau kosong jika tidak
    emits("update:modelValue", switcherToggle.value ? ["all"] : []);
  } else if (value === "single" && index !== null) {
    switcherToggle.value = false;

    // Emit data yang sudah dicentang
    emits(
      "update:modelValue",
      checkedTable.value
        .filter((item) => item.checked)
        .map((x) => ({ pageCode: x.pageCode, pageAccess: "c.r.u.d" }))
    );
  }
};

// Data yang terpilih berdasarkan checked
const selectedData = computed(() => checkedTable.value.filter((item) => item.checked));

// Update checkedTable jika dataPage berubah dari parent
watch(
  () => props.dataPage,
  (newDataTable) => {
    console.log("dataTable berubah:", newDataTable);

    if (!newDataTable) return; // Hindari error jika dataTable belum tersedia

    if (newDataTable[0] === "all") {
      switcherToggle.value = true;
      checkedAllData(true);
    } else {
      switcherToggle.value = false;
      checkedTable.value = dataTable.value.map((item) => ({
        ...item,
        checked: (newDataTable ?? []).some((page) => page.pageCode === item.pageCode),
      }));
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="flex flex-col gap-9 col-span-2">
    <DefaultCardTable cardTitle="List Page">
      <template #card-tools>
        <label
          for="toggleAll"
          :class="!props.hierarchy ? '' : 'cursor-pointer'"
          class="flex select-none items-center"
        >
          <div class="relative">
            <input
              :disabled="!props.hierarchy"
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
            <tr v-for="(item, index) in checkedTable" :key="index" class="border">
              <td class="py-2 px-4 flex align-middle justify-center">
                <input
                  type="checkbox"
                  v-model="item.checked"
                  :disabled="!props.hierarchy"
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
