<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";

import { useIndexStore } from "@/stores";
import { useRoute } from "vue-router";
import { crm_UpdateCrmById, crm_GetCrmById } from "@/stores/functionAPI";
import { ref, onMounted } from "vue";
import router from "@/router";
import Swal from "sweetalert2";
import { showLoading, successCreate, failedCreate, confirmDelete } from "@/stores/swal";

const indexStore = useIndexStore();
const route = useRoute();
const pageTitle = ref("CRM - Edit");
const pageList = ref(["Pelayanan", "CRM", "Edit"]);

const savedData = ref({
  Tr_crm_id: "",
  Tr_crm_id: "",
  Tr_crm_updated: [],
  Tr_crm_status: "Y",
  CompanyName: indexStore.user.companyName,
  CompanyCode: indexStore.user.companyCode,

  Tr_crm_detail: {
    Tr_crm_detail_pelanggan: {},
    Tr_crm_detail_response: "",
    Tr_crm_detail_tanggal: "",
    Tr_crm_detail_type_pelanggan: "",
    Tr_crm_detail_feedback: "",
  },
  Tr_crm_nama: "",
  Tr_crm_kategori: "",
});

const options = [
  { label: "Follow Up Pembayaran", value: "Follow Up Pembayaran" },
  { label: "Follow Up PSB", value: "Follow Up PSB" },
  { label: "Follow Up Pelanggan", value: "Follow Up Pelanggan" },
];

const getData = async () => {
  const data = await crm_GetCrmById(route.params.id);
  savedData.value = data;
  savedData.value.Tr_crm_kategori = {
    label: data.Tr_crm_kategori,
    value: data.Tr_crm_kategori,
  };
};

onMounted(async () => {
  await getData();
});

const dataValidator = ref([
  { key: "Tr_crm_nama", label: "Detail CRM" },
  { key: "Tr_crm_kategori", label: "Kategori CRM" },
]);

const dataError = ref([]);

const validateForm = () => {
  dataError.value = [];

  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key]) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

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

      fixData.Tr_crm_kategori = fixData.Tr_crm_kategori.value;

      console.log(fixData);

      await crm_UpdateCrmById(fixData, route.params.id);

      await successCreate().then(() => {
        router.push("/modules/pelayanan/crm");
      });
    } catch (error) {
      await failedCreate(error);
    }
  }
};

const cancelAdd = async () => {
  const result = await Swal.fire({
    title: "Batalkan?",
    text: "anda yakin membatalkan edit data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await router.push("/modules/pelayanan/crm");
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
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode CRM
                </label>

                <input
                  disabled
                  type="text"
                  placeholder="Kode CRM"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  :value="savedData.Tr_crm_id"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Dibuat
                </label>

                <input
                  disabled
                  type="text"
                  placeholder="Kode CRM"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  :value="savedData.Tr_crm_created"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Data Pelanggan
                </label>

                <input
                  disabled
                  type="text"
                  placeholder="Detail Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  :value="
                    Object.keys(savedData.Tr_crm_detail).length !== 0
                      ? savedData.Tr_crm_detail.Tr_crm_detail_id +
                        ' - ' +
                        savedData.Tr_crm_detail.Tr_crm_detail_nama
                      : ''
                  "
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Kategori
                </label>
                <SelectGroup
                  placeholder="Kategori"
                  :options="options"
                  v-model="savedData.Tr_crm_kategori"
                />
              </div>
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Respons
                </label>
                <input
                  type="date"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_crm_detail.Tr_crm_detail_tanggal"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Detail CRM
                </label>
                <input
                  type="text"
                  placeholder="Detail CRM"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_crm_nama"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
      </div>

      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Detail CRM">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Dibuat Oleh
                </label>

                <input
                  disabled
                  type="text"
                  placeholder="Kode CRM"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  :value="
                    savedData.Tr_crm_updated.length > 0
                      ? savedData.Tr_crm_updated[0].Tr_crm_updated_nama
                      : ''
                  "
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Respons
                </label>

                <textarea
                  rows="2"
                  placeholder="Masukan Respons disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_crm_detail.Tr_crm_detail_response"
                ></textarea>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="xl:pt-2.5">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Feedback
                </label>

                <textarea
                  rows="2"
                  placeholder="Masukan Feedback disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_crm_detail.Tr_crm_detail_feedback"
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
