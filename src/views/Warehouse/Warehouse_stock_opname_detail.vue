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
  item_getAllItemWithStatus,
  stock_SoGetPrefixByDate,
  lokasi_getAllLocationWithStatus,
  stock_getDataForSO,
  stock_CreateSo,
  stock_CreateSh,
  removeMultiTempImage,
  stock_SoGetDataById,
} from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore();
import { useRoute } from "vue-router";

const route = useRoute();

const pageTitle = ref("Detail Stock Opname");
const pageList = ref(["Warehouse", "Stock Opname", "Detail"]);

// Saved Data
const savedData = ref("");

const itemList = ref([]);

const items = ref<Row[]>([]);
const itemsKabel = ref<Row[]>([]);
const itemsModem = ref<Row[]>([]);
const itemsTiang = ref<Row[]>([]);

const itemsQty = ref("");
const itemsKabelQty = ref({
  item_total: "",
  properties_qty: [],
  list_kabel: [],
});
const itemsModemQty = ref({
  item_total: "",
  properties_qty: [],
});
const itemsTiangQty = ref({
  item_total: "",
  properties_qty: [],
});

const lokasiList = ref([]);
const soList = ref([]);

// Validasi qtyKeluar tidak boleh kurang dari 1
const validateQtyKeluar = (jenis, index, qty, i) => {
  if (jenis === "items" && qty < 0) {
    Swal.fire({
      title: "Error!",
      text: "Jumlah tidak boleh kurang dari 0",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      items.value[index].item_jumlah_akhir = 0;
    });
  } else if (jenis === "kabel" && qty < 0) {
    Swal.fire({
      title: "Error!",
      text: "Jumlah tidak boleh kurang dari 0",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      itemsKabel.value[index].Sh_item_properties[i].item_properties_qty_akhir = "";
    });
  }
};

onMounted(async () => {
  const newData = await stock_SoGetDataById(route.params.id);
  savedData.value = newData;
  filterSelectedSo(newData);
  const data = await item_getAllItemWithStatus(
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode,
    "N"
  );
  itemList.value = data;

  const dataSo = await stock_getDataForSO(
    indexStore.user.companyCode,
    indexStore.user.hierarchyCode
  );
  soList.value = dataLokasi.map((item1) => {
    const item2 = dataSo.find((item) => item.lokasi_nama === item1.lokasi_nama);
    return {
      ...item1,
      lokasi_item: item2 ? item2.lokasi_item : [],
    };
  });

  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_po_created = date;

  savedData.value.Tr_po_created = date;
});

const filterSelectedSo = (value) => {
  if (value && value.So_item) {
    // Buat map item_id => item_jumlah_qa dari Tr_pp_item
    const ppItemMap = {};

    // Buat itemList
    const itemList = value.So_item.map((x) => {
      const item = {
        ...x,
        item_jumlah: ppItemMap[x.Sh_item_id] ?? x.Sh_item_qty,
        item_jumlah_akhir: ppItemMap[x.Sh_item_id] ?? x.Sh_item_qty,
        item_status: "intangible",
      };
      // Tambahkan is_deleted: false jika tipe Material atau Aset
      if (x.Sh_item_tipe === "Material" || x.Sh_item_tipe === "Aset") {
        item.is_deleted = false;
      }

      // Jika bukan Material/Aset dan ada properties, tambahkan is_deleted di setiap item_properties
      if (
        x.Sh_item_tipe !== "Material" &&
        x.Sh_item_tipe !== "Aset" &&
        Array.isArray(x.Sh_item_properties) &&
        x.Sh_item_properties.length > 0
      ) {
        item.Sh_item_properties = x.Sh_item_properties.map((prop) => ({
          ...prop,
          is_deleted: false,
        }));
        item.Sh_item_qty = item.Sh_item_properties.length
          ? item.Sh_item_properties.length
          : 0;
      }

      return item;
    });

    items.value = itemList.filter(
      (x) => x.Sh_item_tipe === "Material" || x.Sh_item_tipe === "Aset"
    );

    itemsModem.value = itemList.filter((x) => x.Sh_item_tipe === "Modem");

    itemsKabel.value = itemList.filter((x) => x.Sh_item_tipe === "Kabel");

    itemsTiang.value = itemList.filter((x) => x.Sh_item_tipe === "Tiang");

    itemsQty.value = Array.isArray(items.value) ? items.value.length : 10;

    itemsKabelQty.value.item_total = Array.isArray(itemsKabel.value)
      ? itemsKabel.value.length
      : 0;
    if (Array.isArray(itemsKabel.value)) {
      itemsKabel.value.forEach((x) => {
        itemsKabelQty.value.properties_qty.push(x.Sh_item_properties.length);
        x.Sh_item_properties.forEach((id) => {
          itemsKabelQty.value.list_kabel.push(
            x.Sh_item_id + "<>" + x.Sh_item_jenis + "<>" + id.item_properties_id
          );
        });
      });
    }
    itemsModemQty.value.item_total = Array.isArray(itemsModem.value)
      ? itemsModem.value.length
      : 0;
    if (Array.isArray(itemsModem.value)) {
      itemsModem.value.forEach((x) => {
        itemsModemQty.value.properties_qty.push(x.Sh_item_properties.length);
      });
    }
    itemsTiangQty.value.item_total = Array.isArray(itemsTiang.value)
      ? itemsTiang.value.length
      : 0;
    if (Array.isArray(itemsTiang.value)) {
      itemsTiang.value.forEach((x) => {
        itemsTiangQty.value.properties_qty.push(x.Sh_item_properties.length);
      });
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
        <DefaultCard cardTitle="Detail Data">
          <div class="flex flex-col gap-2 p-6.5 mb-1">
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="lg:w-2/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Lokasi Stock Opname
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-2 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.So_lokasi"
                />
              </div>
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Inspeksi
                </label>

                <input
                  disabled
                  type="date"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-2 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.So_tanggal"
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
                disabled
                rows="1"
                placeholder="Masukan Catatan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.So_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <!-- Item Material & Aset -->
      <div class="col-span-2">
        <DefaultCard cardTitle="List Material & Aset">
          <div>
            <!-- Tabel -->
            <div
              class="grid gap-0 grid-cols-[35px_130px_130px_70px_auto_107px_163px_163px]"
            >
              <!-- Header -->
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="col-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Kuantitas (Jumlah)
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Qty. Awal
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Qty. Akhir
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in items" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                  :class="row.is_deleted ? 'bg-danger text-white' : ''"
                >
                  {{ index + 1 }}
                </div>
                <!-- ID Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_id"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>

                <!-- Nama Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_satuan"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <select
                    disabled
                    v-model="row.item_status"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- Qty Datang -->
                <div
                  class="px-1 py-0 pr-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="number"
                    v-model="row.item_jumlah"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>
                <!-- Qty Retur -->
                <div
                  class="px-1 py-0 pr-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="number"
                    v-model="row.item_jumlah_akhir"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                    @input="validateQtyKeluar('items', index, row.item_jumlah_akhir)"
                  />
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Item Modem -->
      <div class="col-span-2">
        <DefaultCard cardTitle="List Modem">
          <div>
            <!-- Tabel -->
            <div class="grid gap-0 grid-cols-[35px_130px_130px_70px_auto_107px_326px]">
              <!-- Header -->
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Detail Modem
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsModem" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted)
                      ? 'bg-danger text-white'
                      : ''
                  "
                >
                  {{ index + 1 }}
                </div>
                <!-- ID Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_id"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>

                <!-- Nama Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_satuan"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <select
                    disabled
                    v-model="row.item_status"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- SN -->
                <div class="py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_135px_auto]">
                    <!-- Header -->
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      No.
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Serial Number
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Catatan
                    </div>
                    <template v-for="(props, i) in row.Sh_item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                        :class="props.is_deleted ? 'text-white bg-danger' : ''"
                      >
                        {{ i + 1 }}
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          disabled
                          type="text"
                          placeholder="Serial Number"
                          v-model="props.item_properties_id"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          disabled
                          type="text"
                          placeholder="Catatan"
                          v-model="props.item_properties_note"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Item Tiang -->
      <div class="col-span-2">
        <DefaultCard cardTitle="List Tiang">
          <div>
            <!-- Tabel -->
            <div class="grid gap-0 grid-cols-[35px_130px_130px_70px_auto_107px_326px]">
              <!-- Header -->
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Detail Tiang
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsTiang" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted)
                      ? 'bg-danger text-white'
                      : ''
                  "
                >
                  {{ index + 1 }}
                </div>
                <!-- ID Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_id"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>

                <!-- Nama Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_satuan"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <select
                    disabled
                    v-model="row.item_status"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- SN -->
                <div class="y-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_135px_auto]">
                    <!-- Header -->
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      No.
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Kode Tiang
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Catatan
                    </div>
                    <template v-for="(props, i) in row.Sh_item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                        :class="props.is_deleted ? 'text-white bg-danger' : ''"
                      >
                        {{ i + 1 }}
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          disabled
                          type="text"
                          placeholder="Kode Tiang"
                          v-model="props.item_properties_id"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          disabled
                          type="text"
                          placeholder="Catatan"
                          v-model="props.item_properties_note"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Item Kabel -->
      <div class="col-span-2">
        <DefaultCard cardTitle="List Kabel">
          <div>
            <!-- Tabel -->
            <div class="grid gap-0 grid-cols-[35px_130px_130px_70px_auto_107px_326px]">
              <!-- Header -->
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Detail Kabel
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsKabel" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted)
                      ? 'bg-danger text-white'
                      : ''
                  "
                >
                  {{ index + 1 }}
                </div>
                <!-- ID Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_id"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>

                <!-- Nama Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_satuan"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <select
                    disabled
                    v-model="row.item_status"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- SN -->
                <div class="py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_auto_75px_75px]">
                    <!-- Header -->
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      No.
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Kode Kabel
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Awal
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Akhir
                    </div>
                    <template v-for="(props, i) in row.Sh_item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                        :class="props.is_deleted ? 'text-white bg-danger' : ''"
                      >
                        {{ i + 1 }}
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          disabled
                          type="text"
                          placeholder="Kode Kabel"
                          v-model="props.item_properties_id"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          disabled
                          type="number"
                          placeholder="0"
                          v-model="props.item_properties_qty"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          disabled
                          type="number"
                          placeholder="0"
                          v-model="props.item_properties_qty_akhir"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                          @input="
                            validateQtyKeluar(
                              'kabel',
                              index,
                              props.item_properties_qty_akhir,
                              i
                            )
                          "
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <div class="flex flex-col gap-9 col-span-2">
        <!-- Input Fields Start -->
        <DefaultCard>
          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <router-link
              to="/modules/warehouse/stock-opname"
              class="col-span-2 flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Kembali
            </router-link>
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
.v-select .vs__dropdown-menu {
  z-index: 50 !important; /* Atur sesuai kebutuhan */
  position: absolute !important;
}
</style>
