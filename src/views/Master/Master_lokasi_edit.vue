<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";
import {
  lokasi_UpdateData,
  lokasi_getDataByType,
  lokasi_getDataById,
} from "@/stores/functionAPI";
import selectOption from "@/components/Forms/SelectGroup/selectOption.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import router from "@/router";
import { useRoute } from "vue-router";

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
  { id: 1, label: "gudang", value: "gudang" },
  { id: 2, label: "ruang", value: "ruang" },
  { id: 3, label: "rak", value: "rak" },
];

const optionsGudang = ref([]);
const optionsRuang = ref([]);
const pageTitle = ref("Edit Lokasi");
const pageList = ref(["Master", "Lokasi", "Edit"]);

// Saved Data
const savedData = ref({
  lokasi_id: "",
  lokasi_nama: "",
  lokasi_tipe: "",
  lokasi_alamat: {
    lokasi_alamat_gudang: "",
    lokasi_alamat_ruang: "",
    lokasi_alamat_rak: "",
  },
  lokasi_keterangan: "",

  lokasi_user_created: indexStore.user.userName,
  lokasi_created: "",
  lokasi_updated: "",
  lokasi_deleted: "N",
  companyName: indexStore.user.companyName,
});

onMounted(async () => {
  const dataGudang = await lokasi_getDataByType(
    indexStore.user.companyName,
    "gudang",
    ""
  );
  if (dataGudang) {
    optionsGudang.value = dataGudang.data.map((x, i) => ({
      id: i,
      name: x.lokasi_nama,
    }));
  }
  await handleGetOldData();
  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_teknis_tanggal = date;

  savedData.value.lokasi_created = date;
});

const handleGetOldData = async () => {
  const newData = await lokasi_getDataById(route.params.id);
  savedData.value = newData;

  const data = optionsType.find((x) => x.value === savedData.value.lokasi_tipe);
  console.log("data", data);
  savedData.value.lokasi_tipe = data;

  console.log(savedData.value.lokasi_tipe);
  if (savedData.value.lokasi_tipe && savedData.value.lokasi_tipe.id > 1) {
    const dataGudang = optionsGudang.value.find(
      (x) => x.name === savedData.value.lokasi_alamat.lokasi_alamat_gudang
    );
    savedData.value.lokasi_alamat.lokasi_alamat_gudang = dataGudang;
  }

  if (savedData.value.lokasi_tipe && savedData.value.lokasi_tipe.id > 2) {
    await handleChangeGudang();
    const dataRuang = optionsRuang.value.find(
      (x) => x.name === savedData.value.lokasi_alamat.lokasi_alamat_ruang
    );
    savedData.value.lokasi_alamat.lokasi_alamat_ruang = dataRuang;
  }
};

const handleResetAlamat = async () => {
  savedData.value.lokasi_alamat = {
    lokasi_alamat_gudang: "",
    lokasi_alamat_ruang: "",
    lokasi_alamat_rak: "",
  };
};

const handleChangeGudang = async () => {
  // alert('tes')
  const gudang = savedData.value.lokasi_alamat.lokasi_alamat_gudang;
  const data = await lokasi_getDataByType(
    indexStore.user.companyName,
    "ruang",
    gudang.name
  );
  if (data) {
    optionsRuang.value = data.data.map((x, i) => ({
      id: i,
      name: x.lokasi_nama,
    }));
  }
};

const cancelEdit = async () => {
  const result = await Swal.fire({
    title: "Batalkan?",
    text: "anda yakin membatalkan Edit data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await router.push("/master/location");
  }
};

const resetEdit = async () => {
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
    await handleGetOldData();
  }
};

// Array validator untuk field wajib
const dataValidator = ref([
  { key: "lokasi_id", label: "Kode Lokasi" },
  { key: "lokasi_nama", label: "Nama Lokasi" },
  { key: "lokasi_tipe", label: "Tipe Lokasi" },
]);

const dataError = ref([]); // Array untuk menyimpan error

const submitData = async () => {
  console.log(savedData.value);
  // Clear previous errors
  dataError.value.splice(0, dataError.value.length);

  // Validasi field wajib dari data utama
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key] || savedData.value[validator.key].length === 0) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  if (savedData.value.lokasi_tipe.id > 0) {
    if (!savedData.value.lokasi_alamat.lokasi_alamat_gudang) {
      dataError.value.push(`Alamat gudang tidak boleh kosong!`);
    }
  }

  if (savedData.value.lokasi_tipe.id > 1) {
    if (!savedData.value.lokasi_alamat.lokasi_alamat_ruang) {
      dataError.value.push(`Alamat ruang tidak boleh kosong!`);
    }
  }

  if (savedData.value.lokasi_tipe.id > 2) {
    if (!savedData.value.lokasi_alamat.lokasi_alamat_rak) {
      dataError.value.push(`Alamat rak tidak boleh kosong!`);
    }
  }

  // Jika ada error, tampilkan di halaman dan hentikan submit
  if (dataError.value.length > 0) {
    return; // Jangan lanjutkan jika ada error
  }

  // Jika tidak ada error, lanjutkan dengan SweetAlert konfirmasi
  const result = await Swal.fire({
    title: "Edit Data?",
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

      const fixData = { ...savedData.value };

      if (fixData.lokasi_tipe && fixData.lokasi_tipe.value) {
        fixData.lokasi_tipe = fixData.lokasi_tipe.value;
      }

      if (typeof fixData.lokasi_alamat.lokasi_alamat_gudang === "object") {
        fixData.lokasi_alamat.lokasi_alamat_gudang =
          fixData.lokasi_alamat.lokasi_alamat_gudang.name;
      }

      if (typeof fixData.lokasi_alamat.lokasi_alamat_ruang === "object") {
        fixData.lokasi_alamat.lokasi_alamat_ruang =
          fixData.lokasi_alamat.lokasi_alamat_ruang.name;
      }

      await lokasi_UpdateData(fixData, route.params.id);
      await successCreate().then(() => {
        router.push("/master/location");
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

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Data Wajib ">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Lokasi
                </label>
                <input
                  type="text"
                  placeholder="Masukan Kode Lokasi"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.lokasi_id"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tipe Lokasi
                </label>
                <SelectGroup
                  placeholder="Pilih Tipe"
                  :options="optionsType"
                  v-model="savedData.lokasi_tipe"
                  @option-changed="handleResetAlamat()"
                />
              </div>
            </div>
            <div class="flex flex-col gap-3">
              <div>
                <label
                  class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
                >
                  Nama Lokasi
                </label>
                <input
                  type="text"
                  placeholder="Masukan Nama Lokasi"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.lokasi_nama"
                />
              </div>
            </div>

            <div>
              <label
                v-if="savedData.lokasi_tipe"
                class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
              >
                Alamat
              </label>
              <!-- Input Gudang -->
              <input
                v-if="savedData.lokasi_tipe && savedData.lokasi_tipe.label === 'gudang'"
                type="text"
                placeholder="Masukan Gudang"
                class="w-full mb-3 rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.lokasi_alamat.lokasi_alamat_gudang"
              />
              <!-- Input Ruang -->

              <div
                class="mb-3"
                v-if="savedData.lokasi_tipe && savedData.lokasi_tipe.id > 1"
              >
                <selectOption
                  :options="optionsGudang"
                  v-model="savedData.lokasi_alamat.lokasi_alamat_gudang"
                  placeholder="Pilih Gudang"
                  @data-change="handleChangeGudang()"
                />
              </div>

              <input
                v-if="savedData.lokasi_tipe && savedData.lokasi_tipe.label === 'ruang'"
                type="text"
                placeholder="Masukan Ruang"
                class="w-full mb-3 rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.lokasi_alamat.lokasi_alamat_ruang"
              />
              <!-- Input Rak -->

              <div
                class="mb-3"
                v-if="savedData.lokasi_tipe && savedData.lokasi_tipe.id > 2"
              >
                <selectOption
                  :options="optionsRuang"
                  v-model="savedData.lokasi_alamat.lokasi_alamat_ruang"
                  placeholder="Pilih Ruang"
                />
              </div>

              <input
                v-if="savedData.lokasi_tipe && savedData.lokasi_tipe.label === 'rak'"
                type="text"
                placeholder="Masukan Rak"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.lokasi_alamat.lokasi_alamat_rak"
              />
            </div>
            <!-- Qty Keluar Input -->
            <div>
              <!-- <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Teknisi
              </label>
              <div>
                <selectOption
                  :options="options"
                  v-model="savedData.Tr_teknis_team"
                  placeholder="Pilih Teknisi..."
                />
              </div>
            </div> -->
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Data Tambahan">
          <div class="p-6.5">
            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Keterangan
              </label>
              <textarea
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.lokasi_keterangan"
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
          <div class="pb-6 px-4 grid grid-cols-3 gap-2">
            <button
              @click="cancelEdit"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batalkan
            </button>
            <button
              @click="resetEdit"
              class="flex w-full justify-center rounded bg-gray-500 p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Reset
            </button>
            <button
              @click="submitData"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Edit Data
            </button>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
    </div>

    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
