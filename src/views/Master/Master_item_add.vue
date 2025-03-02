<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import inputImageWithPreview from "@/components/Forms/SelectGroup/inputImageWithPreview.vue";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import { item_CreateDataWithImages, getUtilByName } from "@/stores/functionAPI";
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

// const optionsType = ref([]);
const optionsType = [
  { label: "Material", value: "Material" },
  { label: "Aset", value: "Aset" },
];

const pageTitle = ref("Tambah Item");
const pageList = ref(["Master", "Item", "Tambah"]);

// Saved Data
const savedData = ref({
  item_gambar: null,
  item_id: "",
  item_nama: "",
  item_tipe: "",
  item_satuan: "",
  item_keterangan: "",

  item_bundle: [],
  item_harga: [],
  item_konversi: [],

  item_user_created: indexStore.user.userName,
  item_created: "",
  item_updated: "",
  item_deleted: "N",
  companyName: indexStore.user.companyName,
  companyCode: indexStore.company.companyCode,
});

const materialData = ref([
  { satuan_awal: "", qty_awal: "", satuan_akhir: "", qty_akhir: "" },
]);

onMounted(async () => {
  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_teknis_tanggal = date;
  savedData.value.item_created = date;
});

// Function
const handleAddMaterialTerpakai = async () => {
  await successCreate(null, null, "top-end");
  materialData.value.push({
    satuan_awal: "",
    qty_awal: "",
    satuan_akhir: "",
    qty_akhir: "",
  });
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
    await router.push("/master/item");
  }
};

// Array validator untuk field wajib
const dataValidator = ref([
  { key: "item_id", label: "Kode Item" },
  { key: "item_nama", label: "Nama Item" },
  { key: "item_tipe", label: "Tipe Item" },
  { key: "item_satuan", label: "Satuan Item" },
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

      if (materialData.value && materialData.value.length > 0) {
        const cleanedArray = materialData.value.filter((item) => {
          return Object.values(item).some((value) => value !== "");
        });
        fixData.item_konversi = fixData.item_konversi.concat(cleanedArray);
      }

      if (fixData.item_tipe && fixData.item_tipe.value) {
        fixData.item_tipe = fixData.item_tipe.value;
      }
      fixData.item_konversi = JSON.stringify(fixData.item_konversi);
      fixData.item_harga = JSON.stringify(fixData.item_harga);
      fixData.item_bundle = JSON.stringify(fixData.item_bundle);
      fixData.companyCode = JSON.stringify(fixData.companyCode);

      const sendData = new FormData();

      // Append all fields to FormData
      Object.keys(fixData).forEach((key) => {
        if (Array.isArray(fixData[key])) {
          sendData.append(key, JSON.stringify(fixData[key])); // Ensure arrays are stringified
        } else {
          sendData.append(key, fixData[key]);
        }
      });

      await item_CreateDataWithImages(sendData);
      await successCreate().then(() => {
        router.push("/master/item");
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
        <DefaultCard cardTitle="Masukan Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/3">
                <div class="flex border flex-col items-center p-2 justify-end relative">
                  <inputImageWithPreview
                    label="Gambar"
                    v-model="savedData.item_gambar"
                    @update:file="(file) => (savedData.item_gambar = file)"
                  />
                </div>
              </div>
              <div class="lg:w-2/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Item
                </label>
                <input
                  type="text"
                  placeholder="Masukan Kode Item"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.item_id"
                />
                <label
                  class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
                >
                  Nama Item
                </label>
                <input
                  type="text"
                  placeholder="Masukan Nama Item"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.item_nama"
                />
              </div>
            </div>
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label
                  class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
                >
                  Tipe Item
                </label>
                <SelectGroup
                  placeholder="Pilih Tipe"
                  :options="optionsType"
                  v-model="savedData.item_tipe"
                />
              </div>
              <div class="lg:w-1/2">
                <label
                  class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
                >
                  Satuan
                </label>
                <input
                  type="text"
                  placeholder="Masukan Satuan Item"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.item_satuan"
                />
              </div>
            </div>

            <div class="hidden">
              <label
                class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
              >
                Brand Item
              </label>
              <input
                type="text"
                placeholder="Masukan Merk Item"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.item_brand"
              />
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
                  v-model="savedData.item_keterangan"
                ></textarea>
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Konversi">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in materialData"
              v-if="materialData.length > 0"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-3/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Qty. Awal
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-3 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qty_awal"
                  @change="validateQtyKeluar(index)"
                />
              </div>
              <div class="w-2/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Satuan
                </label>
                <input
                  type="text"
                  placeholder="Satuan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-2 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.satuan_awal"
                />
              </div>
              <div class="flex pt-5 items-center">-</div>
              <div class="w-3/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Qty. Akhir
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-3 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qty_akhir"
                  @change="validateQtyKeluar(index)"
                />
              </div>
              <div class="w-2/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Satuan
                </label>
                <input
                  type="text"
                  placeholder="Satuan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-2 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.satuan_akhir"
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
