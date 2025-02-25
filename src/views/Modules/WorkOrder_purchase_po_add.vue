<script setup lang="ts">
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import {
  po_GetPrefixByDate,
  po_CreatePO,
  item_getAllItemWithStatus,
  lokasi_getAllLocationWithStatus,
} from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore();

interface Option {
  id: number;
  name: string;
}

const pageTitle = ref("Tambah Purchase Order");
const pageList = ref(["Work Order", "Purchase", "Purchase Order", "Tambah"]);

// Saved Data
const savedData = ref({
  Tr_po_id: "",
  Tr_po_status: "open",
  Tr_po_keterangan: "",
  Tr_po_lokasi: "",
  Tr_po_item: [],

  Tr_po_user_created: indexStore.user.userName,
  Tr_po_created: "",
  Tr_po_tanggal: "",
  Tr_po_deleted: "N",
  Tr_po_domain: indexStore.user.companyName,
});

const materialData = ref<Row[]>([]);

const itemList = ref([]);
const lokasiList = ref([]);

onMounted(async () => {
  const data = await item_getAllItemWithStatus(
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode,
    "N"
  );
  itemList.value = data;
  const dataLokasi = await lokasi_getAllLocationWithStatus(
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode,
    "N"
  );
  lokasiList.value = dataLokasi;
  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_po_created = date;

  // Tambahkan 100 objek ke materialData
  for (let i = 0; i < 100; i++) {
    materialData.value.push({
      item_id: "",
      item_nama: "",
      item_satuan: "",
      item_merk: "",
      item_supplier: "",
      item_keterangan: "",
      item_jumlah: 0,
      item_harga: 0,
      item_total: 0,
    });
  }

  savedData.value.Tr_po_created = date;
});

const formatNumber = (value) => {
  const data = value.toLocaleString("id-ID"); // Gunakan "id-ID" untuk format Indonesia
  return data;
};

const changeRowItem = (type, index, value) => {
  console.log("tes", type, index, value);
  let data;
  if (type === "id") {
    data = itemList.value.find((x) => x.item_id === value);
  } else if (type === "nama") {
    data = itemList.value.find((x) => x.item_nama === value);
  }
  if (data) {
    const updatedData = {
      item_id: data.item_id,
      item_nama: data.item_nama,
      item_satuan: data.item_satuan,
      item_merk: "",
      item_supplier: "",
      item_keterangan: "",
      item_jumlah: 0,
      item_harga: 0,
      item_total: 0,
    };
    materialData.value[index] = updatedData;
  } else if (value === null) {
    materialData.value[index] = {
      item_id: "",
      item_nama: "",
      item_satuan: "",
      item_merk: "",
      item_supplier: "",
      item_keterangan: "",
      item_jumlah: 0,
      item_harga: 0,
      item_total: 0,
    };
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
    await router.push("/modules/work-order/purchase/po");
  }
};

// Validasi qtyKeluar tidak boleh kurang dari 1
const validateQtyDisc = (index) => {
  const data = materialData.value[index].item_disc;
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  if (data !== "" && (data < 0 || data > 100)) {
    Swal.fire({
      title: "Error!",
      text: "Jumlah input harus antara 0 - 100",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      materialData.value[index].item_disc = 0;
    });
  }
};

// Validasi qtyKeluar tidak boleh kurang dari 1
const validateQtyTax = (index) => {
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  const data = materialData.value[index].item_tax;
  if (data !== "" && (data < 0 || data > 100)) {
    Swal.fire({
      title: "Error!",
      text: "Jumlah input harus antara 0 - 100",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      materialData.value[index].item_tax = 0;
    });
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
      fixData.Tr_po_item = materialData.value.filter(
        (x) =>
          x.item_id !== null &&
          x.item_id !== "" &&
          x.item_id !== undefined &&
          x.item_nama !== null &&
          x.item_nama !== "" &&
          x.item_nama !== undefined
      );
      const prefix = await po_GetPrefixByDate(fixData.Tr_po_created);
      fixData.Tr_po_id = prefix.nextId;

      await po_CreatePO(fixData);
      await successCreate().then(() => {
        router.push("/modules/work-order/purchase/po");
      });
    } catch (error) {
      await failedCreate(error);
    }
  }
};

// code excel

interface Row {
  item_id: string;
  item_nama: string;
  item_satuan: string;
  item_merk: string;
  item_jumlah: number;
  item_harga: number;
  item_total: number;
}

// Fungsi untuk menghitung harga total
const calculateTotal = (row: Row) => {
  row.item_total = row.item_jumlah * row.item_harga;
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
          <div class="flex flex-col gap-2 p-6.5 mb-1">
            <div class="flex flex-col gap-3">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Lokasi Tujuan
                </label>

                <v-select
                  v-model="savedData.Tr_po_lokasi"
                  :options="lokasiList"
                  :reduce="(item) => item.lokasi_nama"
                  label="lokasi_nama"
                  placeholder="Masukan Tujuan PO"
                  class="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                  @update:modelValue="(value) => changeRowItem('id', index, value)"
                >
                  <template #selected-option>
                    <span class="dark:text-white">{{ savedData.Tr_po_lokasi }}</span>
                  </template>
                </v-select>
              </div>
            </div>
            <div class="flex flex-col gap-3">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
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
          <div class="flex flex-col gap-2 p-6.5">
            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Keterangan
              </label>
              <textarea
                rows="1"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_po_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <DefaultCard cardTitle="List Item" class="col-span-2"
        ><div class="overflow-auto" style="height: 300px">
          <!-- Tabel -->
          <div
            class="grid gap-0 grid-cols-[35px_140px_140px_75px_100px_75px_75px_auto_75px_100px_110px]"
          >
            <!-- Header -->
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              No.
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              ID Item
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              Nama Item
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              Satuan
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              Merk
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              Disc(%)
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              Tax(%)
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              Keterangan
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              Jumlah
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              Harga
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
            >
              Harga Total
            </div>

            <!-- Rows -->
            <template v-for="(row, index) in materialData" :key="index">
              <!-- No. -->
              <div
                class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-center"
              >
                {{ index + 1 }}
              </div>
              <!-- ID Item -->
              <div class="p-0 border border-gray-300">
                <v-select
                  v-model="row.item_id"
                  :options="itemList"
                  :reduce="(item) => item.item_id"
                  label="item_id"
                  placeholder="Id Item"
                  class="custom-select w-full text-xs border-gray-300 rounded-md shadow-sm"
                  @update:modelValue="(value) => changeRowItem('id', index, value)"
                >
                  <template #selected-option>
                    <span class="dark:text-white">{{ row.item_id }}</span>
                  </template>
                </v-select>
              </div>

              <!-- Nama Item -->
              <div class="p-0 border border-gray-300">
                <v-select
                  v-model="row.item_nama"
                  :options="itemList"
                  :reduce="(item) => item.item_nama"
                  label="item_nama"
                  placeholder="Nama Item"
                  class="custom-select w-full text-xs border-gray-300 rounded-md shadow-sm"
                  @update:modelValue="(value) => changeRowItem('nama', index, value)"
                >
                  <template #selected-option>
                    <span class="dark:text-white">{{ row.item_nama }}</span>
                  </template>
                </v-select>
              </div>
              <!-- Satuan -->
              <div class="px-1 py-0 border border-gray-300">
                <input
                  disabled
                  type="text"
                  v-model="row.item_satuan"
                  class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                />
              </div>
              <!-- Merk -->
              <div class="px-1 py-0 border border-gray-300">
                <input
                  type="text"
                  v-model="row.item_merk"
                  class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                />
              </div>
              <!-- Disc -->
              <div class="px-1 py-0 border border-gray-300">
                <input
                  type="number"
                  v-model="row.item_disc"
                  @change="validateQtyDisc(index)"
                  class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                />
              </div>
              <!-- Tax -->
              <div class="px-1 py-0 border border-gray-300">
                <input
                  type="number"
                  v-model="row.item_tax"
                  @change="validateQtyTax(index)"
                  class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                />
              </div>
              <!-- Merk -->
              <div class="px-1 py-0 border border-gray-300">
                <input
                  type="text"
                  v-model="row.item_keterangan"
                  class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                />
              </div>
              <!-- Jumlah -->
              <div class="px-1 py-0 pr-0 border border-gray-300">
                <input
                  type="number"
                  v-model="row.item_jumlah"
                  @input="calculateTotal(row)"
                  class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                />
              </div>
              <!-- Harga Satuan -->
              <div class="px-1 py-0 pr-0 border border-gray-300">
                <input
                  type="number"
                  v-model="row.item_harga"
                  @input="calculateTotal(row)"
                  class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                />
              </div>
              <!-- Harga Total -->
              <div class="w-full px-2 py-0 text-xs border border-gray-300">
                <div class="h-full flex items-center justify-end">
                  {{ formatNumber(row.item_total) }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </DefaultCard>

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

<style>
.vs__search {
  padding: 0 !important;
}
.vs__open-indicator path {
  @apply fill-current dark:text-white;
}
.vs__clear path {
  @apply fill-current dark:text-white;
}
</style>
