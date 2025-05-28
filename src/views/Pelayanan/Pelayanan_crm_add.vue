<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import vSelect from "vue-select";
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";

import { useIndexStore } from "@/stores";
import { crm_CreateCrm, crm_GetPrefixByDate } from "@/stores/functionAPI";
import { ref, onMounted } from "vue";
import router from "@/router";
import Swal from "sweetalert2";
import { getDateToday, formatDate } from "@/stores/date";
import { showLoading, successCreate, failedCreate, confirmDelete } from "@/stores/swal";

const indexStore = useIndexStore();
const pageTitle = ref("CRM - Tambah");
const pageList = ref(["Pelayanan", "CRM", "Tambah"]);

const savedData = ref({
  Tr_crm_id: "",
  Tr_crm_id: "",
  Tr_crm_updated: [],
  Tr_crm_status: "Y",
  CompanyName: indexStore.user.companyName,
  CompanyCode: indexStore.user.companyCode,

  Tr_crm_detail: {
    Tr_crm_detail_pelanggan: {},
    Tr_crm_detail_response: "",
    Tr_crm_detail_tanggal: "",
    Tr_crm_detail_type_pelanggan: "",
    Tr_crm_detail_feedback: "",
  },
  Tr_crm_nama: "",
  Tr_crm_kategori: "",
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

const options = [
  { label: "Follow Up Pembayaran", value: "Follow Up Pembayaran" },
  { label: "Follow Up PSB", value: "Follow Up PSB" },
  { label: "Follow Up Pelanggan", value: "Follow Up Pelanggan" },
];

onMounted(async () => {
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.Tr_crm_created = date;
  savedData.value.Tr_crm_updated.push({
    Tr_crm_updated_nama: indexStore.user.userName,
    Tr_crm_updated_tanggal: date,
  });
});

const dataValidator = ref([
  { key: "Tr_crm_nama", label: "Detail CRM" },
  { key: "Tr_crm_kategori", label: "Kategori CRM" },
]);

const dataError = ref([]);

const validateForm = () => {
  dataError.value = [];

  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key]) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  if (Object.keys(savedData.value.Tr_crm_detail.Tr_crm_detail_pelanggan).length === 0) {
    dataError.value.push(`Data Pelanggan tidak boleh kosong!`);
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

      fixData.Tr_crm_kategori = fixData.Tr_crm_kategori.value;
      if (Object.keys(fixData.Tr_crm_detail.Tr_crm_detail_pelanggan).length > 0) {
        fixData.Tr_crm_detail.Tr_crm_detail_id =
          fixData.Tr_crm_detail.Tr_crm_detail_pelanggan.data_pelanggan_id;
        fixData.Tr_crm_detail.Tr_crm_detail_nama =
          fixData.Tr_crm_detail.Tr_crm_detail_pelanggan.data_pelanggan_nama;
        fixData.Tr_crm_detail.Tr_crm_detail_type_pelanggan =
          fixData.Tr_crm_detail.Tr_crm_detail_pelanggan.data_pelanggan_status;
        delete fixData.Tr_crm_detail.Tr_crm_detail_pelanggan;
      }

      const prefixDate = await formatDate(fixData.Tr_crm_created, "yy-MM");
      const prefix = await crm_GetPrefixByDate("CRM", prefixDate);
      if (prefix) {
        fixData.Tr_crm_id = prefix.nextId;
      } else {
        return await failedCreate("Kode Prefix Error!");
      }
      console.log(fixData);

      await crm_CreateCrm(fixData);

      await successCreate().then(() => {
        router.push("/modules/pelayanan/crm");
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
    await router.push("/modules/pelayanan/crm");
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
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Data Pelanggan
                </label>

                <v-select
                  :clearable="false"
                  v-model="savedData.Tr_crm_detail.Tr_crm_detail_pelanggan"
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
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Kategori
                </label>
                <SelectGroup
                  placeholder="Kategori"
                  :options="options"
                  v-model="savedData.Tr_crm_kategori"
                />
              </div>
              <div class="w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Respons
                </label>
                <input
                  type="date"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_crm_detail.Tr_crm_detail_tanggal"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *Detail CRM
                </label>
                <input
                  type="text"
                  placeholder="Detail CRM"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_crm_nama"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
      </div>

      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Masukan Detail CRM">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Respons
                </label>

                <textarea
                  rows="2"
                  placeholder="Masukan Respons disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_crm_detail.Tr_crm_detail_response"
                ></textarea>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="xl:pt-2.5">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Feedback
                </label>

                <textarea
                  rows="2"
                  placeholder="Masukan Feedback disini!"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_crm_detail.Tr_crm_detail_feedback"
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
