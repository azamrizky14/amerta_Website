<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import multiselectReadOnly from "@/components/Forms/SelectGroup/multiselectReadOnly.vue";
import { mdiPlus, mdiTrashCanOutline } from "@mdi/js";

import { useIndexStore } from "@/stores";
import {
  tl_CreateTask,
  tl_GetPrefixByDate,
  tl_GetTaskById,
  tl_UpdateTaskById,
} from "@/stores/functionAPI";
import { ref, onMounted } from "vue";
import router from "@/router";
import Swal from "sweetalert2";
import { getDateToday } from "@/stores/date";
import { showLoading, successCreate, failedCreate, confirmDelete } from "@/stores/swal";
import { useRoute } from "vue-router";

const currentStep = ref(0);
const steps = ref([]);

const route = useRoute();

const indexStore = useIndexStore();
const pageTitle = ref("Koordinator PSB - Edit");
const pageList = ref(["Work Order", "Koordinator", "PSB", "Edit"]);

const savedData = ref({
  Tr_task_id: "",
  Tr_task_created: "",
  CompanyName: indexStore.user.companyName,
  CompanyCode: indexStore.user.companyCode,

  Tr_task_divisi: "PSB",
  Tr_task_list: [],
  Tr_task_updated: [],
  Tr_task_status: "Y",
  Tr_task_status_completition: "0",
});

// Navigate to a specific step
const goToStep = (stepIndex: number) => {
  if (stepIndex >= 0 && stepIndex < steps.value.length) {
    currentStep.value = stepIndex;
  }
};

// Navigate to a specific step
const addPekerjaan = () => {
  savedData.value.Tr_task_list.push({
    Tr_task_list_nama_pekerjaan: "",
    Tr_task_list_completition: "",
    Tr_task_list_team: [],
    Tr_task_list_id_evident: "",
    Tr_task_list_evident: "N",
  });

  if (steps.value.length === 1) {
    currentStep.value = 0;
  }
};

// Navigate to a specific step
const removePekerjaan = async (index) => {
  await confirmDelete(null, null, async () => {
    savedData.value.Tr_task_list.splice(index, 1);

    if (steps.value.length > 0) {
      currentStep.value = 0;
    }
  });
};

onMounted(async () => {
  const data = await tl_GetTaskById(route.params.id);
  savedData.value = data;
  savedData.value.Tr_task_pic = savedData.value.Tr_task_pic.map((x, i) => ({
    name: x.Tr_task_pic_nama,
    role: x.Tr_task_pic_divisi,
  }));

  savedData.value.Tr_task_list = savedData.value.Tr_task_list.map((x) => ({
    ...x,
    Tr_task_list_team: x.Tr_task_list_team.map((y) => ({
      name: y.Tr_task_list_team_nama,
      role: y.Tr_task_list_team_divisi,
    })),
  }));

  steps.value = savedData.value.Tr_task_list;
  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_task_created = date;
});

const dataValidator = ref([
  { key: "Tr_task_pic", label: "Teknisi" },
  { key: "Tr_task_nama", label: "Nama Project" },
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
  // const isValid = validateForm();

  // if (!isValid) {
  //   return;
  // }
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
      fixData.Tr_task_pic = fixData.Tr_task_pic.map((x) => ({
        Tr_task_pic_nama: x.name,
        Tr_task_pic_divisi: x.role,
      }));

      fixData.Tr_task_list.filter(
        (x) => x.Tr_task_list_nama_pekerjaan !== "" && x.Tr_task_list_evident !== "N"
      );

      fixData.Tr_task_list = fixData.Tr_task_list.map((x) => ({
        ...x,
        Tr_task_list_team: x.Tr_task_list_team.map((y) => ({
          Tr_task_list_team_nama: y.name,
          Tr_task_list_team_divisi: y.role,
        })),
      }));
      const prefix = await tl_GetPrefixByDate("PSB", fixData.Tr_task_created);
      if (prefix) {
        fixData.Tr_task_id = prefix.nextId;
      } else {
        return await failedCreate("Kode Prefix Error!");
      }

      await tl_UpdateTaskById(fixData, route.params.id);

      await successCreate().then(() => {
        router.push("/modules/work-order/koordinator/psb");
      });
    } catch (error) {
      await failedCreate(error);
    }
  }
};

const cancelAdd = async () => {
  const result = await Swal.fire({
    title: "Batalkan?",
    text: "anda yakin membatalkan Edit Data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await router.push("/modules/work-order/koordinator/psb");
  }
};
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div
        class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark col-span-2"
      >
        <div class="border-b border-stroke py-3 px-5 dark:border-strokedark">
          <!-- Progress bar -->
          <div class="flex items-center justify-between">
            <template v-for="(step, index) in steps" :key="index">
              <div class="flex items-center space-x-2">
                <!-- Clickable step indicators -->
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full focus:outline-none"
                  :class="
                    currentStep === index
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  "
                  @click="goToStep(index)"
                >
                  {{ step.Tr_teknis_work_order_kembali ? "C" : index + 1 }}
                </button>
              </div>
              <div
                v-if="index < steps.length"
                class="w-full h-[2px]"
                :class="currentStep > index ? 'bg-primary' : 'bg-gray-300'"
              ></div>
            </template>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <DefaultCard cardTitle="Data Umum">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Task
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Pelanggan"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_task_id"
                />
              </div>
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Progres Pengerjaan
                </label>
                <div
                  type="text"
                  placeholder="Nama Pelanggan"
                  class="w-full rounded-lg border-[1.5px] text-black bg-whiter px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                >
                  <span
                    class="inline-flex rounded-full bg-opacity-10 py-1 font-semibold"
                    :class="{
                      ' text-danger': Number(savedData.Tr_task_status_completition) === 0,
                      ' text-warning': Number(savedData.Tr_task_status_completition) > 0,
                      ' text-success':
                        Number(savedData.Tr_task_status_completition) === 100,
                    }"
                  >
                    {{ savedData.Tr_task_status_completition }} %
                  </span>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl Dibuat
                </label>
                <input
                  disabled
                  type="date"
                  placeholder="Nama Pelanggan"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_task_created"
                />
              </div>
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Dibuat Oleh
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Pelanggan"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  :value="
                    savedData.Tr_task_updated[0]
                      ? savedData.Tr_task_updated[0].Tr_task_updated_nama
                      : ''
                  "
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Nama Project
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Pelanggan"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_task_nama"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Teknisi
                </label>
                <multiselectReadOnly
                  disabled
                  :options="savedData.Tr_task_pic"
                  placeholder="List Teknisi..."
                />
              </div>
            </div>
          </div>
        </DefaultCard>
      </div>
      <div
        class="flex flex-col gap-5"
        v-if="savedData.Tr_task_list && savedData.Tr_task_list[currentStep]"
      >
        <div
          class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
              <div class="grid gap-0 grid-cols-3">
                <div class="col-span-2">List Pekerjaan</div>
                <div class="col-span-1 flex justify-end"></div>
              </div>
            </h3>
          </div>
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="w-3/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Nama Pekerjaan
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Pekerjaan"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="
                    savedData.Tr_task_list[currentStep].Tr_task_list_nama_pekerjaan
                  "
                />
              </div>
              <div class="w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Progress (%)
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="0"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_task_list[currentStep].Tr_task_list_completition"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="w-3/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Logistik
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Kode Logistik"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_task_list[currentStep].Tr_task_list_id_evident"
                />
              </div>
              <div class="w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Evident
                </label>
                <div class="flex items-center">
                  <label
                    :class="{
                      'bg-primary':
                        savedData.Tr_task_list[currentStep].Tr_task_list_evident === 'Y',
                      'bg-stroke':
                        savedData.Tr_task_list[currentStep].Tr_task_list_evident === 'N',
                    }"
                    class="relative m-0 block h-7.5 w-14 rounded-full"
                  >
                    <input
                      type="checkbox"
                      class="absolute top-0 z-50 m-0 h-full w-full opacity-0"
                    />
                    <span
                      :class="{
                        'right-1 translate-x-full':
                          savedData.Tr_task_list[currentStep].Tr_task_list_evident ===
                          'N',
                      }"
                      class="absolute top-1/2 left-1 flex h-6 w-6 -translate-y-1/2 translate-x-0 items-center justify-center rounded-full bg-white shadow-switcher duration-75 ease-linear"
                    >
                      <span class="dark:hidden"> </span>
                      <span class="hidden dark:inline-block"> </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Teknisi
                </label>
                <multiselectReadOnly
                  disabled
                  :options="savedData.Tr_task_list[currentStep].Tr_task_list_team"
                  placeholder="List Teknisi..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-9 col-span-2">
        <DefaultCard>
          <div class="pb-6 px-4 grid gap-2">
            <router-link
              to="/modules/work-order/koordinator/psb"
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
