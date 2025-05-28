<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import vSelect from "vue-select";
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";

import { useIndexStore } from "@/stores";
import { useRoute } from "vue-router";
import {
  announcement_UpdateAnnouncementById,
  announcement_GetAnnouncementById,
} from "@/stores/functionAPI";
import { ref, onMounted } from "vue";
import router from "@/router";
import Swal from "sweetalert2";
import { getDateToday, formatDate } from "@/stores/date";
import { showLoading, successEdit, failedCreate, confirmDelete } from "@/stores/swal";

const indexStore = useIndexStore();
const route = useRoute();
const pageTitle = ref("Announcement - Edit");
const pageList = ref(["Pelayanan", "Announcement", "Edit"]);
const dataHeader = ref([
  { name: "No.", class: "py-2 pl-3" },
  { name: "Id", class: "max-w-[125px] py-2 px-4" },
  { name: "Nama", class: "auto py-2 px-4" },
]);

const savedData = ref({
  Announcement_id: "",
  Announcement_created: "",
  CompanyName: indexStore.user.companyName,
  CompanyCode: indexStore.user.companyCode,
  Announcement_status: "Y",
  Announcement_updated: [],

  Announcement_name: "",
  Announcement_category: "",
  Announcement_message: "",
  Announcement_list: [],
});

const dataPelanggan = ref([
  {
    _id: {
      $oid: "6826f04b650ecbea79ae34cb",
    },
    data_pelanggan_nama: "NANANG CAHYO RUSBIANTO ",
    data_pelanggan_id: "022406000",
    data_pelanggan_lokasi: "Pasuruan - PT AMERTA ASA MEDIA",
    data_pelanggan_status: "B",
    data_pelanggan_nik: "32115670099",
    data_pelanggan_phone: "628235556324",
    data_pelanggan_domisili: {
      data_pelanggan_domisili_provinsi: "Jawa Timur",
      data_pelanggan_domisili_kabupaten: "Pasuruan",
      data_pelanggan_domisili_kecamatan: "Purwosari",
      data_pelanggan_domisili_desa: "Purwosari",
    },
    data_pelanggan_paket: {
      data_pelanggan_paket_nama: "15Mbps",

      data_pelanggan_paket_harga: "",
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
]);

const options = [
  { label: "Umum", value: "UMUM" },
  { label: "Pegawai-Slip", value: "PGWS" },
  { label: "Tagihan", value: "PLGN" },
];

const getData = async () => {
  const data = await announcement_GetAnnouncementById(route.params.id);
  savedData.value = data;
  savedData.value.Announcement_category = options.find(
    (x) => x.label === savedData.value.Announcement_category
  );

  const announcementPhones = data.Announcement_list.map((a) => a.Announcement_list_phone);

  dataPelanggan.value = dataPelanggan.value.map((x) => ({
    ...x,
    isChecked: announcementPhones.includes(x.data_pelanggan_phone),
  }));
};

onMounted(async () => {
  await getData();
});

const dataValidator = ref([
  { key: "Announcement_name", label: "Detail Announcement" },
  { key: "Announcement_category", label: "Kategori" },
  { key: "Announcement_message", label: "Kategori" },
]);

const dataError = ref([]);

const validateForm = () => {
  dataError.value = [];

  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key]) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  return dataError.value.length === 0;
};

const submitData = async () => {
  const isValid = validateForm();

  if (!isValid) {
    return;
  }
  const result = await Swal.fire({
    title: "Edit Data?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Edit!",
    cancelButtonText: "Batal",
  });

  if (result.isConfirmed) {
    try {
      showLoading();

      const fixData = { ...savedData.value };

      const date = await getDateToday("yyyy-MM-dd");
      fixData.Announcement_updated.push({
        Announcement_updated_name: indexStore.user.userName,
        Announcement_updated_tanggal: date,
      });

      fixData.Announcement_list = dataPelanggan.value
        .filter((x) => x.isChecked === true)
        .map((x) => ({
          Announcement_list_name: x.data_pelanggan_nama,
          Announcement_list_paket: x.data_pelanggan_paket.data_pelanggan_paket_nama,
          Announcement_list_harga: x.data_pelanggan_paket.data_pelanggan_paket_harga,
          Announcement_list_phone: x.data_pelanggan_phone,
        }));

      fixData.Announcement_category = fixData.Announcement_category.label;

      // console.log(fixData);

      await announcement_UpdateAnnouncementById(fixData, route.params.id);

      await successEdit().then(() => {
        router.push("/modules/pelayanan/announcement");
      });
    } catch (error) {
      await failedCreate(error);
    }
  }
};

const cancelAdd = async () => {
  const result = await Swal.fire({
    title: "Batalkan?",
    text: "anda yakin membatalkan edit data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await router.push("/modules/pelayanan/announcement");
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
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Tiket
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Kode Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Announcement_id"
                />
              </div>
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kategori
                </label>
                <SelectGroup
                  disabled
                  placeholder="Kategori"
                  :options="options"
                  v-model="savedData.Announcement_category"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Dibuat
                </label>
                <input
                  disabled
                  type="date"
                  placeholder="Kode Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Announcement_created"
                />
              </div>
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Dibuat Oleh
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Detail Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  :value="
                    savedData.Announcement_updated.length > 0
                      ? savedData.Announcement_updated[0].Announcement_updated_name
                      : ''
                  "
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Detail Announcement
                </label>
                <input
                  type="text"
                  placeholder="Detail Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Announcement_name"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Pesan
                </label>

                <textarea
                  rows="3"
                  placeholder="Masukan Catatan disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Announcement_message"
                ></textarea>
              </div>
            </div>
          </div>
        </DefaultCard>
      </div>

      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan List Penerima">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="max-w-full overflow-x-auto">
              <table class="w-full table-auto">
                <thead>
                  <tr class="bg-gray-2 text-left dark:bg-meta-4">
                    <th
                      v-for="data in dataHeader"
                      :class="data.class"
                      class="font-medium text-black dark:text-white text-center text-sm"
                    >
                      {{ data.name }}
                    </th>
                    <th
                      class="py-2 px-4 font-medium text-black dark:text-white text-center"
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in dataPelanggan" :key="index" class="border">
                    <td class="pl-3 py-1.5 text-xs border align-top">
                      {{ index + 1 }}
                    </td>
                    <td class="py-1.5 px-1 border align-top">
                      <p class="text-black dark:text-white text-xs text-center">
                        {{ item.data_pelanggan_id }}
                      </p>
                    </td>
                    <td class="py-1 px-1 text-center border align-top">
                      <h5
                        class="font-medium text-black text-xs dark:text-white text-left"
                      >
                        {{ item.data_pelanggan_nama }}
                      </h5>
                    </td>
                    <td class="py-1.5 px-2 border align-top text-center">
                      <h5 class="font-medium text-black text-xs dark:text-white">
                        <input type="checkbox" v-model="item.isChecked" />
                      </h5>
                    </td>
                  </tr>
                </tbody>
              </table>
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
          <div class="pb-6 px-4 grid grid-cols-3 gap-2">
            <button
              @click="cancelAdd"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batalkan
            </button>
            <button
              @click="getData"
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
      </div>
    </div>
  </DefaultLayout>
</template>
