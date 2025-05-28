<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import imageWithPreviewInfra from "@/components/Forms/SelectGroup/imageWithPreviewInfra.vue";
import Swal from "sweetalert2";
import multiselectReadOnly from "@/components/Forms/SelectGroup/multiselectReadOnly.vue";

import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import {
  adminTeknis_CreateDataEvidentWithImages,
  adminTeknis_GetDataEvidentById,
} from "@/stores/functionAPI";

import { ref, onMounted } from "vue";
import router from "@/router";
import { useRoute } from "vue-router";

const route = useRoute();

const imageUrl = "images/admin_logistik";
const pageTitle = ref("Evident - Detail INFRA");
const pageList = ref(["Work Order", "Evident", "INFRA", "Detail"]);

// Saved Data
const savedData = ref({
  Tr_teknis_pelanggan_id: "",
  Tr_teknis_pelanggan_nama: "",
  Tr_teknis_pelanggan_server: "",
  Tr_teknis_user_updated: "",
  Tr_teknis_keterangan: "",
  Tr_teknis_logistik_id: "",
  Tr_teknis_jenis: "INFRA",
  Tr_teknis_trouble: "",
  Tr_teknis_action: "",
  Tr_teknis_team: [],

  // INFRA
  Tr_teknis_evident_start: [],
  Tr_teknis_evident_progress: [],
  Tr_teknis_evident_end: [],

  Tr_teknis_tanggal: "",
  Tr_teknis_created: "",
  Tr_teknis_work_order_terpakai_material: [],
});

const materialData = ref([]);
const evidentStart = ref(true);
const evidentProgress = ref(true);
const evidentEnd = ref(true);

const shouldShowTypeLabel = (index) => {
  const tipe = materialData.value[index].Sh_item_tipe?.toLowerCase();
  if (tipe === "aset" || tipe === "material") return false;

  if (index === 0) return true;
  const currentType = materialData.value[index].Sh_item_tipe;
  const previousType = materialData.value[index - 1].Sh_item_tipe;
  return currentType !== previousType;
};

onMounted(async () => {
  const data = await adminTeknis_GetDataEvidentById(
    route.params.logistikType +
      "/" +
      route.params.logistikDate +
      "/" +
      route.params.logistikNumber,
    route.params.id
  );
  if (data.Tr_teknis_team) {
    data.Tr_teknis_team = data.Tr_teknis_team.map((x, i) => ({ id: i, name: x }));
  }
  savedData.value = data;
  Object.assign(savedData.value, data);
  materialData.value = savedData.value.Tr_teknis_work_order_terpakai_material;
  ontData.value = savedData.value.Tr_teknis_work_order_retur;
});
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
        <DefaultCard cardTitle="Detail Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="w-2/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Bon Material
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_logistik_id"
                />
              </div>
              <div class="w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kategori
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_kategori"
                />
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Teknisi
              </label>
              <div>
                <multiselectReadOnly
                  disabled
                  :options="savedData.Tr_teknis_team"
                  placeholder="Pilih Teknisi..."
                />
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Nama Project (Wajib Diisi)
              </label>
              <input
                disabled
                type="text"
                placeholder="Nama Project"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.Tr_teknis_pelanggan_nama"
              />
            </div>

            <div class="flex flex-col gap-6">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Titik Koordinat (Wajib Diisi)
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Titik Koordinat"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_pelanggan_server"
                />
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Keterangan
              </label>
              <textarea
                disabled
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->

        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Detail Material Terpakai">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in materialData"
              :key="index"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <!-- Nama Barang -->
              <div class="w-6/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  {{ shouldShowTypeLabel(index) ? data.Sh_item_tipe : "Nama Barang" }}
                </label>
                <template
                  v-if="data.Sh_item_tipe === 'Kabel'"
                  v-for="(prop, i) in data.Sh_item_properties"
                >
                  <input
                    disabled
                    type="text"
                    placeholder="Nama Barang"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :class="i > 0 ? 'mt-2' : ''"
                    :value="
                      data.Sh_item_nama +
                      ' - ' +
                      data.Sh_item_jenis +
                      ' (' +
                      prop.item_properties_id +
                      ')'
                    "
                  />
                </template>
                <template v-else>
                  <input
                    disabled
                    type="text"
                    placeholder="Nama Barang"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :value="data.Sh_item_nama + ' - ' + data.Sh_item_jenis"
                  />
                </template>
              </div>
              <!-- Tersisa -->
              <div
                class="w-3/12"
                v-if="data.Sh_item_tipe !== 'Modem' && data.Sh_item_tipe !== 'Tiang'"
              >
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  Tersedia
                </label>

                <template
                  v-if="data.Sh_item_tipe === 'Kabel'"
                  v-for="(prop, i) in data.Sh_item_properties"
                >
                  <input
                    disabled
                    type="text"
                    placeholder="Nama Barang"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :class="i > 0 ? 'mt-2' : ''"
                    :value="prop?.item_properties_qty_sisa + prop?.item_properties_qty"
                  />
                </template>
                <template v-else>
                  <input
                    disabled
                    type="number"
                    placeholder="Qty"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :value="data.Sh_item_qty + data.Sh_item_qty_sisa"
                  />
                </template>
              </div>

              <!-- Dipakai -->
              <div
                class="w-3/12"
                v-if="data.Sh_item_tipe !== 'Modem' && data.Sh_item_tipe !== 'Tiang'"
              >
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  Terpakai
                </label>
                <template
                  v-if="data.Sh_item_tipe === 'Kabel'"
                  v-for="(prop, i) in data.Sh_item_properties"
                >
                  <input
                    disabled
                    type="number"
                    placeholder="Qty"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :class="i > 0 ? 'mt-2' : ''"
                    v-model="prop.item_properties_qty"
                  />
                </template>
                <template v-else>
                  <input
                    disabled
                    type="number"
                    placeholder="Qty"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    v-model="data.Sh_item_qty"
                  />
                </template>
              </div>

              <!-- SN -->
              <div
                class="w-6/12"
                v-if="data.Sh_item_tipe === 'Modem' || data.Sh_item_tipe === 'Tiang'"
              >
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  Kode Barang
                </label>
                <template v-if="data.Sh_item_tipe === 'Modem'">
                  <v-select
                    disabled
                    v-model="data.Sh_item_properties"
                    :clearable="false"
                    :options="[]"
                    label="item_properties_id"
                    placeholder="Detail Modem"
                    class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                  >
                  </v-select>
                </template>
                <template v-if="data.Sh_item_tipe === 'Tiang'">
                  <v-select
                    disabled
                    v-model="data.Sh_item_properties"
                    :options="[]"
                    multiple
                    label="item_properties_id"
                    placeholder="List Tiang"
                    class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                  >
                  </v-select>
                </template>
              </div>
            </div>
          </div>
        </DefaultCard>

        <DefaultCard cardTitle="Input Material Kembali">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in ontData"
              :key="index"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <!-- Nama Barang -->
              <div class="w-3/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  {{ shouldShowTypeLabel(index) ? data.Sh_item_tipe : "Nama" }}
                </label>
                <template v-for="(prop, i) in data.Sh_item_properties">
                  <input
                    disabled
                    type="text"
                    placeholder="Nama Barang"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :class="i > 0 ? 'mt-2' : ''"
                    :value="data.Sh_item_nama"
                  />
                </template>
              </div>
              <!-- Nama Barang -->
              <div class="w-5/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  {{ shouldShowTypeLabel(index) ? data.Sh_item_tipe : "Tipe Barang" }}
                </label>
                <template v-for="(prop, i) in data.Sh_item_properties">
                  <input
                    disabled
                    type="text"
                    placeholder="Tipe Barang"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :class="i > 0 ? 'mt-2' : ''"
                    v-model="data.Sh_item_jenis"
                  />
                </template>
              </div>
              <!-- Nama Barang -->
              <div class="w-4/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  {{ shouldShowTypeLabel(index) ? data.Sh_item_tipe : "Kode SN" }}
                </label>
                <template v-for="(prop, i) in data.Sh_item_properties">
                  <input
                    disabled
                    type="text"
                    placeholder="Kode SN"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :class="i > 0 ? 'mt-2' : ''"
                    v-model="prop.item_properties_id"
                  />
                </template>
              </div>
              <!-- Tersisa -->
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <div class="flex flex-col gap-9">
        <!-- Textarea Fields Start -->
        <DefaultCard cardTitle="Detail Gambar">
          <div class="grid grid-cols-1">
            <!-- Redaman Sebelum -->
            <div class="col-span-3">
              <p
                class="text-black dark:text-white text-center p-2 px-6.5 col-span-2 flex justify-between align-middle cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                @click="evidentStart = !evidentStart"
              >
                <span>Evident Start</span>
                <span>
                  <svg
                    class="fill-current mr-1"
                    width="25"
                    height="25"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path :d="evidentStart ? mdiChevronDown : mdiChevronUp" /></svg
                ></span>
              </p>
              <div
                class="flex border flex-col items-center justify-end relative w-full overflow-hidden transition-all duration-150 ease-in-out"
                :class="{
                  'max-h-0 opacity-0 p-0': !evidentStart,
                  'opacity-100 p-2': evidentStart,
                }"
              >
                <imageWithPreviewInfra
                  disabled
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="savedData.Tr_teknis_work_order_images.Tr_teknis_evident_start"
                />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1">
            <!-- Redaman Sebelum -->
            <div class="col-span-3">
              <p
                class="text-black dark:text-white text-center p-2 px-6.5 col-span-2 flex justify-between align-middle cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                @click="evidentProgress = !evidentProgress"
              >
                <span>Evident Progress</span>
                <span>
                  <svg
                    class="fill-current mr-1"
                    width="25"
                    height="25"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path :d="evidentProgress ? mdiChevronDown : mdiChevronUp" /></svg
                ></span>
              </p>
              <div
                class="flex border flex-col items-center justify-end relative w-full overflow-hidden transition-all duration-150 ease-in-out"
                :class="{
                  'max-h-0 opacity-0 p-0': !evidentProgress,
                  'opacity-100 p-2': evidentProgress,
                }"
              >
                <imageWithPreviewInfra
                  disabled
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_progress
                  "
                />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1">
            <!-- Redaman Sebelum -->
            <div class="col-span-3">
              <p
                class="text-black dark:text-white text-center p-2 px-6.5 col-span-2 flex justify-between align-middle cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                @click="evidentEnd = !evidentEnd"
              >
                <span>Evident End</span>
                <span>
                  <svg
                    class="fill-current mr-1"
                    width="25"
                    height="25"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path :d="evidentEnd ? mdiChevronDown : mdiChevronUp" /></svg
                ></span>
              </p>
              <div
                class="flex border flex-col items-center justify-end relative w-full overflow-hidden transition-all duration-150 ease-in-out"
                :class="{
                  'max-h-0 opacity-0 p-0': !evidentEnd,
                  'opacity-100 p-2': evidentEnd,
                }"
              >
                <imageWithPreviewInfra
                  disabled
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="savedData.Tr_teknis_work_order_images.Tr_teknis_evident_end"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Textarea Fields End -->
      </div>

      <div class="flex flex-col gap-9 col-span-2">
        <!-- Input Fields Start -->
        <DefaultCard>
          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <router-link
              to="/modules/work-order/evident/infra"
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
