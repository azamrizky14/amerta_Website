<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { tc_GetAllDataByDivisi } from "@/stores/functionAPI";
import { mdiRefresh } from "@mdi/js";
import { formatDate } from "@/stores/date";
import { useIndexStore } from "@/stores";

const indexStore = useIndexStore();
const dataHeader = ref([
  { name: "No.", class: "py-2 pl-3" },
  { name: "Kode Tiket", class: "max-w-[125px] py-2 px-4" },
  { name: "Dibuat", class: "max-w-[85px] py-2 px-4" },
  { name: "Detail Tiket", class: "min-w-[150px] py-2 px-4" },
]);
let dataTable = ref([]);
const searchQuery = ref("");

// Pagination state
const currentPage = ref(1);
const itemsPerPageOptions = [5, 10, 20, 50]; // Pilihan jumlah data per halaman
const itemsPerPage = ref(5);
const pageInput = ref(currentPage.value);

watch(itemsPerPage, () => {
  currentPage.value = 1; // Reset to the first page
});

const jumpToPage = () => {
  if (pageInput.value >= 1 && pageInput.value <= totalPages.value) {
    changePage(pageInput.value);
  } else {
    // Reset to the current page if input is invalid
    pageInput.value = currentPage.value;
  }
};

// Filtered data based on search query
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return dataTable.value;
  return dataTable.value.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Total items based on the filtered data
const totalItems = computed(() => filteredData.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

// Paginated data based on filtered results
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredData.value.slice(start, end);
});

// Change page function
const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const visiblePages = computed(() => {
  const pages = [];
  const range = 2; // Number of pages to show before and after the current page

  let start = Math.max(1, currentPage.value - range);
  let end = Math.min(totalPages.value, currentPage.value + range);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Change page function
const getMainData = async () => {
  const data = await tc_GetAllDataByDivisi(
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode,
    "PSB",
    "Y"
  );

  dataTable.value = await Promise.all(
    data.map(async (x) => ({
      ...x,
      formattedCreate: x.Tr_ticket_created
        ? await formatDate(x.Tr_ticket_created, "dd-MM-yyyy")
        : "",
    }))
  );
};

onMounted(async () => {
  await getMainData();
});
</script>

<template>
  <!-- Card Item End -->

  <div class="flex flex-col gap-5">
    <div
      class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
    >
      <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 class="font-medium text-black dark:text-white">
          <div class="grid gap-0 grid-cols-3">
            <div class="col-span-2">Tiket PSB Outstanding</div>
            <div class="col-span-1 flex justify-end">
              <button
                class="ml-1 p-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                @click="getMainData"
              >
                <svg
                  class="fill-white dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path :d="mdiRefresh" fill="" />
                </svg>
              </button>
            </div>
          </div>
        </h3>
      </div>
      <div class="flex flex-col">
        <div class="max-w-full overflow-x-auto">
          <table class="w-full table-auto">
            <thead>
              <tr class="bg-gray-2 text-left dark:bg-meta-4">
                <th
                  v-for="data in dataHeader"
                  :class="data.class"
                  class="font-medium text-black dark:text-white text-center text-sm"
                >
                  {{ data.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedData" :key="index" class="border">
                <td class="pl-3 py-1.5 text-xs border align-top">
                  {{ index + 1 }}
                </td>
                <td class="py-1.5 px-2 border align-top">
                  <p class="text-black dark:text-white text-xs text-center">
                    {{ item.Tr_ticket_id }}
                  </p>
                </td>
                <td class="py-1.5 px-2 border align-top">
                  <p class="text-black dark:text-white text-xs text-center">
                    {{ item.formattedCreate }}
                  </p>
                </td>
                <td class="py-1.5 px-2 border align-top">
                  <h5 class="font-medium text-black text-xs dark:text-white">
                    {{ item.Tr_ticket_name }}
                  </h5>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-6.5 flex justify-between items-center">
          <!-- Menampilkan Data -->
          <div class="flex items-center text-sm">
            <select
              id="itemsPerPage"
              v-model="itemsPerPage"
              class="px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <!-- Navigasi Pagination -->
          <div class="flex space-x-2 items-center">
            <!-- Previous Button -->
            <button
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              Prev
            </button>

            <!-- First Page -->
            <button
              v-if="currentPage > 3"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              @click="changePage(1)"
            >
              1
            </button>

            <!-- Ellipsis Before -->
            <span v-if="currentPage > 4" class="text-xs px-2 py-1">...</span>

            <!-- Visible Page Buttons -->
            <button
              v-for="page in visiblePages"
              :key="page"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :class="currentPage === page ? 'bg-primary text-white' : ''"
              @click="changePage(page)"
            >
              {{ page }}
            </button>

            <!-- Ellipsis After -->
            <span v-if="currentPage < totalPages - 3" class="text-xs px-2 py-1">...</span>

            <!-- Last Page -->
            <button
              v-if="currentPage < totalPages - 2"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              @click="changePage(totalPages)"
            >
              {{ totalPages }}
            </button>

            <!-- Next Button -->
            <button
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              Next
            </button>

            <!-- Page Number Input -->
            <div class="flex items-center ml-4">
              <label for="pageInput" class="mr-2">Go to:</label>
              <input
                id="pageInput"
                type="number"
                v-model.number="pageInput"
                @keyup.enter="jumpToPage"
                min="1"
                :max="totalPages"
                class="w-16 text-sm px-2 pl-3 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
