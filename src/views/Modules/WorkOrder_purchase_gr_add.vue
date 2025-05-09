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
  gr_GetPrefixByDate,
  po_updateDataByPO,
  gr_CreateGR,
  gr_CreateGRWithImage,
  item_getAllItemWithStatus,
  po_GetTrPoListForGr,
} from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";

import { ref, onMounted, computed } from "vue";
import router from "@/router";
import { format } from "path";

const indexStore = useIndexStore();

interface Option {
  id: number;
  name: string;
}

const pageTitle = ref("Tambah Good Receipt");
const pageList = ref(["Work Order", "Purchase", "Good Receipt", "Tambah"]);

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
  companyName: indexStore.user.companyName,
  companyCode: indexStore.company.companyCode,
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
  const dataLokasi = await po_GetTrPoListForGr(
    indexStore.user.companyCode,
    indexStore.user.hierarchyCode,
    "N",
    "process"
  );
  lokasiList.value = dataLokasi;

  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_po_created = date;

  savedData.value.Tr_po_created = date;
});

// Sub Total
const subTotal = computed(() => {
  let total;
  if (savedData.value.Tr_pp_item) {
    total = savedData.value.Tr_pp_item.reduce(
      (sum, item) => sum + item.item_jumlah_gr,
      0
    );
  }
  return isNaN(total) ? 0 : total;
});

// Total Diskon
const totalMasuk = computed(() => {
  let total;
  if (savedData.value.Tr_pp_item) {
    total = savedData.value.Tr_pp_item.reduce(
      (sum, item) => sum + item.item_jumlah_datang,
      0
    );
  }
  return isNaN(total) ? 0 : total;
});

const formatNumber = (value) => {
  const data = Number(value).toLocaleString("id-ID"); // Gunakan "id-ID" untuk format Indonesia
  return data;
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    savedData.value.Tr_gr_image = file;
  }
  // console.log(savedData.value);
};

const filterSelectedPO = (value) => {
  console.log(value);
  if (value.Tr_pp_item) {
    materialData.value = [...value.Tr_pp_item];
    savedData.value.Tr_pp_item = value.Tr_pp_item.filter(
      (x) => x.item_jumlah_gr > 0
    ).map((x) => ({ ...x, item_jumlah_datang: 0 }));
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
    await router.push("/modules/work-order/purchase/gr");
  }
};

// Array validator untuk field wajib
const dataValidator = ref([
  { key: "Tr_po_id", label: "Id PO" },
  { key: "Tr_gr_receipt_date", label: "Tgl. Kedatangan" },
  { key: "Tr_gr_image", label: "Foto Kedatangan" },
  // { key: "Tr_po_item", label: "List Item" },
]);

const dataError = ref([]); // Array untuk menyimpan error

const submitData = async () => {
  // console.log(savedData.value);
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
      const GRprefix = await gr_GetPrefixByDate(fixData.Tr_po_created);
      // const checkStatusGR = fixData.Tr_pp_item.every(item => item.item_jumlah === item.item_jumlah_datang);
      const grData = {
        Tr_po_id: fixData.Tr_po_id,
        Tr_gr_id: GRprefix.nextId,
        Tr_gr_created_date: await getDateToday("yyyy-MM-dd"),
        Tr_gr_receipt_date: fixData.Tr_gr_receipt_date,
        Tr_gr_no_resi:
          Object.keys(fixData.Tr_po_shipment).length > 0
            ? fixData.Tr_po_shipment.Tr_po_shipment_number
            : "",
        Tr_gr_status: fixData.Tr_pp_item.every(
          (item) => item.item_jumlah === item.item_jumlah_datang
        )
          ? "full"
          : "partial",
        Tr_gr_deleted: "N",
        Tr_gr_item: fixData.Tr_pp_item.map((x) => ({
          item_id: x.item_id,
          item_nama: x.item_nama,
          item_jenis: x.item_jenis,
          item_tipe: x.item_tipe,
          item_satuan: x.item_satuan,
          item_keterangan: x.item_keterangan,
          item_jumlah: x.item_jumlah_gr,
          item_jumlah_datang: x.item_jumlah_datang,
        })),
        companyName: indexStore.user.companyName,
        companyCode: indexStore.user.companyCode,
        Tr_gr_user_created: indexStore.user.userName,
        Tr_gr_keterangan: fixData.Tr_po_keterangan,
        Tr_gr_qa_status: "wait",
        Tr_gr_image: fixData.Tr_gr_image,
      };

      const updatedItems = materialData.value
        .map((item) => {
          const found = fixData.Tr_pp_item.find((i) => i.item_id === item.item_id);
          return found ? { ...item, ...found } : item;
        })
        .map((x) => {
          const item_jumlah_gr = Number(x.item_jumlah_gr) - Number(x.item_jumlah_datang);

          // Destructuring untuk menghapus item_jumlah_datang
          const { item_jumlah_datang, ...rest } = x;

          return {
            ...rest,
            item_jumlah_gr,
          };
        });

      console.log("data gr", grData);
      // console.log("data pp", updatedItems);

      const sendData = new FormData();

      Object.keys(grData).forEach((key) => {
        if (key === "Tr_gr_item" || key === "companyCode") {
          sendData.append(key, JSON.stringify(grData[key]));
        } else {
          sendData.append(key, grData[key]);
        }
      });

      // const response = await gr_CreateGR(grData);
      await gr_CreateGRWithImage(sendData);
      await po_updateDataByPO(savedData.value.Tr_po_id, { Tr_pp_item: updatedItems });
      await successCreate().then(() => {
        router.push("/modules/work-order/purchase/gr");
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
  item_jenis: string;
  item_jumlah: number;
  item_harga: number;
  item_total: number;
}

// Fungsi untuk menghitung harga total
const calculateValue = (index, qtySisa) => {
  // Validasi qtyKeluar tidak boleh kurang dari 1
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  if (
    savedData.value.Tr_pp_item[index].item_jumlah_datang !== "" &&
    (savedData.value.Tr_pp_item[index].item_jumlah_datang < 0 ||
      savedData.value.Tr_pp_item[index].item_jumlah_datang > qtySisa)
  ) {
    Swal.fire({
      title: "Error!",
      text: "Jumlah input harus antara 0 - " + qtySisa,
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      savedData.value.Tr_pp_item[index].item_jumlah_datang = 0;
    });
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
        <DefaultCard cardTitle="Input Data" class="pb-3">
          <div class="flex flex-col gap-2 p-6.5 mb-1">
            <div class="flex flex-col gap-3">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Purchase Order
                </label>

                <v-select
                  v-model="savedData"
                  :options="lokasiList"
                  :clearable="false"
                  label="Tr_po_id"
                  placeholder="Masukan Tujuan PO"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                  @update:modelValue="(value) => filterSelectedPO(value)"
                >
                  <template #selected-option>
                    <span class="dark:text-white">{{ savedData.Tr_po_id }}</span>
                  </template>
                </v-select>
              </div>
            </div>
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Kedatangan
                </label>

                <input
                  type="date"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_gr_receipt_date"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Foto Kedatangan
                </label>

                <input
                  type="file"
                  placeholder="Tgl Dibutuhkan"
                  accept="image/*"
                  class="w-full text-xs py-2 rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  @change="handleFileUpload"
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
                Catatan
              </label>
              <textarea
                rows="5"
                placeholder="Masukan Catatan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_gr_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <div class="col-span-2">
        <DefaultCard cardTitle="List Item"
          ><div class="overflow-auto">
            <!-- Tabel -->
            <div
              class="grid gap-0 grid-cols-[35px_140px_140px_75px_100px_auto_110px_110px]"
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
                Jenis
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                Keterangan
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                Qty. Tersedia
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                *Qty. Datang
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in savedData.Tr_pp_item" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-center"
                >
                  {{ index + 1 }}
                </div>
                <!-- Id Item -->
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    disabled
                    type="text"
                    v-model="row.item_id"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>

                <!-- Nama -->
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    disabled
                    type="text"
                    v-model="row.item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
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
                <!-- Jenis -->
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    disabled
                    type="text"
                    v-model="row.item_jenis"
                    class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    disabled
                    type="text"
                    v-model="row.item_keterangan"
                    class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Sisa -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    disabled
                    type="number"
                    v-model="row.item_jumlah_gr"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Datang -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    type="number"
                    v-model="row.item_jumlah_datang"
                    @input="calculateValue(index, row.item_jumlah_gr)"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
        <div class="flex justify-end w-full bg-white dark:bg-boxdark">
          <div class="grid gap-0 grid-cols-[110px_111px]">
            <!-- Rows -->
            <!-- Sub Total -->
            <div class="px-3 py-1 border border-gray-300 font-bold bg-white text-sm">
              Qty. Total
            </div>
            <div class="w-full px-2 py-0 text-xs border border-gray-300 bg-white text-sm">
              <div class="h-full flex items-center justify-end font-semibold">
                {{ formatNumber(subTotal) }}
              </div>
            </div>
            <!-- Discount -->
            <div class="px-3 py-1 border border-gray-300 font-bold bg-white text-sm">
              Qty. Datang
            </div>
            <div class="w-full px-2 py-0 text-xs border border-gray-300 bg-white text-sm">
              <div class="h-full flex items-center justify-end font-semibold">
                {{ formatNumber(totalMasuk) }}
              </div>
            </div>
            <!-- Tax -->
            <div class="px-3 py-1 border border-gray-300 font-bold bg-white text-sm">
              Qty. Belum
            </div>
            <div class="w-full px-2 py-0 text-xs border border-gray-300 bg-white text-sm">
              <div class="h-full flex items-center justify-end font-semibold">
                {{ formatNumber(subTotal - totalMasuk) }}
              </div>
            </div>
          </div>
        </div>
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
.custom-v-select .vs__dropdown-toggle {
  padding: 0.3rem 1rem 0.45rem 1rem;
  @apply border border-gray-400 dark:border-white;
}
</style>
