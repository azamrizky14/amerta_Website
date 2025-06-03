<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import vSelect from "vue-select";
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";

import { useIndexStore } from "@/stores";
import { useRoute } from "vue-router";
import { tc_UpdateTaskById, tc_GetTaskById } from "@/stores/functionAPI";
import { ref, onMounted } from "vue";
import router from "@/router";
import Swal from "sweetalert2";
import { getDateToday } from "@/stores/date";
import { showLoading, successCreate, failedCreate, confirmDelete } from "@/stores/swal";

const indexStore = useIndexStore();
const route = useRoute();
const pageTitle = ref("Koordinator Ticket - Edit");
const pageList = ref(["Work Order", "Koordinator", "Ticket", "Edit"]);

const savedData = ref({
  Tr_ticket_id: "",
  Tr_ticket_created: "",
  CompanyName: indexStore.user.companyName,
  CompanyCode: indexStore.user.companyCode,

  Tr_ticket_keterangan: "",
  Tr_ticket_data_pelanggan: {},
  Tr_ticket_alamat: {
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

const dataValidator = ref([
  { key: "Tr_ticket_name", label: "Detail Tiket" },
  { key: "Tr_ticket_kategori", label: "Kategori Tiket" },
]);

const dataError = ref([]);

const validateForm = () => {
  dataError.value = [];

  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key]) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  if (Object.keys(savedData.value.Tr_ticket_data_pelanggan).length === 0) {
    dataError.value.push(`Data Pelanggan tidak boleh kosong!`);
  }

  if (!savedData.value.Tr_ticket_alamat.Tr_ticket_titik_koordinat) {
    dataError.value.push(`Titik Koordinat tidak boleh kosong!`);
  }

  return dataError.value.length === 0;
};

const submitData = async () => {
  const isValid = validateForm();

  if (!isValid) {
    return;
  }
  const result = await Swal.fire({
    title: "Edit Data?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Edit!",
    cancelButtonText: "Batal",
  });

  if (result.isConfirmed) {
    try {
      showLoading();

      const fixData = { ...savedData.value };

      fixData.Tr_ticket_kategori = fixData.Tr_ticket_kategori.value;
      console.log(fixData);

      const date = await getDateToday("yyyy-MM-dd");
      fixData.Tr_ticket_updated.push({
        Tr_ticket_updated_nama: indexStore.user.userName,
        Tr_ticket_updated_tanggal: date,
      });

      await tc_UpdateTaskById(fixData, route.params.id);

      await successCreate().then(() => {
        router.push("/modules/work-order/koordinator/ticket-gamas");
      });
    } catch (error) {
      await failedCreate(error);
    }
  }
};

const cancelAdd = async () => {
  const result = await Swal.fire({
    title: "Batalkan?",
    text: "anda yakin membatalkan Edit data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await router.push("/modules/work-order/koordinator/ticket-gamas");
  }
};
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
                  ODP-PON-SERVER
                </label>

                <input
                  disabled
                  type="text"
                  placeholder="Detail Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  :value="
                    Object.keys(savedData.Tr_ticket_data_pelanggan).length !== 0
                      ? savedData.Tr_ticket_data_pelanggan.Tr_ticket_data_pelanggan_nama
                      : ''
                  "
                />
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
                  Catatan
                </label>

                <textarea
                  rows="3"
                  placeholder="Masukan Catatan disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_ticket_keterangan"
                ></textarea>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="xl:pt-5">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Titik Koordinat
                </label>

                <textarea
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
          <div v-if="dataError.length > 0" class="mt-4 mb-4">
            <ul>
              <li v-for="(error, index) in dataError" :key="index" class="ml-5 text-red">
                <b>- {{ error }}</b>
              </li>
            </ul>
          </div>
          <div class="pb-6 px-4 grid grid-cols-3 gap-2">
            <button
              @click="cancelAdd"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batalkan
            </button>
            <button
              @click="getData"
              class="flex w-full justify-center rounded bg-gray-500 p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Reset
            </button>
            <button
              @click="submitData"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Edit Data
            </button>
          </div>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayout>
</template>
