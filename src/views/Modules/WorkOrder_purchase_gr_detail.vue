<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import ImagePreview from "@/components/Forms/Image/ImagePreview.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Swal from "sweetalert2";

import { gr_getDataById } from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";

import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const indexStore = useIndexStore();

const imageUrl = "images/wo_purchasing";

const pageTitle = ref("Detail Good Receipt");
const pageList = ref(["Work Order", "Purchase", "Good Receipt", "Detail"]);

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
  const newData = await gr_getDataById(route.params.id);

  savedData.value = newData;
});

// Sub Total
const subTotal = computed(() => {
  let total;
  if (savedData.value.Tr_gr_item) {
    total = savedData.value.Tr_gr_item.reduce((sum, item) => sum + item.item_jumlah, 0);
  }
  return isNaN(total) ? 0 : total;
});

// Total Diskon
const totalMasuk = computed(() => {
  let total;
  if (savedData.value.Tr_gr_item) {
    total = savedData.value.Tr_gr_item.reduce(
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

// Fungsi untuk menghitung harga total
const calculateValue = (index, qtySisa) => {
  // Validasi qtyKeluar tidak boleh kurang dari 1
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  if (
    savedData.value.Tr_gr_item[index].item_jumlah_datang !== "" &&
    (savedData.value.Tr_gr_item[index].item_jumlah_datang < 0 ||
      savedData.value.Tr_gr_item[index].item_jumlah_datang > qtySisa)
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
      savedData.value.Tr_gr_item[index].item_jumlah_datang = 0;
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
        <DefaultCard cardTitle="Input Data" class="pb-4">
          <div class="flex flex-col gap-2 p-6.5 mb-1">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Good Receipt
                </label>

                <input
                  disabled
                  type="text"
                  placeholder=""
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
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_po_id"
                />
              </div>
            </div>
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Dibuat
                </label>

                <input
                  disabled
                  type="date"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_gr_created_date"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Kedatangan
                </label>

                <input
                  disabled
                  type="date"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_gr_receipt_date"
                />
              </div>
            </div>
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Dibuat Oleh
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_gr_user_created"
                />
              </div>
              <div class="lg:w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Status GR
                </label>

                <input
                  disabled
                  type="text"
                  placeholder="Tgl Dibutuhkan"
                  :class="{
                    'text-warning': savedData.Tr_gr_status === 'partial',
                    'text-success': savedData.Tr_gr_status === 'full',
                  }"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-semibold outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_gr_status"
                />
              </div>
              <div class="lg:w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Status QA
                </label>

                <input
                  disabled
                  type="text"
                  placeholder="Tgl Dibutuhkan"
                  :class="{
                    'text-warning': savedData.Tr_gr_qa_status === 'wait',
                    'text-success': savedData.Tr_gr_qa_status === 'done',
                  }"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-semibold outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_gr_qa_status"
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
          <div class="flex flex-col gap-2 px-6.5 pt-6.5">
            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                No. Resi
              </label>
              <input
                disabled
                type="text"
                placeholder="Tgl Dibutuhkan"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_gr_no_resi"
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
              <template v-for="(row, index) in savedData.Tr_gr_item" :key="index">
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
                    v-model="row.item_jumlah"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Datang -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    type="number"
                    v-model="row.item_jumlah_datang"
                    @input="calculateValue(index, row.item_jumlah)"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
        <div class="flex justify-between w-full bg-white dark:bg-boxdark">
          <div class="w-1/3 flex items-center justify-center p-5 flex-wrap">
            <span class="font-semibold pr-3">Foto Kedatangan :</span>
            <ImagePreview
              size="w-[50px] h-[50px]"
              :url="imageUrl"
              :src="savedData.Tr_gr_image"
            />
          </div>
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
          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <router-link
              to="/modules/work-order/purchase/gr"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90 col-span-2"
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
</style>
