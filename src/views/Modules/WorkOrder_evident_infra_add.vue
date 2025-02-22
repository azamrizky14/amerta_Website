<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import inputImageWithPreview from "@/components/Forms/SelectGroup/inputImageWithPreview.vue";
import Swal from "sweetalert2";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import multiselectOption from "@/components/Forms/SelectGroup/multiselectOption.vue";

import { useIndexStore } from "@/stores";
import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import {
  adminTeknis_CreateDataEvidentWithImages,
  adminTeknis_GetDataByDomainAndDeletedAndTypeAndStatus,
  getUserInternalByRole,
} from "@/stores/functionAPI";

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore();
const pageTitle = ref("Evident - Tambah INFRA");
const pageList = ref(["Work Order", "Evident", "INFRA", "Tambah"]);

// Saved Data
const savedData = ref({
  Tr_teknis_pelanggan_id: "",
  Tr_teknis_pelanggan_nama: "",
  Tr_teknis_pelanggan_server: "",
  Tr_teknis_user_updated: "",
  Tr_teknis_keterangan: "",
  Tr_teknis_logistik_id: "",
  Tr_teknis_jenis: "INFRA",
  Tr_teknis_kategori: "INFRA",
  Tr_teknis_trouble: "",
  Tr_teknis_action: "",
  Tr_teknis_team: [],

  // INFRA
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

  Tr_teknis_tanggal: "",
  Tr_teknis_created: "",
  Tr_teknis_work_order_terpakai_material: [],
});

const materialData = ref([]);
const logistikData = ref(null);
const optionsType = ref([]);

const options = [
  { label: "PSB", value: "PSB" },
  { label: "MT", value: "MT" },
];

const optionsTeknisi: any[] = ref([]);

onMounted(async () => {
  const data = await getUserInternalByRole(
    indexStore.user.companyName
    //  "Teknisi " + savedData.value.Tr_teknis_jenis
  );
  console.log("list user", data);
  if (data) {
    optionsTeknisi.value = data.map((x, i) => ({
      id: i,
      name: x.userName,
      role: x.userRole,
    }));
  }
  const options = await adminTeknis_GetDataByDomainAndDeletedAndTypeAndStatus(
    "N",
    "INFRA",
    "open",
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode
  );
  options.forEach((option) => {
    option.label = option.Tr_teknis_logistik_id + " - " + option.Tr_teknis_item;
  });
  optionsType.value = options;
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.Tr_teknis_tanggal = date;
  savedData.value.Tr_teknis_created = date;
  savedData.value.Tr_teknis_user_updated = indexStore.user.userName;
});

// Function

const handleChangeType = async () => {
  const data = await getUserInternalByRole(
    indexStore.user.companyName,
    "Teknisi " + logistikData.Tr_teknis_jenis
  );
  console.log("list user", data);
};
const handleButtonClick = async () => {
  alert("tes");
};

const handleRemoveMaterialTerpakai = async (index) => {
  await confirmDelete(null, null, async () => {
    materialData.value.splice(index, 1);
  });
};

// Function to handle option change
const handleOptionChange = async (selected: { label: string; value: string }) => {
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
    await router.push("/modules/work-order/evident/infra");
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

// Validasi qtyKeluar tidak boleh kurang dari 1
const validateQtyKeluar = (index, qtySisa) => {
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  if (
    materialData.value[index].qty !== "" &&
    (materialData.value[index].qty < 0 || materialData.value[index].qty > qtySisa)
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
      materialData.value[index].qty = 0;
    });
  }
};

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

  const validatorMT = [
    { key: "Tr_teknis_trouble", label: "Masalah" },
    { key: "Tr_teknis_action", label: "Solusi" },
  ];

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

      // Clone the savedData to avoid mutating the original
      const fixData = { ...savedData.value };

      // Clean material data if needed
      if (materialData.value && materialData.value.length > 0) {
        const cleanedArray = materialData.value.filter((item) => {
          return Object.values(item).some((value) => value !== "");
        });
        fixData.Tr_teknis_work_order_terpakai_material = cleanedArray.sort((a, b) => {
          const aHasONT = a.label.toLowerCase().includes("ont");
          const bHasONT = b.label.toLowerCase().includes("ont");

          if (aHasONT && !bHasONT) return 1; // Move `a` after `b`
          if (!aHasONT && bHasONT) return -1; // Keep `a` before `b`
          return 0; // Maintain order otherwise
        });
        fixData.Tr_teknis_work_order_terpakai_material = fixData.Tr_teknis_work_order_terpakai_material.map(
          (x) => {
            // Check if label is "ONT" and dataSN is not empty
            if (x.label.toLowerCase().includes("ont") && x.snNumber) {
              return {
                qtySisa: x.qtySisa - 1,
                label: x.label,
                qty: 1,
                snNumber: x.snNumber,
              };
            } else if (x.label.toLowerCase().includes("ont") && !x.snNumber) {
              return {
                qtySisa: x.qtySisa,
                label: x.label,
                qty: 0,
              };
            } else {
              return {
                qtySisa: x.qtySisa - x.qty,
                label: x.label,
                qty: x.qty ? x.qty : 0,
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
      fixData.Tr_teknis_team = JSON.stringify(fixData.Tr_teknis_team.map((x) => x.name));

      const sendData = new FormData();

      // Append all fields  to FormData
      Object.keys(fixData).forEach((key) => {
        if (Array.isArray(fixData[key])) {
          sendData.append(key, JSON.stringify(fixData[key])); // Ensure arrays are stringified
        } else {
          sendData.append(key, fixData[key]);
        }
      });

      await adminTeknis_CreateDataEvidentWithImages(sendData);

      await successCreate().then(() => {
        router.push("/modules/work-order/evident/infra");
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
    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="w-full">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Bon Material
                </label>
                <SelectGroup
                  placeholder="Pilih Bon & Material"
                  :options="optionsType"
                  v-model="logistikData"
                  @option-changed="handleOptionChange"
                />
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Teknisi
              </label>
              <div>
                <multiselectOption
                  :options="optionsTeknisi"
                  v-model="savedData.Tr_teknis_team"
                  placeholder="Pilih Teknisi..."
                />
              </div>
            </div>

            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="lg:w-2/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Pelanggan (Wajib Diisi)
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
                Nama Pelanggan (Wajib Diisi)
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
                Keterangan
              </label>
              <textarea
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_keterangan"
              ></textarea>
            </div>

            <div v-if="logistikData && logistikData.Tr_teknis_keterangan">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Catatan Logistik
              </label>
              <textarea
                disabled
                rows="3"
                placeholder="Keterangan Logistik"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="logistikData.Tr_teknis_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->

        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Input Material Terpakai" v-if="logistikData">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in materialData"
              v-if="materialData && materialData.length > 0"
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
              <div class="w-3/12" v-if="!data.label.toLowerCase().includes('ont')">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Qty. Dipakai
                </label>
                <input
                  :disabled="!data.qtySisa"
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-4 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qty"
                  @change="validateQtyKeluar(index, data.qtySisa)"
                />
              </div>
              <div class="w-6/12" v-else>
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || data.label.toLowerCase().includes('ont')"
                >
                  SN
                </label>
                <input
                  :disabled="!data.qtySisa"
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
        <DefaultCard cardTitle="Masukan Gambar">
          <div class="grid grid-cols-2">
            <!-- Redaman Sebelum -->
            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Sebelum
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Redaman Sebelum"
                  v-model="savedData.Tr_teknis_redaman_sebelum"
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Kendala 1"
                  v-model="savedData.Tr_teknis_evident_kendala_1"
                />
              </div>
            </div>

            <!-- Kendala 2 -->
            <div class="col-span-3 grid grid-cols-2">
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Kendala 2"
                  v-model="savedData.Tr_teknis_evident_kendala_2"
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Kendala 3"
                  v-model="savedData.Tr_teknis_evident_kendala_3"
                />
              </div>
            </div>

            <!-- Proses Sambung -->
            <div class="col-span-3 grid grid-cols-1">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Progres
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Splicer - Proses Sambung"
                  v-model="savedData.Tr_teknis_evident_proses_sambung"
                />
              </div>
            </div>

            <!-- Redaman Sesudah -->
            <div class="col-span-3 grid grid-cols-3">
              <p class="text-black dark:text-white text-center p-2 col-span-3">
                Evident Sesudah
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Redaman Sesudah"
                  v-model="savedData.Tr_teknis_redaman_sesudah"
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Redaman Out ODP"
                  v-model="savedData.Tr_teknis_redaman_out_odp"
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Redaman Pelanggan"
                  v-model="savedData.Tr_teknis_redaman_pelanggan"
                />
              </div>
            </div>

            <!-- Marking Kabel -->
            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Marking Kabel
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Start"
                  v-model="savedData.Tr_teknis_evident_marking_dc_start"
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="End"
                  v-model="savedData.Tr_teknis_evident_marking_dc_end"
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
