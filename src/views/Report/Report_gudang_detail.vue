<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultTabs from "@/components/Forms/DefaultTabs.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import tableListRuang from "@/views/Components/tableListRuang.vue";

import { getDateToday } from "@/stores/date";
import { lokasi_getDataByType, lokasi_getDataById } from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import router from "@/router";
import { useRoute } from "vue-router";

const route = useRoute();

const indexStore = useIndexStore();

const optionsGudang = ref([]);
const pageTitle = ref("Work Order - Detail Gudang");
const pageList = ref(["Work Order", "Gudang", "Detail"]);

const tabsData = ref([
  { name: "tab1", label: "List Ruang" },
  { name: "tab2", label: "List Barang" },
  { name: "tab3", label: "Mutasi Barang" },
]);

// Saved Data
const savedData = ref({
  lokasi_id: "",
  lokasi_nama: "",
  lokasi_tipe: "",
  lokasi_alamat: {
    lokasi_alamat_gudang: "",
    lokasi_alamat_ruang: "",
    lokasi_alamat_rak: "",
  },
  lokasi_keterangan: "",

  lokasi_user_created: indexStore.user.userName,
  lokasi_created: "",
  lokasi_updated: "",
  lokasi_deleted: "N",
  companyName: indexStore.user.companyName,
});

onMounted(async () => {
  const newData = await lokasi_getDataById(route.params.id);
  savedData.value = newData;
  // console.log(route.params.id)
  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_teknis_tanggal = date;

  const data = await lokasi_getDataByType(indexStore.user.companyName, "gudang", "");
  if (data) {
    optionsGudang.value = data.data.map((x, i) => ({
      id: i,
      name: x.lokasi_nama,
    }));
  }

  savedData.value.lokasi_created = date;
});
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <!-- ====== Form Elements Section Start -->

    <div class="grid grid-cols-1 gap-4">
      <div class="flex flex-col gap-9 col-span-2">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Data Umum">
          <div class="grid gap-9 sm:grid-cols-2 p-6.5">
            <div class="flex flex-col">
              <div class="flex flex-col gap-3">
                <div>
                  <label
                    class="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Kode Lokasi
                  </label>
                  <input
                    disabled
                    type="text"
                    placeholder="Masukan Kode Lokasi"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    v-model="savedData.lokasi_id"
                  />
                </div>
                <div>
                  <label
                    class="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Tipe Lokasi
                  </label>
                  <input
                    disabled
                    type="text"
                    placeholder="Masukan Tipe Lokasi"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    v-model="savedData.lokasi_tipe"
                  />
                </div>
              </div>
              <div class="flex flex-col gap-3">
                <div>
                  <label
                    class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
                  >
                    Nama Lokasi
                  </label>
                  <input
                    disabled
                    type="text"
                    placeholder="Masukan Nama Lokasi"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    v-model="savedData.lokasi_nama"
                  />
                </div>
              </div>

              <!-- Qty Keluar Input -->
              <div></div>
            </div>

            <div class="flex flex-col">
              <div>
                <label
                  v-if="savedData.lokasi_tipe"
                  class="mb-3 mt-0 block text-sm font-medium text-black dark:text-white"
                >
                  Alamat
                </label>
                <!-- Input Gudang -->
                <input
                  v-if="savedData.lokasi_tipe"
                  disabled
                  type="text"
                  placeholder="Masukan Gudang"
                  class="w-full mb-3 rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.lokasi_alamat.lokasi_alamat_gudang"
                />
                <!-- Input Ruang -->

                <input
                  v-if="savedData.lokasi_tipe && savedData.lokasi_tipe !== 'gudang'"
                  disabled
                  type="text"
                  placeholder="Masukan Ruang"
                  class="w-full mb-3 rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.lokasi_alamat.lokasi_alamat_ruang"
                />
                <!-- Input Rak -->

                <input
                  v-if="savedData.lokasi_tipe && savedData.lokasi_tipe === 'rak'"
                  disabled
                  type="text"
                  placeholder="Masukan Rak"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.lokasi_alamat.lokasi_alamat_rak"
                />
              </div>
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Keterangan
                </label>
                <textarea
                  disabled
                  rows="3"
                  placeholder="Masukan keterangan disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.lokasi_keterangan"
                ></textarea>
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <div class="flex flex-col gap-9 col-span-2">
        <DefaultTabs :tabs="tabsData">
          <div id="tab1">
            <tableListRuang />
          </div>
          <div id="tab2">(Konten untuk Tab 2)</div>
          <div id="tab3">(Konten untuk Tab 3)</div>
        </DefaultTabs>
      </div>

      <div class="flex flex-col gap-9 col-span-2">
        <!-- Input Fields Start -->
        <DefaultCard>
          <div class="pb-6 px-4 grid gap-2">
            <router-link
              to="/modules/work-order/gudang"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90 col-span-2"
            >
              Kembali
            </router-link>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
    </div>

    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
