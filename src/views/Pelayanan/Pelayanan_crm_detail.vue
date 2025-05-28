<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";

import { useIndexStore } from "@/stores";
import { useRoute } from "vue-router";
import { crm_GetCrmById } from "@/stores/functionAPI";
import { ref, onMounted } from "vue";

const indexStore = useIndexStore();
const route = useRoute();
const pageTitle = ref("CRM - Detail");
const pageList = ref(["Pelayanan", "CRM", "Detail"]);

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
                  Kategori
                </label>
                <SelectGroup
                  disabled
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
                  disabled
                  type="date"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_crm_detail.Tr_crm_detail_tanggal"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Detail CRM
                </label>
                <input
                  disabled
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
                  disabled
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
                  disabled
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
          <div class="pb-6 px-4 grid gap-2">
            <router-link
              to="/modules/pelayanan/crm"
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
