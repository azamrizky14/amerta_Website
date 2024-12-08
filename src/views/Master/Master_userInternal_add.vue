<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import inputImageWithPreview from "@/components/Forms/SelectGroup/inputImageWithPreview.vue";
import Swal from "sweetalert2";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import multiselectReadOnly from "@/components/Forms/SelectGroup/multiselectReadOnly.vue";

import { useIndexStore } from '@/stores'
import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import {
  adminTeknis_CreateDataEvidentWithImages,
  adminTeknis_GetDataByDomainAndDeletedAndTypeAndStatus,
} from "@/stores/functionAPI";

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore()
const pageTitle = ref("Master - Add User Internal");
const pageList = ref(["Master", "User Internal", "Add"]);

// Saved Data
const savedData = ref({
  Tr_teknis_pelanggan_id: "",
  Tr_teknis_pelanggan_nama: "",
  Tr_teknis_pelanggan_server: "",
  Tr_teknis_user_updated: "",
  Tr_teknis_keterangan: "",
  Tr_teknis_logistik_id: "",
  Tr_teknis_jenis: "PSB",

  Tr_teknis_evident_progress: null,
  Tr_teknis_evident_speed_test: null,
  Tr_teknis_evident_review_google: null,
  Tr_teknis_evident_kertas_psb: null,
  Tr_teknis_evident_redaman_odp: null,
  Tr_teknis_evident_redaman_ont: null,
  Tr_teknis_evident_odp_depan: null,
  Tr_teknis_evident_odp_dalam: null,
  Tr_teknis_evident_pelanggan_dengan_pelanggan: null,
  Tr_teknis_evident_pelanggan_depan_rumah: null,
  Tr_teknis_evident_marking_dc_start: null,
  Tr_teknis_evident_marking_dc_end: null,

  Tr_teknis_tanggal: "",
  Tr_teknis_created: "",
  Tr_teknis_work_order_terpakai_material: [],
});

const materialData = ref([]);
const logistikData = ref(null);
const optionsType = ref([]);

// const optionsType = [
//   { label: "PSB", value: "PSB" },
//   { label: "MT", value: "MT" },
//   { label: "INFRA", value: "INFRA" },
// ];

onMounted(async () => {
  const options = await adminTeknis_GetDataByDomainAndDeletedAndTypeAndStatus(
    "N",
    "PSB",
    "open"
  );
  options.forEach((option) => {
    option.label = option.Tr_teknis_logistik_id + " - " + option.Tr_teknis_item;
  });
  optionsType.value = options;
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.Tr_teknis_tanggal = date;
  savedData.value.Tr_teknis_created = date;
  savedData.value.Tr_teknis_user_updated = indexStore.user.userName
});

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
  // Perform any additional actions here
  materialData.value.splice(0, materialData.value.length);
  if (selected.Tr_teknis_work_order_tersedia) {
    savedData.value.Tr_teknis_logistik_id = selected.Tr_teknis_logistik_id;
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

// Validators for required fields
const dataValidator = ref([
  { key: "logistikData", label: "Kode Bon Material" },
  { key: "Tr_teknis_pelanggan_id", label: "Id Pelanggan" },
  { key: "Tr_teknis_pelanggan_server", label: "Server" },
  { key: "Tr_teknis_pelanggan_nama", label: "Nama Pelanggan" },
]);

const dataError = ref([]);

// Helper function for validation
const validateForm = () => {
  // Clear previous errors
  dataError.value = [];

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

  // Return true if no errors, false otherwise
  return dataError.value.length === 0;
};

const submitData = async () => {
  // Validate form before submission
  const isValid = validateForm();

  // If validation fails, show errors
  if (!isValid) {
    return; // Stop the submission process
  }

  // If form is valid, continue with submission
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

      // Clone the savedData to avoid mutating the original
      const fixData = { ...savedData.value };

      // Clean material data if needed
      if (materialData.value && materialData.value.length > 0) {
        const cleanedArray = materialData.value.filter((item) => {
          return Object.values(item).some((value) => value !== "");
        });
        fixData.Tr_teknis_work_order_terpakai_material = cleanedArray;
        fixData.Tr_teknis_work_order_terpakai_material = fixData.Tr_teknis_work_order_terpakai_material.map(
          (x) => {
            // Check if label is "ONT" and dataSN is not empty
            if (x.label.includes("ONT") && x.snNumber) {
              return {
                label: x.label,
                qty: 1,
                snNumber: x.snNumber
              };
            } else if (x.label.includes("ONT") && !x.snNumber) {
              return {
                label: x.label,
                qty: 0,
              };
            } else {
              return {
                label: x.label,
                qty: x.qty,
              };
            }
          }
        );
      }

      // Ensure the Tr_teknis_work_order_terpakai is stringified for proper parsing on the server
      if (
        fixData.Tr_teknis_work_order_terpakai &&
        Array.isArray(fixData.Tr_teknis_work_order_terpakai)
      ) {
        fixData.Tr_teknis_work_order_terpakai = JSON.stringify(
          fixData.Tr_teknis_work_order_terpakai
        );
      }

      const sendData = new FormData();

      // Append all fields to FormData
      Object.keys(fixData).forEach((key) => {
        if (Array.isArray(fixData[key])) {
          sendData.append(key, JSON.stringify(fixData[key])); // Ensure arrays are stringified
        } else {
          sendData.append(key, fixData[key]);
        }
      });

      // Handle file uploads if necessary
      const files = document.querySelector('input[type="file"]').files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          sendData.append("images", files[i]);
        }
      }

      await adminTeknis_CreateDataEvidentWithImages(sendData);

      await successCreate().then(() => {
        router.push("/modules/work-order/evident/psb");
      });
    } catch (error) {
      await failedCreate(error);
    }
  }
};

// Fungsi untuk menghapus gambar
const removeImage = (field: string) => {
  savedData.value[field] = null;
};
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <!-- ====== Form Elements Section Start -->
    <div class="grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="lg:w-3/5">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Email
                </label>
                <input
                  type="text"
                  placeholder="Id Pelanggan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_pelanggan_id"
                />
              </div>
            </div>

            <div class="lg:w-3/5">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Password
                </label>
                <input
                  type="text"
                  placeholder="Id Pelanggan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_pelanggan_id"
                />
              </div>

              <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Nama User
              </label>
              <input
                type="text"
                placeholder="Nama Pelanggan"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.Tr_teknis_pelanggan_nama"
              />
            </div>

            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  No. Telp
                </label>
                <input
                  type="text"
                  placeholder="Id Pelanggan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_pelanggan_id"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  placeholder="Server"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_pelanggan_server"
                />
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Alamat
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
        <!-- Textarea Fields Start -->
        <DefaultCard cardTitle="Input Images">
          <div class="grid grid-cols-2">
            <div class="flex border flex-col items-center p-2 justify-end relative">
              <inputImageWithPreview
                label="Evident Progress"
                v-model="savedData.Tr_teknis_evident_progress"
                @update:file="(file) => (savedData.Tr_teknis_evident_progress = file)"
              />
              <!-- Tombol Hapus -->
              <button
                v-if="savedData.Tr_teknis_evident_progress"
                @click="removeImage('Tr_teknis_evident_progress')"
                class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
              >
                X
              </button>
            </div>

            <div class="flex border flex-col items-center p-2 justify-end relative">
              <inputImageWithPreview
                label="Evident SpeedTest"
                v-model="savedData.Tr_teknis_evident_speed_test"
                @update:file="(file) => (savedData.Tr_teknis_evident_speed_test = file)"
              />
              <!-- Tombol Hapus -->
              <button
                v-if="savedData.Tr_teknis_evident_speed_test"
                @click="removeImage('Tr_teknis_evident_speed_test')"
                class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
              >
                X
              </button>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Review Google"
                  v-model="savedData.Tr_teknis_evident_review_google"
                  @update:file="
                    (file) => (savedData.Tr_teknis_evident_review_google = file)
                  "
                />
                <!-- Tombol Hapus -->
                <button
                  v-if="savedData.Tr_teknis_evident_review_google"
                  @click="removeImage('Tr_teknis_evident_review_google')"
                  class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
                >
                  X
                </button>
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Kertas Form PSB"
                  v-model="savedData.Tr_teknis_evident_kertas_psb"
                  @update:file="(file) => (savedData.Tr_teknis_evident_kertas_psb = file)"
                />
                <!-- Tombol Hapus -->
                <button
                  v-if="savedData.Tr_teknis_evident_kertas_psb"
                  @click="removeImage('Tr_teknis_evident_kertas_psb')"
                  class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
                >
                  X
                </button>
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Redaman
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="ODP"
                  v-model="savedData.Tr_teknis_evident_redaman_odp"
                  @update:file="
                    (file) => (savedData.Tr_teknis_evident_redaman_odp = file)
                  "
                />
                <!-- Tombol Hapus -->
                <button
                  v-if="savedData.Tr_teknis_evident_redaman_odp"
                  @click="removeImage('Tr_teknis_evident_redaman_odp')"
                  class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
                >
                  X
                </button>
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="ONT"
                  v-model="savedData.Tr_teknis_evident_redaman_ont"
                  @update:file="
                    (file) => (savedData.Tr_teknis_evident_redaman_ont = file)
                  "
                />
                <!-- Tombol Hapus -->
                <button
                  v-if="savedData.Tr_teknis_evident_redaman_ont"
                  @click="removeImage('Tr_teknis_evident_redaman_ont')"
                  class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
                >
                  X
                </button>
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident ODP
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="ODP (Tampak Depan)"
                  v-model="savedData.Tr_teknis_evident_odp_depan"
                  @update:file="(file) => (savedData.Tr_teknis_evident_odp_depan = file)"
                />
                <!-- Tombol Hapus -->
                <button
                  v-if="savedData.Tr_teknis_evident_odp_depan"
                  @click="removeImage('Tr_teknis_evident_odp_depan')"
                  class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
                >
                  X
                </button>
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="PORT (Tampak Dalam)"
                  v-model="savedData.Tr_teknis_evident_odp_dalam"
                  @update:file="(file) => (savedData.Tr_teknis_evident_odp_dalam = file)"
                />
                <!-- Tombol Hapus -->
                <button
                  v-if="savedData.Tr_teknis_evident_odp_dalam"
                  @click="removeImage('Tr_teknis_evident_odp_dalam')"
                  class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
                >
                  X
                </button>
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Customer
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Dengan Pelanggan"
                  v-model="savedData.Tr_teknis_evident_pelanggan_dengan_pelanggan"
                  @update:file="
                    (file) =>
                      (savedData.Tr_teknis_evident_pelanggan_dengan_pelanggan = file)
                  "
                />
                <!-- Tombol Hapus -->
                <button
                  v-if="savedData.Tr_teknis_evident_pelanggan_dengan_pelanggan"
                  @click="removeImage('Tr_teknis_evident_pelanggan_dengan_pelanggan')"
                  class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
                >
                  X
                </button>
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Depan Rumah Pelanggan"
                  v-model="savedData.Tr_teknis_evident_pelanggan_depan_rumah"
                  @update:file="
                    (file) => (savedData.Tr_teknis_evident_pelanggan_depan_rumah = file)
                  "
                />
                <!-- Tombol Hapus -->
                <button
                  v-if="savedData.Tr_teknis_evident_pelanggan_depan_rumah"
                  @click="removeImage('Tr_teknis_evident_pelanggan_depan_rumah')"
                  class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
                >
                  X
                </button>
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Marking Kabel
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Start"
                  v-model="savedData.Tr_teknis_evident_marking_dc_start"
                  @update:file="
                    (file) => (savedData.Tr_teknis_evident_marking_dc_start = file)
                  "
                />
                <!-- Tombol Hapus -->
                <button
                  v-if="savedData.Tr_teknis_evident_marking_dc_start"
                  @click="removeImage('Tr_teknis_evident_marking_dc_start')"
                  class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
                >
                  X
                </button>
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="End"
                  v-model="savedData.Tr_teknis_evident_marking_dc_end"
                  @update:file="
                    (file) => (savedData.Tr_teknis_evident_marking_dc_end = file)
                  "
                />
                <!-- Tombol Hapus -->
                <button
                  v-if="savedData.Tr_teknis_evident_marking_dc_end"
                  @click="removeImage('Tr_teknis_evident_marking_dc_end')"
                  class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
                >
                  X
                </button>
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
