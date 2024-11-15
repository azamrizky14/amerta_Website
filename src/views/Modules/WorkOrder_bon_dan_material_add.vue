<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import Swal from "sweetalert2";

import { domain } from "@/API/";
import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import { adminTeknis_CreateData, BonMaterial_GetPrefixByTypeAndDate } from "@/stores/functionAPI";
import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";
import multiselectOption from "@/components/Forms/SelectGroup/multiselectOption.vue";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore()

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

const pageTitle = ref("Add Bon & Material");
const pageList = ref(["Work Order", "Evident", "PSB", "Add"]);

// Saved Data
const savedData = ref({
  Tr_teknis_item: "", // wajib
  Tr_teknis_team: [],
  Tr_teknis_keterangan: "",

  Tr_teknis_logistik_id: "",
  Tr_teknis_user_created: "", // otomatis
  Tr_teknis_user_closed: "",
  Tr_teknis_tanggal: "",
  Tr_teknis_created: "",
  Tr_teknis_closed: "",

  Tr_teknis_status: "open", // otomatis
  Tr_teknis_jenis: "PSB", // otomatis
  Tr_teknis_deleted: "N", // otomatis
  Tr_teknis_domain: "AMERTA-PASURUAN", // otomatis   

  // Array WO Terpakai
  Tr_teknis_work_order_terpakai: [],

  // Array WO Tersedia
  Tr_teknis_work_order_tersedia: [],

  // Array WO Kembali
  Tr_teknis_work_order_kembali: [],
});

const materialData = ref([
    { label: "", qtyKeluar: "", qtyKembali: "" }
  ]);

onMounted(async () => {
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.Tr_teknis_tanggal = date;
  savedData.value.Tr_teknis_created = date;
  savedData.value.Tr_teknis_user_created = indexStore.user.userName

  console.log(savedData.value)
});

// Function
const handleAddMaterialTerpakai = async () => {
  await successCreate(null, null, "top-end");
  materialData.value.push({label: "", qtyKeluar: "", qtyKembali: ""});
};
const handleRemoveMaterialTerpakai = async (index) => {
  await confirmDelete(null, null, async () => {
    materialData.value.splice(index, 1);
  });
};

const cancelAdd = async () => {
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
    await router.push("/modules/work-order/evident/psb");
  }
};

const submitData = async () => {
  const result = await Swal.fire({
    title: "Add Data?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Add!",
  });

  if (result.isConfirmed) {
    try {
      showLoading();
      const fixData = { ...savedData.value };
      //  console.log('data awal:',fixData)
      if (materialData.value && materialData.value.length > 0) {
        const cleanedArray = materialData.value.filter((item) => {
          return Object.values(item).some((value) => value !== "");
        });
        fixData.Tr_teknis_work_order_tersedia = fixData.Tr_teknis_work_order_tersedia.concat(
          cleanedArray
        );
      }
      
      const prefix = await BonMaterial_GetPrefixByTypeAndDate(fixData.Tr_teknis_jenis, fixData.Tr_teknis_created)
      fixData.Tr_teknis_logistik_id = prefix.nextId
      // console.log(fixData)
      await adminTeknis_CreateData(fixData);
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
    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col gap-2 p-6.5">

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Nama Tas
              </label>
              <input
                type="text"
                placeholder="Nama Tas"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.Tr_teknis_item"
              />
            </div>

            <div>
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
      </div>
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Input Material Terpakai">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in materialData"
              v-if="materialData.length > 0"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-8/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Nama Barang
                </label>
                <input
                  type="text"
                  placeholder="Nama Barang"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.label"
                />
              </div>
              <div
                class="w-4/12"
              >
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Qty. Keluar
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qtyKeluar"
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
                  @click="handleRemoveMaterialTerpakai"
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
          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <button
              @click="cancelAdd"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Cancel
            </button>
            <button
              @click="submitData"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Add Data
            </button>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
    </div>
    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
