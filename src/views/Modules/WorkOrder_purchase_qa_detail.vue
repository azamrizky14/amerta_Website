<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ImagePreview from "@/components/Forms/Image/ImagePreview.vue";
import Swal from "sweetalert2";

import { qa_getDataById } from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { mdiCamera } from "@mdi/js";

const route = useRoute();

const indexStore = useIndexStore();

const imageUrl = "images/wo_purchasing";
const pageTitle = ref("Detail Quality Assurance");
const pageList = ref(["Work Order", "Purchase", "Quality Assurance", "Detail"]);

const items = ref<Row[]>([]);
const itemsKabel = ref<Row[]>([]);
const itemsModem = ref<Row[]>([]);
const itemsTiang = ref<Row[]>([]);

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

onMounted(async () => {
  const newData = await qa_getDataById(route.params.id);

  if (newData && newData.Tr_qa_item) {
    items.value = newData.Tr_qa_item.filter(
      (x) => x.item_tipe === "Material" || x.item_tipe === "Aset"
    );

    itemsKabel.value = newData.Tr_qa_item.filter((x) => x.item_tipe === "Kabel");
    itemsModem.value = newData.Tr_qa_item.filter((x) => x.item_tipe === "Modem");
    itemsTiang.value = newData.Tr_qa_item.filter((x) => x.item_tipe === "Tiang");
  }
  savedData.value = newData;
});

const qtySisa = (value) => {
  if (value) {
    return (
      value.item_jumlah -
      (value.item_jumlah_lolos + value.item_jumlah_rusak + value.item_jumlah_retur)
    );
  }
};

interface Row {
  item_id: string;
  item_nama: string;
  item_satuan: string;
  item_jenis: string;
  item_jumlah: number;
  item_harga: number;
  item_total: number;
}
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <!-- ====== Form Elements Section Start -->

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Detail Fields Start -->
        <DefaultCard cardTitle="Detail Data" class="pb-4">
          <div class="flex flex-col gap-2 p-6.5 mb-1">
            <div class="flex flex-col gap-3">
              <div class="">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Quality Assurance
                </label>

                <input
                  disabled
                  type="text"
                  placeholder=""
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_qa_id"
                />
              </div>
            </div>
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Good Receipt
                </label>

                <input
                  disabled
                  type="text"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_gr_id"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Purchase Order
                </label>

                <input
                  disabled
                  type="text"
                  placeholder=""
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_po_id"
                />
              </div>
            </div>
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Inspeksi
                </label>

                <input
                  disabled
                  type="date"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_qa_inspection_date"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Inspektor
                </label>

                <input
                  disabled
                  type="text"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_qa_user_inspection"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Detail Fields End -->
      </div>
      <div class="flex flex-col gap-9">
        <!-- Detail Fields Start -->
        <DefaultCard cardTitle="Data Tambahan">
          <div class="flex flex-col gap-2 px-6.5 pt-6.5">
            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Gudang Penerima
              </label>
              <input
                disabled
                type="text"
                placeholder="Tgl Dibutuhkan"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_qa_lokasi"
              />
            </div>
          </div>
          <div class="flex flex-col p-6.5 pt-2">
            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Catatan
              </label>
              <textarea
                disabled
                rows="5"
                placeholder="Masukan Catatan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_qa_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Detail Fields End -->
      </div>

      <!-- Item Material & Aset -->
      <div class="col-span-2" v-if="items.length > 0">
        <DefaultCard cardTitle="List Material & Aset">
          <div class="overflow-auto" style="max-height: 600px">
            <!-- Tabel -->
            <div
              class="grid gap-0 grid-cols-[35px_80px_100px_70px_auto_107px_80px_80px_80px_80px_80px_30px]"
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
                Status
              </div>
              <div
                class="col-span-5 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Kuantitas (Jumlah)
              </div>
              <div
                class="p-1 row-span-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                <svg
                  class="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path :d="mdiCamera" />
                </svg>
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Tersedia
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Sisa
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Lolos
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Rusak
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Retur
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in items" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                >
                  {{ index + 1 }}
                </div>
                <!-- Id Item -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_id"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>

                <!-- Nama -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_satuan"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_jenis"
                    class="w-full px-2 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="font-semibold px-1 py-0 border text-gray-800 border-gray-300 flex justify-center items-start py-1 text-xs text-center dark:text-white"
                >
                  {{ row.item_status }}
                </div>
                <!-- Qty Datang -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    disabled
                    type="number"
                    v-model="row.item_jumlah"
                    class="font-semibold w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Sisa -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    disabled
                    type="number"
                    :value="qtySisa(row)"
                    class="font-semibold w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Lolos -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    type="number"
                    v-model="row.item_jumlah_lolos"
                    @input="calculateSisa(index, row, 'item_jumlah_lolos')"
                    class="font-semibold w-full px-2 py-0 text-xs text-success bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Rusak -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    type="number"
                    v-model="row.item_jumlah_rusak"
                    @input="calculateSisa(index, row, 'item_jumlah_rusak')"
                    class="font-semibold w-full px-2 py-0 text-xs text-warning bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Retur -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    type="number"
                    v-model="row.item_jumlah_retur"
                    @input="calculateSisa(index, row, 'item_jumlah_retur')"
                    class="font-semibold w-full px-2 py-0 text-xs text-danger bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <div
                  class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                >
                  <ImagePreview
                    size="w-[30px] h-[25px]"
                    :url="imageUrl"
                    :src="row.item_image"
                  />
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Item Modem -->
      <div class="col-span-2" v-if="itemsModem.length > 0">
        <DefaultCard cardTitle="List Modem">
          <div class="overflow-auto" style="max-height: 600px">
            <!-- Tabel -->
            <div class="grid gap-0 grid-cols-[35px_80px_100px_70px_auto_107px_425px]">
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
                Serial Number (SN)
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsModem" :key="index">
                <!-- No. -->
                <div
                  class="px-1 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                >
                  {{ index + 1 }}
                </div>
                <!-- Id Item -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_id"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Nama -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_satuan"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="font-semibold px-1 py-0 border text-gray-800 border-gray-300 flex justify-center items-start py-1 text-xs text-center dark:text-white"
                >
                  {{ row.item_status }}
                </div>
                <!-- SN -->
                <div class="py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_79px_135px_auto_30px]">
                    <template v-for="(props, i) in row.item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                      >
                        {{ i + 1 }}
                      </div>
                      <!-- Jenis -->
                      <div class="px-0.5 py-0.5 border border-gray-300 flex items-start">
                        <input
                          disabled
                          type="text"
                          v-model="props.item_properties_status"
                          class="font-semibold w-full px-1 py-0.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                          :class="{
                            'text-warning': props.item_properties_status === 'retur',
                            'text-danger': props.item_properties_status === 'rusak',
                            'text-success': props.item_properties_status === 'lolos',
                          }"
                        />
                      </div>
                      <div class="px-1 py-0 border border-gray-300 text-sm">
                        <input
                          disabled
                          type="text"
                          placeholder="Serial Number (SN)"
                          v-model="props.item_properties_id"
                          class="font-semibold w-full px-1 py-0.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div class="px-1 py-0 border border-gray-300 text-sm">
                        <input
                          disabled
                          type="text"
                          placeholder="Catatan"
                          v-model="props.item_properties_note"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div
                        class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                      >
                        <ImagePreview
                          size="w-[30px] h-[25px]"
                          :url="imageUrl"
                          :src="props.item_properties_image"
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
      <div class="col-span-2" v-if="itemsKabel.length > 0">
        <DefaultCard cardTitle="List Kabel">
          <div class="overflow-auto" style="max-height: 600px">
            <!-- Tabel -->
            <div class="grid gap-0 grid-cols-[35px_80px_100px_70px_auto_107px_425px]">
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
                Kode Kabel
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsKabel" :key="index">
                <!-- No. -->
                <div
                  class="px-1 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                >
                  {{ index + 1 }}
                </div>
                <!-- Id Item -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_id"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Nama -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_satuan"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="font-semibold px-1 py-0 border text-gray-800 border-gray-300 flex justify-center items-start py-1 text-xs text-center dark:text-white"
                >
                  {{ row.item_status }}
                </div>
                <!-- SN -->
                <div class="py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_79px_100px_65px_auto_30px]">
                    <template v-for="(props, i) in row.item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                      >
                        {{ i + 1 }}
                      </div>
                      <!-- Jenis -->
                      <div class="px-0.5 py-0.5 border border-gray-300 flex items-start">
                        <input
                          disabled
                          type="text"
                          v-model="props.item_properties_status"
                          class="font-semibold w-full px-1 py-0.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                          :class="{
                            'text-warning': props.item_properties_status === 'retur',
                            'text-danger': props.item_properties_status === 'rusak',
                            'text-success': props.item_properties_status === 'lolos',
                          }"
                        />
                      </div>
                      <div class="px-1 py-0 border border-gray-300 text-sm">
                        <input
                          disabled
                          type="text"
                          placeholder="Kode Kabel"
                          v-model="props.item_properties_id"
                          class="font-semibold w-full px-1 py-0.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div class="px-0.5 py-0 border border-gray-300 text-sm">
                        <input
                          disabled
                          type="text"
                          v-model="props.item_properties_qty"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div class="px-1 py-0 border border-gray-300 text-sm">
                        <input
                          disabled
                          type="text"
                          placeholder="Catatan"
                          v-model="props.item_properties_note"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div
                        class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                      >
                        <ImagePreview
                          size="w-[30px] h-[25px]"
                          :url="imageUrl"
                          :src="props.item_properties_image"
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
      <div class="col-span-2" v-if="itemsTiang.length > 0">
        <DefaultCard cardTitle="List Tiang">
          <div class="overflow-auto" style="max-height: 600px">
            <!-- Tabel -->
            <div class="grid gap-0 grid-cols-[35px_80px_100px_70px_auto_107px_425px]">
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
                Kode Tiang
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsTiang" :key="index">
                <!-- No. -->
                <div
                  class="px-1 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                >
                  {{ index + 1 }}
                </div>
                <!-- Id Item -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_id"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Nama -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_satuan"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="font-semibold px-1 py-0 border text-gray-800 border-gray-300 flex justify-center items-start py-1 text-xs text-center dark:text-white"
                >
                  {{ row.item_status }}
                </div>
                <!-- SN -->
                <div class="py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_79px_135px_auto_30px]">
                    <template v-for="(props, i) in row.item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                      >
                        {{ i + 1 }}
                      </div>
                      <!-- Jenis -->
                      <div class="px-0.5 py-0.5 border border-gray-300 flex items-start">
                        <input
                          disabled
                          type="text"
                          v-model="props.item_properties_status"
                          class="font-semibold w-full px-1 py-0.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                          :class="{
                            'text-warning': props.item_properties_status === 'retur',
                            'text-danger': props.item_properties_status === 'rusak',
                            'text-success': props.item_properties_status === 'lolos',
                          }"
                        />
                      </div>
                      <div class="px-1 py-0 border border-gray-300 text-sm">
                        <input
                          disabled
                          type="text"
                          placeholder="Kode Tiang"
                          v-model="props.item_properties_id"
                          class="font-semibold w-full px-1 py-0.5 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div class="px-1 py-0 border border-gray-300 text-sm">
                        <input
                          disabled
                          type="text"
                          placeholder="Catatan"
                          v-model="props.item_properties_note"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div
                        class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                      >
                        <ImagePreview
                          size="w-[30px] h-[25px]"
                          :url="imageUrl"
                          :src="props.item_properties_image"
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
        <!-- Detail Fields Start -->
        <DefaultCard>
          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <router-link
              to="/modules/work-order/purchase/qa"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90 col-span-2"
            >
              Kembali
            </router-link>
          </div>
        </DefaultCard>
        <!-- Detail Fields End -->
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
