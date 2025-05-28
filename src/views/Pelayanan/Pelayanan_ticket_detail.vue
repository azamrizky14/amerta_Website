<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import vSelect from "vue-select";
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";

import { useIndexStore } from "@/stores";
import { useRoute } from "vue-router";
import { tc_GetTaskById } from "@/stores/functionAPI";
import { ref, onMounted } from "vue";

const indexStore = useIndexStore();
const route = useRoute();
const pageTitle = ref("Koordinator Ticket - Detail");
const pageList = ref(["Work Order", "Koordinator", "Ticket", "Detail"]);

const savedData = ref({
  Tr_ticket_id: "",
  Tr_ticket_created: "",
  CompanyName: indexStore.user.companyName,
  CompanyCode: indexStore.user.companyCode,

  Tr_ticket_keterangan: "",
  Tr_ticket_data_pelanggan: {},
  Tr_ticket_alamat: {
    Tr_ticket_alamat_lokasi: "",
    Tr_ticket_titik_koordinat: "",
  },
  Tr_ticket_updated: [],
  Tr_ticket_status: "Y",
});

const options = [
  { label: "PSB", value: "PSB" },
  { label: "Complain", value: "Complain" },
];

const getData = async () => {
  const data = await tc_GetTaskById(route.params.id);
  savedData.value = data;
  savedData.value.Tr_ticket_kategori = {
    label: savedData.value.Tr_ticket_kategori,
    value: savedData.value.Tr_ticket_kategori,
  };
};

onMounted(async () => {
  await getData();
  // console.log(data);
});
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />

    <div class="grid grid-cols-2 gap-5">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Masukan Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Tiket
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Kode Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_ticket_id"
                />
              </div>
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Dibuat
                </label>
                <input
                  disabled
                  type="date"
                  placeholder="Kode Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_ticket_created"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="w-3/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Detail Tiket
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Detail Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_ticket_name"
                />
              </div>
              <div class="w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kategori
                </label>
                <SelectGroup
                  disabled
                  placeholder="Kategori"
                  :options="options"
                  v-model="savedData.Tr_ticket_kategori"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Data Pelanggan
                </label>

                <v-select
                  :clearable="false"
                  v-model="savedData.Tr_ticket_data_pelanggan"
                  :options="dataPelanggan"
                  label="item_properties_id"
                  placeholder="Detail Modem"
                  class="hidden w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <!-- Dropdown list -->
                  <template #option="option">
                    <template v-if="option">
                      {{ option.data_pelanggan_id }} - {{ option.data_pelanggan_nama }}
                    </template>
                    <template v-else>
                      <em class="text-gray-400">Loading...</em>
                    </template>
                  </template>

                  <!-- Saat sudah dipilih -->
                  <template #selected-option="option">
                    <span class="dark:text-white">
                      {{ option.data_pelanggan_id }} -
                      {{ option.data_pelanggan_nama }}</span
                    >
                  </template>
                </v-select>
                <input
                  disabled
                  type="text"
                  placeholder="Detail Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  :value="
                    Object.keys(savedData.Tr_ticket_data_pelanggan).length !== 0
                      ? savedData.Tr_ticket_data_pelanggan.Tr_ticket_data_pelanggan_id +
                        ' - ' +
                        savedData.Tr_ticket_data_pelanggan.Tr_ticket_data_pelanggan_nama
                      : ''
                  "
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Catatan
                </label>

                <textarea
                  disabled
                  rows="3"
                  placeholder="Masukan Catatan disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_ticket_keterangan"
                ></textarea>
              </div>
            </div>
          </div>
        </DefaultCard>
      </div>

      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Alamat">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Alamat
                </label>

                <textarea
                  disabled
                  rows="3"
                  placeholder="Masukan Alamat disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_ticket_alamat.Tr_ticket_alamat_lokasi"
                ></textarea>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="xl:pt-5">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Titik Koordinat
                </label>

                <textarea
                  disabled
                  rows="3"
                  placeholder="Masukan Titik Koordinat disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_ticket_alamat.Tr_ticket_titik_koordinat"
                ></textarea>
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <div class="flex flex-col gap-9 col-span-2">
        <DefaultCard>
          <div class="pb-6 px-4 grid gap-2">
            <router-link
              to="/modules/pelayanan/ticket"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Kembali
            </router-link>
          </div>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayout>
</template>
