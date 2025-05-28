<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import vSelect from "vue-select";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import {
  adminTeknis_CreateData,
  BonMaterial_GetPrefixByTypeAndDate,
  getUtilByName,
  stock_getDataForSO,
  stock_CreateSh,
} from "@/stores/functionAPI";
import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore();

const optionsType = ref([]);

const pageTitle = ref("Tambah Bon & Material New");
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
  companyCode: indexStore.user.companyCode, // otomatis

  // Array WO Terpakai
  Tr_teknis_work_order_terpakai: [],

  // Array WO Tersedia
  Tr_teknis_work_order_tersedia: [],

  // Array WO Kembali
  Tr_teknis_work_order_kembali: [],
});

const soList = ref([]);
const itemList = ref([]);

const materialData = ref([{ item: "", qty: "" }]);
const modemData = ref([{ item: "", kode: "" }]);
const tiangData = ref([{ item: "", kode: "" }]);
const kabelData = ref([{ item: "", qty: "", kode: "" }]);

onMounted(async () => {
  const dataSo = await stock_getDataForSO(
    indexStore.user.companyCode,
    indexStore.user.hierarchyCode
  );
  soList.value = dataSo;
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
const handleAddMaterialTerpakai = async (type) => {
  if (type === "kabelData") {
    await successCreate(null, null, "top-end");
    kabelData.value.push({ label: "", qty: "", kode: "" });
  } else if (type === "modemData") {
    await successCreate(null, null, "top-end");
    modemData.value.push({ label: "", kode: "" });
  } else if (type === "tiangData") {
    await successCreate(null, null, "top-end");
    tiangData.value.push({ label: "", kode: "" });
  } else {
    await successCreate(null, null, "top-end");
    materialData.value.push({ label: "", qty: "" });
  }
};

const handleRemoveMaterialTerpakai = async (index, type) => {
  if (type === "kabelData") {
    await confirmDelete(null, null, async () => {
      kabelData.value.splice(index, 1);
    });
  } else if (type === "modemData") {
    await confirmDelete(null, null, async () => {
      modemData.value.splice(index, 1);
    });
  } else if (type === "tiangData") {
    await confirmDelete(null, null, async () => {
      tiangData.value.splice(index, 1);
    });
  } else {
    await confirmDelete(null, null, async () => {
      materialData.value.splice(index, 1);
    });
  }
};

const getAvailableItems = (currentIndex, type) => {
  const sourceData = {
    kabelData: kabelData.value,
    modemData: modemData.value,
    tiangData: tiangData.value,
    materialData: materialData.value,
  }[type];

  const tipeFilterMap = {
    kabelData: ["Kabel"],
    modemData: ["Modem"],
    tiangData: ["Tiang"],
    materialData: ["Material", "Aset"],
  };

  const currentTipeList = tipeFilterMap[type];

  if (!itemList.value.lokasi_item || !sourceData) return [];

  const usedItemKeys = new Set(); // <== ganti dari usedItemIds
  const usedPropertyIds = new Set();

  sourceData.forEach((entry, idx) => {
    if (idx !== currentIndex) {
      if (
        entry.item?.Sh_item_tipe === "Material" ||
        entry.item?.Sh_item_tipe === "Aset"
      ) {
        const key = `${entry.item.Sh_item_id}|${entry.item.Sh_item_jenis}`;
        usedItemKeys.add(key);
      } else if (entry.kode) {
        usedPropertyIds.add(entry.kode.item_properties_id);
      }
    }
  });

  return itemList.value.lokasi_item.filter((item) => {
    if (!currentTipeList.includes(item.Sh_item_tipe)) return false;

    if (item.Sh_item_tipe === "Material" || item.Sh_item_tipe === "Aset") {
      const key = `${item.Sh_item_id}|${item.Sh_item_jenis}`;
      return !usedItemKeys.has(key);
    }

    if (!Array.isArray(item.Sh_item_properties)) return false;

    const hasUnusedProps = item.Sh_item_properties.some(
      (prop) => !usedPropertyIds.has(prop.item_properties_id)
    );

    return hasUnusedProps;
  });
};

const formatForSh = (data) => {
  const {
    companyName,
    companyCode,
    Tr_teknis_work_order_tersedia,
    Tr_teknis_logistik_id,
    Tr_teknis_tanggal,
    Tr_teknis_user_created,
    Tr_teknis_lokasi,
  } = data;

  const result = Tr_teknis_work_order_tersedia.map((item) => {
    return {
      Sh_item_id: item.Sh_item_id,
      Sh_item_nama: item.Sh_item_nama,
      Sh_item_jenis: item.Sh_item_jenis,
      Sh_item_qty: item.Sh_item_qty,
      Sh_item_satuan: item.Sh_item_satuan,
      Sh_item_tipe: item.Sh_item_tipe,
      Sh_item_properties: item.Sh_item_properties || [],
      Sh_item_status: "intangible", // asumsi default
      Sh_type: "out", // asumsi default
      Sh_location_from: Tr_teknis_lokasi, // asumsi default
      Sh_location_to: "floating-" + Tr_teknis_logistik_id, // contoh: "Gudang Pasuruan"
      Sh_source: "bon-material",
      Sh_source_id: Tr_teknis_logistik_id,
      companyName: companyName,
      companyCode: companyCode,
      Sh_keterangan: "",
      Sh_created_date: Tr_teknis_tanggal,
      Sh_user_created: Tr_teknis_user_created,
      Sh_deleted: "N",
    };
  });

  return result;
};

const mergeItemData = (data) => {
  const grouped = {};

  data.forEach((entry) => {
    const item = entry.item;
    const kode = entry.kode;
    const key = `${item.Sh_item_id}-${item.Sh_item_jenis}`;

    if (!grouped[key]) {
      grouped[key] = {
        Sh_item_id: item.Sh_item_id,
        Sh_item_nama: item.Sh_item_nama,
        Sh_item_tipe: item.Sh_item_tipe,
        Sh_item_jenis: item.Sh_item_jenis,
        Sh_item_satuan: item.Sh_item_satuan,
        Sh_item_qty: 0,
        Sh_item_properties: [],
      };
    }

    grouped[key].Sh_item_qty += 1;

    if (kode && Object.keys(kode).length > 0) {
      grouped[key].Sh_item_properties.push(kode);
    }
  });

  // Konversi objek hasil pengelompokan ke array
  return Object.values(grouped);
};

// ✅ Fungsi untuk memfilter properti dari 1 item
const getAvailableProperties = (item, currentIndex, type) => {
  if (!item || !item.Sh_item_properties) return [];

  const sourceData = {
    kabelData: kabelData.value,
    modemData: modemData.value,
    tiangData: tiangData.value,
    materialData: materialData.value,
  }[type];

  const usedPropertyIds = new Set();

  sourceData.forEach((entry, idx) => {
    if (idx !== currentIndex && entry.kode) {
      usedPropertyIds.add(entry.kode.item_properties_id);
    }
  });

  return item.Sh_item_properties.filter(
    (prop) => !usedPropertyIds.has(prop.item_properties_id)
  );
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
const validateQtyKeluar = (index, type) => {
  let dataToValidate;

  // Tentukan sumber data berdasarkan 'type'
  switch (type) {
    case "materialData":
      dataToValidate = materialData.value;
      break;
    case "kabelData":
      dataToValidate = kabelData.value;
      break;
    case "modemData":
      dataToValidate = modemData.value;
      break;
    case "tiangData":
      dataToValidate = tiangData.value;
      break;
    default:
      return;
  }
  // Validasi qtyKeluar tidak boleh kosong atau kurang dari 1
  if (dataToValidate[index].item === "") {
    Swal.fire({
      title: "Error!",
      text: "Pilih Barang Terlebih Dahulu!",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      dataToValidate[index].qty = "";
    });
  } else if (dataToValidate[index].qty < 0) {
    Swal.fire({
      title: "Error!",
      text: "Minimal jumlah input adalah 0",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      dataToValidate[index].qty = 1;
    });
  } else {
    if (
      type === "materialData" &&
      dataToValidate[index].item.Sh_item_qty < dataToValidate[index].qty
    ) {
      Swal.fire({
        title: "Error!",
        text: "Jumlah Input Melebihi Stock!",
        icon: "error",
        position: "top-end",
        timer: 1000,
        showConfirmButton: false,
        toast: true,
      }).then(() => {
        dataToValidate[index].qty = "";
      });
    } else if (type !== "materialData" && dataToValidate[index].kode === "") {
      Swal.fire({
        title: "Error!",
        text: "Pilih kode barang dulu!",
        icon: "error",
        position: "top-end",
        timer: 1000,
        showConfirmButton: false,
        toast: true,
      }).then(() => {
        dataToValidate[index].qty = "";
      });
    } else if (
      type !== "materialData" &&
      dataToValidate[index].kode.item_properties_qty < dataToValidate[index].qty
    ) {
      Swal.fire({
        title: "Error!",
        text: "Jumlah Input Melebihi Stock!",
        icon: "error",
        position: "top-end",
        timer: 1000,
        showConfirmButton: false,
        toast: true,
      }).then(() => {
        dataToValidate[index].qty = "";
      });
    }
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
  if (Object.keys(itemList.value).length === 0) {
    dataError.value.push(`Lokasi Barang tidak boleh kosong!`);
  }

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
        fixData.Tr_teknis_work_order_tersedia = fixData.Tr_teknis_work_order_tersedia.concat(
          cleanedArray
        );
      }

      const modemList = mergeItemData(modemData.value);
      const kabelList = mergeItemData(kabelData.value);
      const tiangList = mergeItemData(tiangData.value);
      modemList.forEach((x) => {
        fixData.Tr_teknis_work_order_tersedia.push(x);
      });
      tiangList.forEach((x) => {
        fixData.Tr_teknis_work_order_tersedia.push(x);
      });
      kabelList.forEach((x) => {
        fixData.Tr_teknis_work_order_tersedia.push(x);
      });

      // console.log("awawl", fixData);
      fixData.Tr_teknis_work_order_tersedia = fixData.Tr_teknis_work_order_tersedia.filter(
        (x) => x.item?.Sh_item_id || x.Sh_item_id
      ).map((x) => {
        let data = {};

        if (x.item) {
          data = {
            ...x.item,
            Sh_item_qty: x.qty,
          };
        } else {
          data = {
            ...x,
          };
        }
        return data;
      });

      const prefix = await BonMaterial_GetPrefixByTypeAndDate(
        fixData.Tr_teknis_jenis.value,
        fixData.Tr_teknis_created,
        fixData.companyCode
      );
      fixData.Tr_teknis_logistik_id = prefix.nextId;
      fixData.Tr_teknis_jenis = fixData.Tr_teknis_jenis.value;
      fixData.Tr_teknis_lokasi = itemList.value.lokasi_nama;

      const dataForSh = formatForSh(fixData);

      await adminTeknis_CreateData(fixData);
      await stock_CreateSh(dataForSh);
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

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div class="flex flex-col gap-9 col-span-1">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Lokasi Barang
                </label>
                <v-select
                  v-model="itemList"
                  :options="soList"
                  :clearable="false"
                  label="lokasi_nama"
                  placeholder="Pilih Lokasi Barang"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <template #selected-option>
                    <span class="dark:text-white">{{ itemList.lokasi_nama }}</span>
                  </template>
                </v-select>
              </div>
            </div>
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
              <div class="lg:w-2/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Dibuat
                </label>
                <input
                  type="date"
                  placeholder="Tgl. Dibuat"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-2 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_tanggal"
                />
              </div>
            </div>
            <div class="flex flex-col gap-3">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Nama Tas
                </label>
                <input
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_item"
                />
              </div>
            </div>

            <!-- Qty Keluar Input -->
            <div>
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Keterangan
                </label>
                <textarea
                  rows="3"
                  placeholder="Masukan keterangan disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_keterangan"
                ></textarea>
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-4 col-span-2" v-if="Object.keys(itemList).length > 0">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Material & Aset">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-4 xl:flex-row"
              v-for="(data, index) in materialData"
              v-if="materialData.length > 0"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-6/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Nama Barang
                </label>
                <v-select
                  v-model="data.item"
                  :options="
                    itemList.lokasi_item ? getAvailableItems(index, 'materialData') : []
                  "
                  :clearable="false"
                  label="Sh_item_nama"
                  placeholder="Pilih Barang"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <!-- Dropdown list -->
                  <template #option="option">
                    <template v-if="option">
                      {{ option.Sh_item_nama }} - {{ option.Sh_item_jenis }}
                    </template>
                    <template v-else>
                      <em class="text-gray-400">Loading...</em>
                    </template>
                  </template>

                  <!-- Saat sudah dipilih -->
                  <template #selected-option="option">
                    <span class="dark:text-white"
                      >{{ option?.Sh_item_nama }} - {{ option?.Sh_item_jenis }}</span
                    >
                  </template>
                </v-select>
              </div>
              <div class="w-2/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Tersedia
                </label>
                <input
                  disabled
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 pl-2 pr-0 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  :value="data.item ? data.item.Sh_item_qty : ''"
                />
              </div>
              <div class="w-2/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Keluar
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 pl-2 pr-0 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qty"
                  @input="validateQtyKeluar(index, 'materialData')"
                />
              </div>
              <div class="w-1/12 flex items-end pb-2 flex-wrap">
                <div
                  class="flex w-full justify-center mb-3 cursor-pointer font-medium text-blue-600 hover:bg-opacity-90"
                  @click="handleAddMaterialTerpakai('')"
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
                  @click="handleRemoveMaterialTerpakai(index, '')"
                />
              </div>
            </div>

            <div class="my-2 border border-gray"></div>

            <div
              class="flex flex-col gap-4 xl:flex-row"
              v-for="(data, index) in kabelData"
              v-if="kabelData.length > 0"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-4/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Nama Kabel
                </label>
                <v-select
                  v-model="data.item"
                  :options="
                    itemList.lokasi_item ? getAvailableItems(index, 'kabelData') : []
                  "
                  :clearable="false"
                  label="Sh_item_nama"
                  placeholder="Pilih Kabel"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <!-- Dropdown list -->
                  <template #option="option">
                    <template v-if="option">
                      {{ option.Sh_item_nama }} - {{ option.Sh_item_jenis }}
                    </template>
                    <template v-else>
                      <em class="text-gray-400">Loading...</em>
                    </template>
                  </template>

                  <!-- Saat sudah dipilih -->
                  <template #selected-option="option">
                    <span class="dark:text-white"
                      >{{ option?.Sh_item_nama }} - {{ option?.Sh_item_jenis }}</span
                    >
                  </template>
                </v-select>
              </div>
              <div class="w-4/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Kode Kabel
                </label>
                <v-select
                  v-model="data.kode"
                  :options="
                    data.item?.Sh_item_properties
                      ? getAvailableProperties(data.item, index, 'kabelData')
                      : []
                  "
                  :clearable="false"
                  label="Sh_item_nama"
                  placeholder="Pilih Kabel"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <!-- Dropdown list -->
                  <template #option="option">
                    <template v-if="option">
                      {{ option.item_properties_id }}
                    </template>
                    <template v-else>
                      <em class="text-gray-400">Loading...</em>
                    </template>
                  </template>

                  <!-- Saat sudah dipilih -->
                  <template #selected-option="option">
                    <span class="dark:text-white"> {{ option.item_properties_id }}</span>
                  </template>
                </v-select>
              </div>
              <div class="w-2/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Tersedia
                </label>
                <input
                  disabled
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 pl-2 pr-0 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  :value="data.kode ? data.kode.item_properties_qty : ''"
                />
              </div>
              <div class="w-1/12 flex items-end pb-2 flex-wrap">
                <div
                  class="flex w-full justify-center mb-3 cursor-pointer font-medium text-blue-600 hover:bg-opacity-90"
                  @click="handleAddMaterialTerpakai('kabelData')"
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
                  @click="handleRemoveMaterialTerpakai(index, 'kabelData')"
                />
              </div>
            </div>

            <div class="my-2 border border-gray"></div>

            <div
              class="flex flex-col gap-6 xl:flex-row"
              v-for="(data, index) in modemData"
              v-if="modemData.length > 0"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-5/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Nama Modem
                </label>
                <v-select
                  v-model="data.item"
                  :options="
                    itemList.lokasi_item ? getAvailableItems(index, 'modemData') : []
                  "
                  :clearable="false"
                  label="Sh_item_nama"
                  placeholder="Pilih Kabel"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <!-- Dropdown list -->
                  <template #option="option">
                    <template v-if="option">
                      {{ option.Sh_item_nama }} - {{ option.Sh_item_jenis }}
                    </template>
                    <template v-else>
                      <em class="text-gray-400">Loading...</em>
                    </template>
                  </template>

                  <!-- Saat sudah dipilih -->
                  <template #selected-option="option">
                    <span class="dark:text-white"
                      >{{ option?.Sh_item_nama }} - {{ option?.Sh_item_jenis }}</span
                    >
                  </template>
                </v-select>
              </div>
              <div class="w-5/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Kode Modem
                </label>
                <v-select
                  v-model="data.kode"
                  :options="
                    data.item?.Sh_item_properties
                      ? getAvailableProperties(data.item, index, 'modemData')
                      : []
                  "
                  :clearable="false"
                  label="item_properties_id"
                  placeholder="Pilih Kabel"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <!-- Dropdown list -->
                  <template #option="option">
                    <template v-if="option">
                      {{ option.item_properties_id }}
                    </template>
                    <template v-else>
                      <em class="text-gray-400">Loading...</em>
                    </template>
                  </template>

                  <!-- Saat sudah dipilih -->
                  <template #selected-option="option">
                    <span class="dark:text-white"> {{ option.item_properties_id }}</span>
                  </template>
                </v-select>
              </div>
              <div class="w-1/12 flex items-end pb-2 flex-wrap">
                <div
                  class="flex w-full justify-center mb-3 cursor-pointer font-medium text-blue-600 hover:bg-opacity-90"
                  @click="handleAddMaterialTerpakai('modemData')"
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
                  @click="handleRemoveMaterialTerpakai(index, 'modemData')"
                />
              </div>
            </div>

            <div class="my-2 border border-gray"></div>

            <div
              class="flex flex-col gap-6 xl:flex-row"
              v-for="(data, index) in tiangData"
              v-if="tiangData.length > 0"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-5/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Nama Tiang
                </label>
                <v-select
                  v-model="data.item"
                  :options="
                    itemList.lokasi_item ? getAvailableItems(index, 'tiangData') : []
                  "
                  :clearable="false"
                  label="Sh_item_nama"
                  placeholder="Pilih Kabel"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <!-- Dropdown list -->
                  <template #option="option">
                    <template v-if="option">
                      {{ option.Sh_item_nama }} - {{ option.Sh_item_jenis }}
                    </template>
                    <template v-else>
                      <em class="text-gray-400">Loading...</em>
                    </template>
                  </template>

                  <!-- Saat sudah dipilih -->
                  <template #selected-option="option">
                    <span class="dark:text-white"
                      >{{ option?.Sh_item_nama }} - {{ option?.Sh_item_jenis }}</span
                    >
                  </template>
                </v-select>
              </div>
              <div class="w-5/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Kode Tiang
                </label>
                <v-select
                  v-model="data.kode"
                  :options="
                    data.item?.Sh_item_properties
                      ? getAvailableProperties(data.item, index, 'tiangData')
                      : []
                  "
                  :clearable="false"
                  label="Sh_item_nama"
                  placeholder="Pilih Kabel"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <!-- Dropdown list -->
                  <template #option="option">
                    <template v-if="option">
                      {{ option.item_properties_id }}
                    </template>
                    <template v-else>
                      <em class="text-gray-400">Loading...</em>
                    </template>
                  </template>

                  <!-- Saat sudah dipilih -->
                  <template #selected-option="option">
                    <span class="dark:text-white"> {{ option.item_properties_id }}</span>
                  </template>
                </v-select>
              </div>
              <div class="w-1/12 flex items-end pb-2 flex-wrap">
                <div
                  class="flex w-full justify-center mb-3 cursor-pointer font-medium text-blue-600 hover:bg-opacity-90"
                  @click="handleAddMaterialTerpakai('tiangData')"
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
                  @click="handleRemoveMaterialTerpakai(index, 'tiangData')"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <div class="flex flex-col gap-9 col-span-3">
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
