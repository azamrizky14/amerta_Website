<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import imageWithPreview from "@/components/Forms/SelectGroup/imageWithPreview.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import { domain } from "@/API/";
import { useRoute } from "vue-router";
import Swal from "sweetalert2";
import {
  showLoading,
  confirmDelete,
  successCreate,
  successEdit,
  failedEdit,
} from "@/stores/swal";
import {
  adminTeknis_UpdateDataImage,
  adminTeknis_GetDataById,
} from "@/stores/functionAPI";
import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";

import { ref, onMounted } from "vue";
import router from "@/router";

const route = useRoute();
const pageTitle = ref("Evident - Edit INFRA");
const pageList = ref(["Work Order", "Evident", "INFRA", "Edit"]);

// Saved Data
const savedData = ref({
  Tr_teknis_pelanggan_id: "",
  Tr_teknis_pelanggan_nama: "",
  Tr_teknis_pelanggan_server: "",
  Tr_teknis_user_updated: "",
  Tr_teknis_keterangan: "",
 
  Tr_teknis_redaman_sebelum: null,
  Tr_teknis_evident_kendala_1: null,
  Tr_teknis_evident_kendala_2: null,
  Tr_teknis_evident_kendala_3: null,
  Tr_teknis_evident_proses_sambung: null,
  Tr_teknis_redaman_sesudah: null,
  Tr_teknis_redaman_out_odp: null,
  Tr_teknis_redaman_pelanggan: null,
  Tr_teknis_evident_marking_dc_start: null,
  Tr_teknis_evident_marking_dc_end: null,

  Tr_teknis_status: "Y",
  Tr_teknis_domain: domain,
  Tr_teknis_tanggal: "",
  Tr_teknis_created: "",
  Tr_teknis_jenis: "INFRA",
  Tr_teknis_material_terpakai: [
    {label: "PS Besar", qtyKeluar: "", qtyKembali: ""},
    {label: "DC", qtyKeluar: "", qtyKembali: ""},
    {label: "ONT", snNumber: ""},
    {label: "Pigtail", qtyKeluar: "", qtyKembali: ""},
    {label: "Adaptor (12V)", qtyKeluar: "", qtyKembali: ""},
    {label: "Konektor PAZ", qtyKeluar: "", qtyKembali: ""},
    {label: "SPL 1:8", qtyKeluar: "", qtyKembali: ""},
    {label: "SPL 1:4", qtyKeluar: "", qtyKembali: ""}
  ]
})
const materialData = ref([]);

onMounted(async () => {
  await getData();
});

// Function
const handleButtonClick = async () => {
  alert("tes");
};
const handleAddMaterialTerpakai = async () => {
  await successCreate(null, null, 'top-end')
  materialData.value.push({
    label: "", qtyKeluar: "", qtyKembali: "",
  })
}
const handleRemoveMaterialTerpakai = async (index) => {
  await confirmDelete(null, null, async () => {
    materialData.value.splice(index, 1);
  });
};

const cancelDetail = async () => {
  const result = await Swal.fire({
    title: "Cancel Create?",
    text: "are you sure to cancel add data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Cancel",
    cancelButtonText: "Back",
  });

  if (result.isConfirmed) {
    await router.push("/modules/work-order/evident/infra");
  }
};

const resetData = async () => {
  const result = await Swal.fire({
    title: "Reset Data?",
    text: "are you sure to reset add data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Reset",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    await getData();
  }
};

const getData = async () => {
  let data = await adminTeknis_GetDataById(route.params.id);
  if (data.Tr_teknis_images) {
    data = { ...data, ...data.Tr_teknis_images };
    delete data.Tr_teknis_images;
  }

  savedData.value = data;
};

const submitData = async () => {
  const result = await Swal.fire({
    title: "Edit Data?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Edit!",
  });

  if (result.isConfirmed) {
    try {
      showLoading();
      //
      const fixData = { ...savedData.value };
      if (materialData.value && materialData.value.length > 0) {
        const cleanedArray = materialData.value.filter((item) => {
          return Object.values(item).some((value) => value !== "");
        });
        fixData.Tr_teknis_material_terpakai = fixData.Tr_teknis_material_terpakai.concat(
          cleanedArray
        );
      }

      fixData.Tr_teknis_material_terpakai = JSON.stringify(
        fixData.Tr_teknis_material_terpakai
      );

      const sendData = new FormData();

      Object.keys(fixData).forEach((key) => {
        sendData.append(key, fixData[key]);
      });

      //
      await adminTeknis_UpdateDataImage(sendData, route.params.id);
      await successEdit().then(() => {
        router.push("/modules/work-order/evident/infra");
      });
    } catch (error) {
      await failedEdit(error);
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
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col gap-2 p-6.5">
          <div class="flex flex-col gap-6 xl:flex-row">
            <div class="lg:w-2/3">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Id Pelanggan
              </label>
              <input
                type="text"
                placeholder="Id Pelanggan"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_pelanggan_id"
              />
            </div>
            <div class="lg:w-1/3">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Server
              </label>
              <input
                type="text"
                placeholder="Server"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_pelanggan_server"
              />
            </div>
          </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Nama Pelanggan
              </label>
              <input
                type="text"
                placeholder="Nama Pelanggan"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.Tr_teknis_pelanggan_nama"
              />
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                PIC
              </label>
              <input
                type="text"
                placeholder="Person in charge"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.Tr_teknis_user_updated"
              />
            </div>
            
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
        </DefaultCard>
        <!-- Input Fields End -->
        
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Input Material Terpakai">
          <div class="p-6.5">
            <div class="flex flex-col gap-2 xl:flex-row" 
             v-for="(data, index) in savedData.Tr_teknis_material_terpakai"
             v-if="savedData && savedData.Tr_teknis_material_terpakai.length > 0"
             :class="index === 0 ? '' : 'pt-2'"> 
              <div class="w-5/12">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white" v-if="index === 0">
                  Nama Barang
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Barang"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.label"
                />
              </div>
              <div class="w-3/12" v-if="data.qtyKeluar || data.qtyKeluar === ''">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white" v-if="index === 0">
                  Qty. Keluar
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qtyKeluar"
                />
              </div>
              <div class="w-3/12" v-if="data.qtyKembali || data.qtyKembali === '' || data.qtyKembali === 0">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white" v-if="index === 0">
                  Qty. Kembali
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qtyKembali"
                />
              </div>
              <div class="w-6/12" v-else>
                <!-- <label class="mb-3 block text-sm font-medium text-black dark:text-white" v-if="index === 0">
                  SN
                </label> -->
                <input
                  type="text"
                  placeholder="SN"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.snNumber"
                />
              </div>
              <div class="w-1/12 flex items-end pb-2 flex-wrap">
                <div class="flex w-full justify-center  mb-5 cursor-pointer font-medium text-blue-600 hover:bg-opacity-90"
                @click="handleAddMaterialTerpakai" v-if="index === 0">
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
                  disabled
                  :icon="mdiTrashCanOutline"
                  label=""
                  buttonClass="flex w-full justify-center p-2 cursor-pointer rounded bg-red-500 text-gray-50 hover:bg-red-600"
                  @click="handleButtonClick"
                />
              </div>
            </div>

            <div class="flex flex-col gap-2 pt-2 xl:flex-row" v-for="(data, index) in materialData" v-if="materialData.length > 0">
              <div class="w-8/12">
                <input
                  type="text"
                  placeholder="Nama Barang"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.label"
                />
              </div>
              <div class="w-3/12">
                <input
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qty"
                />
              </div>
              <div class="w-1/12 flex pb-2 items-end">
                <ButtonDynamic
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

      <div class="flex flex-col gap-9">
        <!-- Textarea Fields Start -->
        <DefaultCard cardTitle="Input Images">
          <div class="grid grid-cols-2" v-if="savedData">
            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Sebelum
              </p>
              <div class="flex border flex-col items-center p-2 justify-end">
                <imageWithPreview
                  label="Redaman Sebelum"
                  v-model="savedData.Tr_teknis_redaman_sebelum"
                  @update:file="(file) => (savedData.Tr_teknis_redaman_sebelum = file)"
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end">
                <imageWithPreview
                  label="Kendala 1"
                  v-model="savedData.Tr_teknis_evident_kendala_1"
                  @update:file="(file) => (savedData.Tr_teknis_evident_kendala_1 = file)"
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <div class="flex border flex-col items-center p-2 justify-end">
                <imageWithPreview
                  label="Kendala 2"
                  v-model="savedData.Tr_teknis_evident_kendala_2"
                  @update:file="(file) => (savedData.Tr_teknis_evident_kendala_2 = file)"
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end">
                <imageWithPreview
                  label="Kendala 3"
                  v-model="savedData.Tr_teknis_evident_kendala_3"
                  @update:file="(file) => (savedData.Tr_teknis_evident_kendala_3 = file)"
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-1">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Progres
              </p>
              <div class="flex border flex-col items-center p-2 justify-end">
                <imageWithPreview
                  label="Splicer - Proses Sambung"
                  v-model="savedData.Tr_teknis_evident_proses_sambung"
                  @update:file="
                    (file) => (savedData.Tr_teknis_evident_proses_sambung = file)
                  "
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-3">
              <p class="text-black dark:text-white text-center p-2 col-span-3">
                Evident Sesudah
              </p>
              <div class="flex border flex-col items-center p-2 justify-end">
                <imageWithPreview
                  label="Redaman Sesudah"
                  v-model="savedData.Tr_teknis_redaman_sesudah"
                  @update:file="(file) => (savedData.Tr_teknis_redaman_sesudah = file)"
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end">
                <imageWithPreview
                  label="Redaman Out ODP"
                  v-model="savedData.Tr_teknis_redaman_out_odp"
                  @update:file="(file) => (savedData.Tr_teknis_redaman_out_odp = file)"
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end">
                <imageWithPreview
                  label="Redaman Pelanggan"
                  v-model="savedData.Tr_teknis_redaman_pelanggan"
                  @update:file="(file) => (savedData.Tr_teknis_redaman_pelanggan = file)"
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Marking Kabel
              </p>
              <div class="flex border flex-col items-center p-2 justify-end">
                <imageWithPreview
                  label="Start"
                  v-model="savedData.Tr_teknis_evident_marking_dc_start"
                  @update:file="
                    (file) => (savedData.Tr_teknis_evident_marking_dc_start = file)
                  "
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end">
                <imageWithPreview
                  label="End"
                  v-model="savedData.Tr_teknis_evident_marking_dc_end"
                  @update:file="
                    (file) => (savedData.Tr_teknis_evident_marking_dc_end = file)
                  "
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
          <div class="pb-6 px-4 grid grid-cols-3 gap-2">
            <button
              @click="cancelDetail"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Cancel
            </button>
            <button
              @click="resetData"
              class="flex w-full justify-center rounded bg-gray-500 p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Reset
            </button>
            <button
              @click="submitData"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Update Data
            </button>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
    </div>
    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
