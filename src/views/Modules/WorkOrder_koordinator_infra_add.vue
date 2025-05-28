<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import multiselectOption from "@/components/Forms/SelectGroup/multiselectOption.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";

import { useIndexStore } from "@/stores";
import {
  tl_CreateTask,
  getUserInternalByRole,
  tl_GetPrefixByDate,
} from "@/stores/functionAPI";
import { ref, onMounted } from "vue";
import router from "@/router";
import Swal from "sweetalert2";
import { getDateToday } from "@/stores/date";
import { showLoading, successCreate, failedCreate, confirmDelete } from "@/stores/swal";
import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";

const indexStore = useIndexStore();
const pageTitle = ref("Koordinator INFRA - Tambah");
const pageList = ref(["Work Order", "Koordinator", "INFRA", "Tambah"]);

const savedData = ref({
  Tr_task_id: "",
  Tr_task_created: "",
  CompanyName: indexStore.user.companyName,
  CompanyCode: indexStore.user.companyCode,

  Tr_task_divisi: "INFRA",
  Tr_task_list: [],
  Tr_task_updated: [],
  Tr_task_status: "Y",
  Tr_task_status_completition: 0,
});

const optionsTeknisi = ref([]);

const handleAddMaterialTerpakai = async () => {
  await successCreate(null, null, "top-end");
  savedData.value.Tr_task_list.push({
    Tr_task_list_nama_pekerjaan: "",
    Tr_task_list_completition: "",
    Tr_task_list_team: [],
    Tr_task_list_id_evident: "",
    Tr_task_list_evident: "N",
  });
};

const handleRemoveMaterialTerpakai = async (index) => {
  await confirmDelete(null, null, async () => {
    savedData.value.Tr_task_list.splice(index, 1);
  });
};

const countCompletion = async (id) => {
  // Hitung total completion dari yang punya nama pekerjaan
  const totalCompletion = savedData.value.Tr_task_list.filter(
    (item) => item.Tr_task_list_nama_pekerjaan
  ) // pastikan ada nama pekerjaan
    .reduce((total, item) => {
      // Ambil nilai completition
      const completion = item.Tr_task_list_completition;

      // Cek apakah completion adalah angka valid
      const parsed = parseFloat(completion);
      return total + (isNaN(parsed) ? 0 : parsed);
    }, 0);

  if (id !== undefined && totalCompletion > 100) {
    Swal.fire({
      title: "Error!",
      text: "Jumlah total progres melebihi 100% !",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      savedData.value.Tr_task_list[id].Tr_task_list_completition = "";
    });
  } else {
    savedData.value.Tr_task_status_completition = totalCompletion;
  }
};

onMounted(async () => {
  const data = await getUserInternalByRole(
    indexStore.user.companyName
    // "Teknisi " + savedData.value.Tr_teknis_jenis
  );
  optionsTeknisi.value = data.map((x, i) => ({
    id: i,
    name: x.userName,
    role: x.userRole,
  }));

  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.Tr_task_created = date;
  savedData.value.Tr_task_list.push({
    Tr_task_list_nama_pekerjaan: "",
    Tr_task_list_completition: "",
    Tr_task_list_team: [],
    Tr_task_list_id_evident: "",
    Tr_task_list_evident: "N",
  });
  savedData.value.Tr_task_updated.push({
    Tr_task_updated_nama: indexStore.user.userName,
    Tr_task_updated_tanggal: date,
  });
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
  const isValid = validateForm();

  if (!isValid) {
    return;
  }
  const result = await Swal.fire({
    title: "Tambah Data?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Tambah!",
    cancelButtonText: "Batal",
  });

  if (result.isConfirmed) {
    try {
      showLoading();

      const fixData = { ...savedData.value };

      fixData.Tr_task_list = fixData.Tr_task_list.filter(
        (x) => x.Tr_task_list_nama_pekerjaan !== ""
      );

      fixData.Tr_task_list = fixData.Tr_task_list.map((x) => ({
        ...x,
        Tr_task_list_completition: String(x.Tr_task_list_completition),
      }));

      fixData.Tr_task_pic = fixData.Tr_task_pic.map((x) => ({
        Tr_task_pic_nama: x.name,
        Tr_task_pic_divisi: x.role,
      }));
      fixData.Tr_task_status_completition = String(fixData.Tr_task_status_completition);
      const prefix = await tl_GetPrefixByDate("INFRA", fixData.Tr_task_created);
      if (prefix) {
        fixData.Tr_task_id = prefix.nextId;
      } else {
        return await failedCreate("Kode Prefix Error!");
      }

      await tl_CreateTask(fixData);

      await successCreate().then(() => {
        router.push("/modules/work-order/koordinator/infra");
      });
    } catch (error) {
      await failedCreate(error);
    }
  }
};

const cancelAdd = async () => {
  const result = await Swal.fire({
    title: "Batalkan?",
    text: "anda yakin membatalkan tambah data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await router.push("/modules/work-order/koordinator/infra");
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
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Nama Project
                </label>
                <input
                  type="text"
                  placeholder="Nama Project"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_task_nama"
                />
              </div>
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Teknisi
                </label>
                <multiselectOption
                  :options="optionsTeknisi"
                  v-model="savedData.Tr_task_pic"
                  placeholder="Pilih Teknisi..."
                />
              </div>
            </div>
          </div>
        </DefaultCard>
      </div>

      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Pekerjaan">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in savedData.Tr_task_list"
              v-if="savedData.Tr_task_list.length > 0"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-9/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Nama Pekerjaan
                </label>
                <input
                  type="text"
                  placeholder="Nama Pekerjaan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.Tr_task_list_nama_pekerjaan"
                />
              </div>
              <div class="w-3/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Progress (%)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  @input="countCompletion(index)"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.Tr_task_list_completition"
                />
              </div>
              <div class="w-1/12 flex items-end pb-2 flex-wrap">
                <div
                  class="flex w-full justify-center mb-3 cursor-pointer font-medium text-blue-600 hover:bg-opacity-90"
                  @click="handleAddMaterialTerpakai"
                  v-if="index === 0"
                >
                  <svg
                    class="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path :d="mdiPlusCircleOutline" />
                  </svg>
                </div>
                <ButtonDynamic
                  :disabled="index === 0"
                  :icon="mdiTrashCanOutline"
                  label=""
                  buttonClass="flex w-full justify-center p-2 mb-1 cursor-pointer rounded bg-red-500 text-gray-50 hover:bg-red-600"
                  @click="handleRemoveMaterialTerpakai(index)"
                />
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
          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <button
              @click="cancelAdd"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batalkan
            </button>
            <button
              @click="submitData"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Tambah Data
            </button>
          </div>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayout>
</template>
