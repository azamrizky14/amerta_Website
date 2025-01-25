<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import { lokasi_CreateData, lokasi_getDataByType } from "@/stores/functionAPI";
import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";
import selectOption from "@/components/Forms/SelectGroup/selectOption.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore();

interface Option {
  id: number;
  name: string;
}

const options: Option[] = [
  { id: 1, name: "Option 1" },
  { id: 2, name: "Option 2" },
  { id: 3, name: "Option 3" },
  { id: 4, name: "Option 4" },
  { id: 5, name: "Option 5" },
];

// const optionsType = ref([]);
const optionsType = [
  { id: 1, label: "gudang", value: "gudang" },
  { id: 2, label: "ruang", value: "ruang" },
  { id: 3, label: "rak", value: "rak" },
];

const optionsGudang = ref([]);
const optionsRuang = ref([]);
const pageTitle = ref("Tambah Purchase Order");
const pageList = ref(["Work Order", "Purchase", "Purchase Order", "Tambah"]);

// Saved Data
const savedData = ref({
  Tr_po_id: "",
  Tr_po_supplier: "",
  Tr_po_status: "open",
  Tr_po_keterangan: "",
  Tr_po_item: [],

  Tr_po_user_created: indexStore.user.userName,
  Tr_po_created: "",
  Tr_po_tanggal: "",
  Tr_po_deleted: "N",
  companyName: indexStore.user.companyName,
});

const materialData = ref([
  { satuan_awal: "", qty_awal: "", satuan_akhir: "", qty_akhir: "" },
]);

onMounted(async () => {
  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_po_created = date;

  savedData.value.Tr_po_created = date;
});

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
    await router.push("/master/location");
  }
};

// Array validator untuk field wajib
const dataValidator = ref([
  { key: "Tr_po_tanggal", label: "Tgl. Dibutuhkan" },
  // { key: "Tr_po_item", label: "List Item" },
]);

const dataError = ref([]); // Array untuk menyimpan error

const submitData = async () => {
  console.log(savedData.value);
  // Clear previous errors
  dataError.value.splice(0, dataError.value.length);

  // Validasi field wajib dari data utama
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key] || savedData.value[validator.key].length === 0) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  // Jika ada error, tampilkan di halaman dan hentikan submit
  if (dataError.value.length > 0) {
    return; // Jangan lanjutkan jika ada error
  }

  // Jika tidak ada error, lanjutkan dengan SweetAlert konfirmasi
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

      await lokasi_CreateData(fixData);
      await successCreate().then(() => {
        router.push("/master/location");
      });
    } catch (error) {
      await failedCreate(error);
    }
  }
};
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <!-- ====== Form Elements Section Start -->

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Nama Supplier
                </label>
                <input
                  type="text"
                  placeholder="Masukan Nama Supplier"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_po_supplier"
                />
              </div>
            </div>
            <div class="flex flex-col gap-3">
              <div>
                <label
                  class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
                >
                  Tgl. Dibutuhkan
                </label>
                <input
                  type="date"
                  placeholder="Masukan Nama Supplier"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_po_tanggal"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Data Tambahan">
          <div class="p-6.5">
            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Keterangan
              </label>
              <textarea
                rows="5"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_po_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <div class="flex flex-col gap-9 col-span-2">
        <!-- Input Fields Start -->
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
        <!-- Input Fields End -->
      </div>
    </div>

    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
