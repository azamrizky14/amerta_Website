<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import imageWithPreview from "@/components/Forms/SelectGroup/imageWithPreview.vue";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import { item_getItemById } from "@/stores/functionAPI";
import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";
import multiselectOption from "@/components/Forms/SelectGroup/multiselectOption.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import { useIndexStore } from "@/stores";
import { useRoute } from "vue-router";

import { ref, onMounted } from "vue";
import router from "@/router";

const route = useRoute();

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

const imageUrl = "images/master_item";
const pageTitle = ref("Detail Item");
const pageList = ref(["Master", "Item", "Detail"]);

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
});

const materialData = ref([
  { satuan_awal: "", qty_awal: "", satuan_akhir: "", qty_akhir: "" },
]);

onMounted(async () => {
  const data = await item_getItemById(route.params.id);
  savedData.value = data;
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
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/3">
                <div class="flex border flex-col items-center p-2 justify-end relative">
                  <imageWithPreview
                    label="Gambar"
                    disabled
                    v-model="savedData.item_gambar"
                    :url="imageUrl"
                  />
                </div>
              </div>
              <div class="lg:w-2/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Item
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Detail Kode Item"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.item_id"
                />
                <label
                  class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
                >
                  Nama Item
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Detail Nama Item"
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
                <input
                  disabled
                  type="text"
                  placeholder="Detail Nama Item"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                  disabled
                  type="text"
                  placeholder="Detail Satuan Item"
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
                disabled
                type="text"
                placeholder="Detail Merk Item"
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
                  disabled
                  rows="3"
                  placeholder="Detail keterangan disini!"
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
        <DefaultCard cardTitle="Detail Konversi">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in savedData.item_konversi"
              v-if="savedData.item_konversi.length > 0"
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
                  disabled
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
                  disabled
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
                  disabled
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
                  disabled
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
            <div v-else>Tidak Ada Konversi Satuan!</div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <div class="flex flex-col gap-9 col-span-2">
        <!-- Input Fields Start -->
        <DefaultCard>
          <div class="pb-6 px-4 grid gap-2">
            <router-link
              to="/master/item"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
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
