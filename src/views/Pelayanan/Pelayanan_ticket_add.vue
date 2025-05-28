<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import vSelect from "vue-select";
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";

import { useIndexStore } from "@/stores";
import {
  tc_CreateTask,
  getUserInternalByRole,
  tc_GetPrefixByDate,
  tc_GetAllDataByDivisi,
} from "@/stores/functionAPI";
import { ref, onMounted } from "vue";
import router from "@/router";
import Swal from "sweetalert2";
import { getDateToday } from "@/stores/date";
import { showLoading, successCreate, failedCreate, confirmDelete } from "@/stores/swal";
import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";

const indexStore = useIndexStore();
const pageTitle = ref("Koordinator Ticket - Tambah");
const pageList = ref(["Work Order", "Koordinator", "Ticket", "Tambah"]);

const savedData = ref({
  Tr_ticket_id: "",
  Tr_ticket_created: "",
  CompanyName: indexStore.user.companyName,
  CompanyCode: indexStore.user.companyCode,

  Tr_ticket_keterangan: "",
  Tr_ticket_data_pelanggan: {},
  Tr_ticket_alamat: {
    Tr_ticket_alamat_lokasi: "",
    Tr_ticket_titik_koordinat: "",
  },
  Tr_ticket_updated: [],
  Tr_ticket_status: "Y",
});

const dataPelanggan = [
  {
    _id: {
      $oid: "6826f04b650ecbea79ae34cb",
    },
    data_pelanggan_nama: "NANANG CAHYO RUSBIANTO ",
    data_pelanggan_id: "022406000",
    data_pelanggan_lokasi: "Pasuruan - PT AMERTA ASA MEDIA",
    data_pelanggan_status: "B",
    data_pelanggan_nik: "32115670099",
    data_pelanggan_domisili: {
      data_pelanggan_domisili_provinsi: "Jawa Timur",
      data_pelanggan_domisili_kabupaten: "Pasuruan",
      data_pelanggan_domisili_kecamatan: "Purwosari",
      data_pelanggan_domisili_desa: "Purwosari",
    },
    data_pelanggan_paket: {
      data_pelanggan_paket_nama: "15Mbps",
      data_pelanggan_paket_jatuh_tempo: "",
      data_pelanggan_paket_terakhir_bayar: "",
    },
    data_pelanggan_alamat: {
      data_pelanggan_alamat_ktp: "Jl Raya Purwosari No 86 A",
      data_pelanggan_alamat_lokasi_pasang: "Jl Raya Purwosari No 86 A",
      data_pelanggan_alamat_titik_koordinat:
        "https://www.google.com/maps/place/Jl.+Raya+Purwosari+No.85,+Purwosari,+Kec.+Purwosari,+Pasuruan,+Jawa+Timur+67162/@-7.7731498,112.7425536,17z/data=!4m5!3m4!1s0x2dd7d3b8b5bc80d7:0x7b9ac86ea3bf5d85!8m2!3d-7.7731498!4d112.7451285?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoASAFQAw%3D%3D",
    },
    data_pelanggan_pic: {
      data_pelanggan_pic_nama: "",
      data_pelanggan_pic_alamat: "",
      data_pelanggan_pic_phone: "",
      data_pelanggan_pic_nik: "",
    },
    data_pelanggan_mikrotik_access: {
      data_pelanggan_mikrotik_access_tipe: "",
      data_pelanggan_mikrotik_access_username: "",
      data_pelanggan_mikrotik_access_password: "",
      data_pelanggan_mikrotik_access_router: "",
      data_pelanggan_mikrotik_access_profile: "",
      data_pelanggan_mikrotik_access_usersecret: "",
      data_pelanggan_mikrotik_access_passwordsecret: "",
      data_pelanggan_mikrotik_access_local_address: "",
      data_pelanggan_mikrotik_access_remote_address: "",
      data_pelanggan_mikrotik_access_mac_address: "",
    },
    data_pelanggan_afiliasi: {
      data_pelanggan_afiliasi_pic_sales: "Sales-Sejahtera",
    },
    data_pelanggan_created: "28-02-2025",
    data_pelanggan_updated: [
      {
        data_pelanggan_updated_nama: "Customer Service 1",
        data_pelanggan_updated_tanggal: "28-02-2025",
      },
    ],
    createdAt: {
      $date: "2025-05-16T07:59:07.374Z",
    },
    updatedAt: {
      $date: "2025-05-16T07:59:07.374Z",
    },
    __v: 0,
  },
];

const optionsTeknisi = ref([]);

const options = [
  { label: "PSB", value: "PSB" },
  { label: "Complain", value: "Complain" },
];

onMounted(async () => {
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.Tr_ticket_created = date;
  savedData.value.Tr_ticket_updated.push({
    Tr_ticket_updated_nama: indexStore.user.userName,
    Tr_ticket_updated_tanggal: date,
  });
});

const dataValidator = ref([
  { key: "Tr_ticket_name", label: "Detail Tiket" },
  { key: "Tr_ticket_kategori", label: "Kategori Tiket" },
]);

const dataError = ref([]);

const validateForm = () => {
  dataError.value = [];

  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key]) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  if (Object.keys(savedData.value.Tr_ticket_data_pelanggan).length === 0) {
    dataError.value.push(`Data Pelanggan tidak boleh kosong!`);
  }

  if (!savedData.value.Tr_ticket_alamat.Tr_ticket_alamat_lokasi) {
    dataError.value.push(`Alamat tidak boleh kosong!`);
  }

  if (!savedData.value.Tr_ticket_alamat.Tr_ticket_titik_koordinat) {
    dataError.value.push(`Titik Koordinat tidak boleh kosong!`);
  }

  return dataError.value.length === 0;
};

const submitData = async () => {
  const isValid = validateForm();

  if (!isValid) {
    return;
  }
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

      const fixData = { ...savedData.value };

      fixData.Tr_ticket_kategori = fixData.Tr_ticket_kategori.value;
      if (Object.keys(savedData.value.Tr_ticket_data_pelanggan).length > 0) {
        fixData.Tr_ticket_data_pelanggan = {
          Tr_ticket_data_pelanggan_id: fixData.Tr_ticket_data_pelanggan.data_pelanggan_id,
          Tr_ticket_data_pelanggan_nama:
            fixData.Tr_ticket_data_pelanggan.data_pelanggan_nama,
          Tr_ticket_data_pelanggan_paket_nama: fixData.Tr_ticket_data_pelanggan
            .data_pelanggan_paket.data_pelanggan_paket_nama
            ? fixData.Tr_ticket_data_pelanggan.data_pelanggan_paket
                .data_pelanggan_paket_nama
            : "",
          Tr_ticket_data_pelanggan_paket_bayar: "",
          Tr_ticket_data_pelanggan_afiliasi: fixData.Tr_ticket_data_pelanggan
            .data_pelanggan_afiliasi.data_pelanggan_afiliasi_pic_sales
            ? fixData.Tr_ticket_data_pelanggan.data_pelanggan_afiliasi
                .data_pelanggan_afiliasi_pic_sales
            : "",
        };
      }
      const prefix = await tc_GetPrefixByDate(
        fixData.Tr_ticket_kategori,
        fixData.Tr_ticket_created
      );
      if (prefix) {
        fixData.Tr_ticket_id = prefix.nextId;
      } else {
        return await failedCreate("Kode Prefix Error!");
      }
      // console.log(fixData);

      await tc_CreateTask(fixData);

      await successCreate().then(() => {
        router.push("/modules/pelayanan/ticket");
      });
    } catch (error) {
      await failedCreate(error);
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
    await router.push("/modules/pelayanan/ticket");
  }
};
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />

    <div class="grid grid-cols-2 gap-5">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Masukan Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="w-3/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Detail Tiket
                </label>
                <input
                  type="text"
                  placeholder="Detail Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_ticket_name"
                />
              </div>
              <div class="w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Kategori
                </label>
                <SelectGroup
                  placeholder="Kategori"
                  :options="options"
                  v-model="savedData.Tr_ticket_kategori"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Data Pelanggan
                </label>

                <v-select
                  :clearable="false"
                  v-model="savedData.Tr_ticket_data_pelanggan"
                  :options="dataPelanggan"
                  label="item_properties_id"
                  placeholder="Detail Modem"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <!-- Dropdown list -->
                  <template #option="option">
                    <template v-if="option">
                      {{ option.data_pelanggan_id }} - {{ option.data_pelanggan_nama }}
                    </template>
                    <template v-else>
                      <em class="text-gray-400">Loading...</em>
                    </template>
                  </template>

                  <!-- Saat sudah dipilih -->
                  <template #selected-option="option">
                    <span class="dark:text-white">
                      {{ option.data_pelanggan_id }} -
                      {{ option.data_pelanggan_nama }}</span
                    >
                  </template>
                </v-select>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Catatan
                </label>

                <textarea
                  rows="3"
                  placeholder="Masukan Catatan disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_ticket_keterangan"
                ></textarea>
              </div>
            </div>
          </div>
        </DefaultCard>
      </div>

      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Alamat">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Alamat
                </label>

                <textarea
                  rows="3"
                  placeholder="Masukan Alamat disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_ticket_alamat.Tr_ticket_alamat_lokasi"
                ></textarea>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="xl:pt-5">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Titik Koordinat
                </label>

                <textarea
                  rows="3"
                  placeholder="Masukan Titik Koordinat disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_ticket_alamat.Tr_ticket_titik_koordinat"
                ></textarea>
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <div class="flex flex-col gap-9 col-span-2">
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
      </div>
    </div>
  </DefaultLayout>
</template>
