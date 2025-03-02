<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import {
  adminTeknis_CreateData,
  BonMaterial_GetPrefixByTypeAndDate,
  getUtilByName,
} from "@/stores/functionAPI";
import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";
import multiselectOption from "@/components/Forms/SelectGroup/multiselectOption.vue";
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

const optionsType = ref([]);

const pageTitle = ref("Tambah Bon & Material");
const pageList = ref(["Work Order", "Bon & Material", "Tambah"]);

// Saved Data
const savedData = ref({
  Tr_teknis_item: "", // wajib
  // Tr_teknis_team: [],
  Tr_teknis_keterangan: "",
  Tr_teknis_keterangan_closing: "",

  Tr_teknis_logistik_id: "",
  Tr_teknis_user_created: "", // otomatis
  Tr_teknis_user_closed: "",
  Tr_teknis_tanggal: "",
  Tr_teknis_created: "",
  Tr_teknis_closed: "",

  Tr_teknis_status: "open", // otomatis
  Tr_teknis_jenis: "", // otomatis
  Tr_teknis_deleted: "N", // otomatis
  companyName: indexStore.user.companyName, // otomatis
  companyCode: indexStore.company.companyCode, // otomatis

  // Array WO Terpakai
  Tr_teknis_work_order_terpakai: [],

  // Array WO Tersedia
  Tr_teknis_work_order_tersedia: [],

  // Array WO Kembali
  Tr_teknis_work_order_kembali: [],
});

const materialData = ref([{ label: "", qty: "" }]);

onMounted(async () => {
  const data = await getUtilByName("bonMaterial");
  if (data && data.utilData.length > 0) {
    let option = await data.utilData.find(
      (x) =>
        Array.isArray(x.companyCode) &&
        Array.isArray(indexStore.company.companyCode) &&
        x.companyCode.length === indexStore.company.companyCode.length &&
        x.companyCode.every(
          (value, index) => value === indexStore.company.companyCode[index]
        )
    );
    option = option.bonMaterialList.map((x) => ({
      label: x,
      value: x,
    }));
    optionsType.value = [...option];
  }
  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_teknis_tanggal = date;
  savedData.value.Tr_teknis_created = date;
  savedData.value.Tr_teknis_user_created = indexStore.user.userName;
});

// Function
const handleAddMaterialTerpakai = async () => {
  await successCreate(null, null, "top-end");
  materialData.value.push({ label: "", qty: "" });
};

const handleRemoveMaterialTerpakai = async (index) => {
  await confirmDelete(null, null, async () => {
    materialData.value.splice(index, 1);
  });
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
    await router.push("/modules/work-order/bon-dan-material");
  }
};

// Array validator untuk field wajib
const dataValidator = ref([
  { key: "Tr_teknis_item", label: "Nama Tas" },
  { key: "Tr_teknis_jenis", label: "Tim Peminta" },
  { key: "Tr_teknis_tanggal", label: "Tanggal" },
]);

const dataError = ref([]); // Array untuk menyimpan error

// Validasi qtyKeluar tidak boleh kurang dari 1
const validateQtyKeluar = (index) => {
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  if (materialData.value[index].qty !== "" && materialData.value[index].qty < 1) {
    Swal.fire({
      title: "Error!",
      text: "Minimal jumlah input adalah 1",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      materialData.value[index].qty = 1;
    });
  }
};

const submitData = async () => {
  // Clear previous errors
  dataError.value.splice(0, dataError.value.length);

  // Validasi field wajib dari data utama
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key] || savedData.value[validator.key].length === 0) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  // Validasi untuk setiap objek dalam materialData
  materialData.value.forEach((item, index) => {
    // Validasi label
    if (!item.label || item.label.trim() === "") {
      dataError.value.push(`Material ${index + 1}: Nama Barang tidak boleh kosong!`);
    }
    // Validasi qty
    if (!item.qty || String(item.qty).trim() === "") {
      dataError.value.push(`Material ${index + 1}: Qty. Keluar tidak boleh kosong!`);
    }

    // Tambahkan validasi qtyKeluar tidak boleh kurang dari 1
    validateQtyKeluar(index);
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

      if (materialData.value && materialData.value.length > 0) {
        const cleanedArray = materialData.value.filter((item) => {
          return Object.values(item).some((value) => value !== "");
        });
        fixData.Tr_teknis_work_order_terpakai_material = cleanedArray.sort((a, b) => {
          const aHasONT = a.label.toLowerCase().includes("ont");
          const bHasONT = b.label.toLowerCase().includes("ont");

          if (aHasONT && !bHasONT) return 1; // Move `a` after `b`
          if (!aHasONT && bHasONT) return -1; // Keep `a` before `b`
          return 0; // Maintain order otherwise
        });
        fixData.Tr_teknis_work_order_tersedia = fixData.Tr_teknis_work_order_tersedia.concat(
          cleanedArray
        );
      }

      const prefix = await BonMaterial_GetPrefixByTypeAndDate(
        fixData.Tr_teknis_jenis.value,
        fixData.Tr_teknis_created,
        fixData.companyCode
      );
      fixData.Tr_teknis_logistik_id = prefix.nextId;
      fixData.Tr_teknis_jenis = fixData.Tr_teknis_jenis.value;

      await adminTeknis_CreateData(fixData);
      await successCreate().then(() => {
        router.push("/modules/work-order/bon-dan-material");
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

    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tim Peminta
                </label>
                <SelectGroup
                  placeholder="Pilih Tim"
                  :options="optionsType"
                  v-model="savedData.Tr_teknis_jenis"
                />
              </div>
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Nama Tas
                </label>
                <input
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_item"
                />
              </div>
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Dibuat
                </label>
                <input
                  type="date"
                  placeholder="Tgl. Dibuat"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-2 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_tanggal"
                />
              </div>
            </div>

            <!-- Qty Keluar Input -->
            <div>
              <!-- <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Teknisi
              </label>
              <div>
                <multiselectOption
                  :options="options"
                  v-model="savedData.Tr_teknis_team"
                  placeholder="Pilih Teknisi..."
                />
              </div>
            </div> -->

              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Keterangan
                </label>
                <textarea
                  rows="3"
                  placeholder="Masukan keterangan disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_keterangan"
                ></textarea>
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Material">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in materialData"
              v-if="materialData.length > 0"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-8/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Nama Barang
                </label>
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-else-if="data.label.toLowerCase().includes('ont')"
                >
                  ONT
                </label>
                <input
                  type="text"
                  placeholder="Nama Barang"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.label"
                />
              </div>
              <div class="w-4/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Qty. Keluar
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qty"
                  @change="validateQtyKeluar(index)"
                />
              </div>
              <div class="w-1/12 flex items-end pb-2 flex-wrap">
                <div
                  class="flex w-full justify-center mb-5 cursor-pointer font-medium text-blue-600 hover:bg-opacity-90"
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
                  buttonClass="flex w-full justify-center p-2 cursor-pointer rounded bg-red-500 text-gray-50 hover:bg-red-600"
                  @click="handleRemoveMaterialTerpakai(index)"
                />
              </div>
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
