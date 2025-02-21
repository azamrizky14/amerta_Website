<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import Swal from "sweetalert2";

import { useRoute } from "vue-router";
import { getDateToday } from "@/stores/date";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";
import { adminTeknis_UpdateData, adminTeknis_GetDataById } from "@/stores/functionAPI";
import multiselectReadOnly from "@/components/Forms/SelectGroup/multiselectReadOnly.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import { useIndexStore } from "@/stores";

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

const optionsType = [
  { label: "PSB", value: "PSB" },
  { label: "MT", value: "MT" },
  { label: "INFRA", value: "INFRA" },
];

const pageTitle = ref("Closing Bon & Material");
const pageList = ref(["Work Order", "Bon & Material", "Closing"]);

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

  Tr_teknis_status: "closed", // otomatis
  Tr_teknis_jenis: "", // otomatis
  Tr_teknis_deleted: "N", // otomatis
  Tr_teknis_domain: indexStore.user.companyName, // otomatis

  // Array WO Terpakai
  Tr_teknis_work_order_terpakai: [],

  // Array WO Tersedia
  Tr_teknis_work_order_tersedia: [],

  // Array WO Kembali
  Tr_teknis_work_order_kembali: [],
});

const materialData = ref([{ label: "", qty: "" }]);

onMounted(async () => {
  await getData();

  savedData.value.Tr_teknis_work_order_kembali = savedData.value.Tr_teknis_work_order_tersedia.map(
    (x) => ({
      label: x.label,
      qtySisa: x.qty,
      qty: "",
    })
  );

  // Step 2: Merge all Tr_teknis_work_order_terpakai_material and reduce qtySisa accordingly
  if (
    savedData.value.Tr_teknis_work_order_tersedia &&
    savedData.value.Tr_teknis_work_order_terpakai &&
    savedData.value.Tr_teknis_work_order_terpakai.length > 0
  ) {
    const mergedMaterials = savedData.value.Tr_teknis_work_order_terpakai.flatMap(
      (item) => item.Tr_teknis_work_order_terpakai_material || []
    );

    // Deduct the qty from qtySisa in materialData if labels match
    mergedMaterials.forEach((material) => {
      const existingItem = savedData.value.Tr_teknis_work_order_kembali.find(
        (item) => item.label === material.label
      );
      if (existingItem) {
        existingItem.qtySisa -= material.qty; // Reduce qtySisa based on the merged qty
        if (existingItem.qtySisa < 0) existingItem.qtySisa = 0; // Ensure qtySisa doesn't go below 0
      }
    });
  }

  savedData.value.Tr_teknis_user_closed = indexStore.user.userName;
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.Tr_teknis_closed = date;
});

// Array validator untuk field wajib
const dataValidator = ref([
  { key: "Tr_teknis_item", label: "Nama Tas" },
  { key: "Tr_teknis_jenis", label: "Jenis Permintaan" },
]);

const getData = async () => {
  let data = await adminTeknis_GetDataById(route.params.id);
  if (data.Tr_teknis_images) {
    data = { ...data, ...data.Tr_teknis_images };
    delete data.Tr_teknis_images;
  }

  savedData.value = data;
};

const dataError = ref([]); // Array untuk menyimpan error

// Validasi qtyKeluar tidak boleh kurang dari 1
const validateQtyKeluar = (index, qtySisa) => {
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  if (
    savedData.value.Tr_teknis_work_order_kembali[index].qty !== "" &&
    (savedData.value.Tr_teknis_work_order_kembali[index].qty < 0 ||
      savedData.value.Tr_teknis_work_order_kembali[index].qty > qtySisa)
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
      savedData.value.Tr_teknis_work_order_kembali[index].qty = 0;
    });
  }
};

const cancelClose = async () => {
  const result = await Swal.fire({
    title: "Batalkan Closing?",
    text: "anda yakin membatalkan closing data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await router.push("/modules/work-order/bon-dan-material");
  }
};

const submitData = async () => {
  // Clear previous errors
  dataError.value.splice(0, dataError.value.length);

  // Validasi field wajib dari data utama
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key] || savedData.value[validator.key].length === 0) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  // Jika ada error, tampilkan di halaman dan hentikan submit
  if (dataError.value.length > 0) {
    return; // Jangan lanjutkan jika ada error
  }

  // Jika tidak ada error, lanjutkan dengan SweetAlert konfirmasi
  const result = await Swal.fire({
    title: "Closing Data?",
    text: "Apakah Anda yakin ingin menutup data ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Closing!",
    cancelButtonText: "Batalkan",
  });

  if (result.isConfirmed) {
    try {
      showLoading();

      const fixData = { ...savedData.value };
      fixData.Tr_teknis_status = "closed";
      fixData.Tr_teknis_work_order_kembali = fixData.Tr_teknis_work_order_kembali.map(
        (x) => ({
          label: x.label,
          qty: x.qty ? x.qty : 0,
        })
      );

      await adminTeknis_UpdateData(fixData, route.params.id);
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
        <DefaultCard cardTitle="Detail Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Id Logistik
              </label>
              <input
                disabled
                type="text"
                placeholder="Nama Tas"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_logistik_id"
              />
            </div>

            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Dibuat
                </label>
                <input
                  disabled
                  type="date"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_tanggal"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Dibuat Oleh
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_user_created"
                />
              </div>
            </div>
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tim Peminta
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_jenis"
                />
                <!-- <SelectGroup
                  disabled
                  placeholder="Pilih Tim Peminta"
                  :options="optionsType"
                  v-model="savedData.Tr_teknis_jenis"
                /> -->
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Nama Tas
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_item"
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
        <DefaultCard cardTitle="List Material Kembali">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in savedData.Tr_teknis_work_order_kembali"
              v-if="savedData.Tr_teknis_work_order_kembali.length > 0"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-6/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
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
              <div class="w-3/12">
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
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qtySisa"
                  @change="validateQtyKeluar(index)"
                />
              </div>
              <div class="w-3/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Qty. Kembali
                </label>
                <input
                  :disabled="data.qtySisa === 0"
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qty"
                  @change="validateQtyKeluar(index, data.qtySisa)"
                />
              </div>
            </div>

            <div>
              <label
                class="mb-3 pt-6.5 block text-sm font-medium text-black dark:text-white"
              >
                Catatan Closing
              </label>
              <textarea
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_keterangan_closing"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
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
              @click="cancelClose"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batalkan
            </button>
            <button
              @click="submitData"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Closing Data
            </button>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
    </div>

    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
