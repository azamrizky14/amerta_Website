<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import imageWithPreviewInfra from "@/components/Forms/SelectGroup/imageWithPreviewInfra.vue";
import Swal from "sweetalert2";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import multiselectOptionEdit from "@/components/Forms/SelectGroup/multiselectOptionEdit.vue";

import { domain } from "@/API/";
import { getDateToday } from "@/stores/date";
import { useIndexStore } from "@/stores";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import {
  adminTeknis_UpdateDataImage,
  adminTeknis_GetDataEvidentById,
  getUserInternalByRole,
} from "@/stores/functionAPI";

import { ref, onMounted } from "vue";
import router from "@/router";
import { useRoute } from "vue-router";

const route = useRoute();
const indexStore = useIndexStore();
const optionsTeknisi: Option[] = ref([]);
const evidentStart = ref(true);
const evidentProgress = ref(true);
const evidentEnd = ref(true);

const imageUrl = "images/admin_logistik";
const pageTitle = ref("Evident - Edit INFRA");
const pageList = ref(["Work Order", "Evident", "INFRA", "Edit"]);

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
  Tr_teknis_work_order_images: {},

  // INFRA
  Tr_teknis_evident_start: [],
  Tr_teknis_evident_progress: [],
  Tr_teknis_evident_end: [],

  Tr_teknis_tanggal: "",
  Tr_teknis_created: "",
  Tr_teknis_work_order_terpakai_material: [],
});

const loading = ref(true); // Loading state
const materialData = ref([]);
const logistikData = ref(null);
const optionsType = ref([]);

onMounted(async () => {
  console.log("data", indexStore.user);
  try {
    const [data, listTeknisi] = await Promise.all([
      getUserInternalByRole(
        indexStore.user.companyName
        // "Teknisi " + savedData.value.Tr_teknis_jenis
      ),
      getData(),
    ]);

    if (data) {
      optionsTeknisi.value = data.map((x, i) => ({
        id: i,
        name: x.userName,
        role: x.userRole,
      }));
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false; // Stop loading indicator
  }
});

const isFile = (key: string) => {
  const image = savedData.value.Tr_teknis_work_order_images?.[key];
  console.log(image);
  return image && image instanceof File;
};

const getData = async () => {
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
  console.log("ini data", data);
  savedData.value = data;
};

// Function
const handleButtonClick = async () => {
  alert("tes");
};

const handleRemoveMaterialTerpakai = async (index) => {
  await confirmDelete(null, null, async () => {
    materialData.value.splice(index, 1);
  });
};

// Function to handle option change
const handleOptionChange = (selected: { label: string; value: string }) => {
  console.log("Selected option changed:", selected);
  // Perform any additional actions here
  materialData.value.splice(0, materialData.value.length);
  if (selected.Tr_teknis_work_order_tersedia) {
    savedData.value.Tr_teknis_logistik_id = selected.Tr_teknis_logistik_id;
    // console.log('berhasil')
    selected.Tr_teknis_work_order_tersedia.forEach((data) => {
      materialData.value.push({
        label: data.label,
        qtySisa: data.qty,
        qty: "",
      });
    });

    // Step 2: Merge all Tr_teknis_work_order_terpakai_material and reduce qtySisa accordingly
    if (
      selected.Tr_teknis_work_order_terpakai &&
      selected.Tr_teknis_work_order_terpakai.length > 0
    ) {
      const mergedMaterials = selected.Tr_teknis_work_order_terpakai.flatMap(
        (item) => item.Tr_teknis_work_order_terpakai_material || []
      );

      // Deduct the qty from qtySisa in materialData if labels match
      mergedMaterials.forEach((material) => {
        const existingItem = materialData.value.find(
          (item) => item.label === material.label
        );
        if (existingItem) {
          existingItem.qtySisa -= material.qty; // Reduce qtySisa based on the merged qty
          if (existingItem.qtySisa < 0) existingItem.qtySisa = 0; // Ensure qtySisa doesn't go below 0
        }
      });
    }
  }
  // console.log('saved data: ', materialData.value)
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
    await router.push("/modules/work-order/evident/infra");
  }
};

// Validators for required fields
const dataValidator = ref([
  { key: "Tr_teknis_pelanggan_server", label: "Titik Koordinat" },
  { key: "Tr_teknis_pelanggan_nama", label: "Nama Project" },
]);

const dataError = ref([]);

// Helper function for validation
const validateForm = () => {
  // Clear previous errors
  // Validate each field
  dataValidator.value.forEach((validator) => {
    if (
      (validator.key === "logistikData" && !logistikData.value) || // For logistikData
      (!savedData.value[validator.key] && validator.key !== "logistikData") // For other fields in savedData
    ) {
      // Add error message if validation fails
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  console.log("list error", dataError.value);
  // Return true if no errors, false otherwise
  return dataError.value.length === 0;
};

const cancelEdit = async () => {
  const result = await Swal.fire({
    title: "Batal Edit?",
    text: "Anda yakin ingin membatalkan edit data ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await router.push("/modules/work-order/evident/infra");
  }
};

const resetData = async () => {
  const result = await Swal.fire({
    title: "Reset Data?",
    text: "anda yakin ingin mereset perubahan yang anda buat?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Reset",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await getData();
  }
};

const submitData = async () => {
  console.log(savedData.value);
  // Validate form before submission
  const isValid = validateForm();

  // If validation fails, show errors
  if (!isValid) {
    return; // Stop the submission process
  }

  // If form is valid, continue with submission
  const result = await Swal.fire({
    title: "Edit Data?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Edit",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    try {
      showLoading();

      const fixData = { ...savedData.value };

      fixData.Tr_teknis_team = JSON.stringify(fixData.Tr_teknis_team.map((x) => x.name));
      fixData.Tr_teknis_team = JSON.stringify(fixData.Tr_teknis_team);
      fixData.Tr_teknis_work_order_terpakai_material = JSON.stringify(
        fixData.Tr_teknis_work_order_terpakai_material
      );

      Object.keys(fixData.Tr_teknis_work_order_images).forEach((key) => {
        const dataKey = fixData.Tr_teknis_work_order_images[key];
        if (dataKey) {
          dataKey.forEach((data) => {
            if (dataKey[data] === null) {
              dataKey[data] = "";
            }
          });
        }
      });

      const sendData = new FormData();

      // Function to append array data properly
      const appendArrayData = (key: string, array: any[]) => {
        array.forEach((item, index) => {
          if (item instanceof File) {
            sendData.append(`${key}[${index}]`, item);
          } else if (typeof item === "string") {
            sendData.append(`${key}[${index}]`, item);
          } else {
            sendData.append(`${key}[${index}]`, ""); // `{}` dikirim sebagai string kosong
          }
        });
      };

      // Function to handle nested object data
      const appendObjectData = (parentKey: string, obj: Record<string, any>) => {
        Object.keys(obj).forEach((key) => {
          const fullKey = `${parentKey}.${key}`; // Format key untuk object
          if (Array.isArray(obj[key])) {
            appendArrayData(fullKey, obj[key]); // Handle array dalam object
          } else if (typeof obj[key] === "object" && obj[key] !== null) {
            appendObjectData(fullKey, obj[key]); // Rekursi untuk nested object
          } else {
            sendData.append(fullKey, obj[key]); // Append jika bukan object atau array
          }
        });
      };

      // Append each field to FormData
      Object.keys(fixData).forEach((key) => {
        if (Array.isArray(fixData[key])) {
          appendArrayData(key, fixData[key]);
        } else if (typeof fixData[key] === "object" && fixData[key] !== null) {
          appendObjectData(key, fixData[key]); // Tangani nested object
        } else {
          sendData.append(key, fixData[key]);
        }
      });

      //
      await adminTeknis_UpdateDataImage(
        sendData,
        route.params.id,
        fixData.Tr_teknis_logistik_id
      );

      await successCreate().then(() => {
        router.push("/modules/work-order/evident/infra");
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
        <DefaultCard cardTitle="Edit Data">
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
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_kategori"
                />
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Teknisi
              </label>
              <div>
                <multiselectOptionEdit
                  :options="optionsTeknisi"
                  v-model="savedData.Tr_teknis_team"
                  placeholder="Pilih Teknisi..."
                />
                <div v-if="loading" class="text-gray-500 mt-2">Loading...</div>
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Nama Project (Wajib Diisi)
              </label>
              <input
                type="text"
                placeholder="Nama Project"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.Tr_teknis_pelanggan_nama"
              />
            </div>

            <div class="flex flex-col gap-6">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Titik Koordinat (Wajib Diisi)
                </label>
                <input
                  type="text"
                  placeholder="Titik Koordinat"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_pelanggan_server"
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

        <!-- Input Fields Start -->
        <DefaultCard
          cardTitle="Edit Material Terpakai"
          @handle-click="handleAddMaterialTerpakai"
        >
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in savedData.Tr_teknis_work_order_terpakai_material"
              v-if="
                savedData && savedData.Tr_teknis_work_order_terpakai_material.length > 0
              "
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-6/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Nama Barang
                </label>
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-else-if="data.label.toLowerCase().includes('ont')"
                >
                  ONT
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Barang"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.label"
                />
              </div>
              <div class="w-3/12" v-if="!data.label.toLowerCase().includes('ont')">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Qty. Dipakai
                </label>
                <input
                  disabled
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-4 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qty"
                />
              </div>
              <div class="w-3/12" v-if="!data.label.toLowerCase().includes('ont')">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Qty. Tersisa
                </label>
                <input
                  disabled
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-4 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qtySisa"
                />
              </div>
              <div class="w-6/12" v-else>
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || data.label.toLowerCase().includes('ont')"
                >
                  Serial Number
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="SN"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.snNumber"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <div class="flex flex-col gap-9">
        <!-- Textarea Fields Start -->
        <DefaultCard cardTitle="Edit Gambar">
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
          <div v-if="dataError.length > 0" class="mt-4 mb-4">
            <ul>
              <li v-for="(error, index) in dataError" :key="index" class="ml-5 text-red">
                <b>- {{ error }}</b>
              </li>
            </ul>
          </div>
          <div class="pb-6 px-4 grid grid-cols-3 gap-2">
            <button
              @click="cancelEdit"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batal
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
