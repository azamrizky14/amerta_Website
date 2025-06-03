<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import vSelect from "vue-select";
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";

import { useIndexStore } from "@/stores";
import { tc_CreateTask, tc_GetPrefixByDate } from "@/stores/functionAPI";
import { ref, onMounted } from "vue";
import router from "@/router";
import Swal from "sweetalert2";
import { getDateToday, formatDate } from "@/stores/date";
import { showLoading, successCreate, failedCreate, confirmDelete } from "@/stores/swal";

const indexStore = useIndexStore();
const pageTitle = ref("Ticket Gamas - Tambah");
const pageList = ref(["Work Order", "Ticket Gamas", "Tambah"]);

const savedData = ref({
  Tr_ticket_id: "",
  Tr_ticket_created: "",
  CompanyName: indexStore.user.companyName,
  CompanyCode: indexStore.user.companyCode,

  Tr_ticket_keterangan: "",
  Tr_ticket_data_pelanggan: {
    Tr_ticket_data_pelanggan_id: "-",
    Tr_ticket_data_pelanggan_nama: "",
    Tr_ticket_data_pelanggan_paket_nama: "-",
    Tr_ticket_data_pelanggan_paket_bayar: "-",
    Tr_ticket_data_pelanggan_afiliasi: "-",
  },
  Tr_ticket_alamat: {
    Tr_ticket_titik_koordinat: "",
  },
  Tr_ticket_kategori: { label: "Gamas", value: "MT" },
  Tr_ticket_completition_history: [],
  Tr_ticket_updated: [],
  Tr_ticket_status: "Y",
});

onMounted(async () => {
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.Tr_ticket_created = date;
  savedData.value.Tr_ticket_updated.push({
    Tr_ticket_updated_nama: indexStore.user.userName,
    Tr_ticket_updated_tanggal: date,
  });
});

const dataValidator = ref([{ key: "Tr_ticket_name", label: "Detail Tiket" }]);

const dataError = ref([]);

const validateForm = () => {
  dataError.value = [];

  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key]) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  if (savedData.value.Tr_ticket_data_pelanggan.Tr_ticket_data_pelanggan_nama === "") {
    dataError.value.push(`ODP-PON-SERVER tidak boleh kosong!`);
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

      const dateForPrefix = await formatDate(fixData.Tr_ticket_created, "yy-MM-dd");
      const prefix = await tc_GetPrefixByDate(
        fixData.Tr_ticket_kategori.value,
        dateForPrefix
      );

      fixData.Tr_ticket_kategori = fixData.Tr_ticket_kategori.label;
      if (prefix) {
        fixData.Tr_ticket_id = prefix.nextId;
      } else {
        return await failedCreate("Kode Prefix Error!");
      }
      // console.log(fixData);

      await tc_CreateTask(fixData);

      await successCreate().then(() => {
        router.push("/modules/work-order/koordinator/ticket-gamas");
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
    await router.push("/modules/work-order/koordinator/ticket-gamas");
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
                  *Detail Tiket
                </label>
                <input
                  type="text"
                  placeholder="Detail Tiket"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.Tr_ticket_name"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  *ODP-PON-SERVER
                </label>

                <input
                  type="text"
                  placeholder="ODP-PON-SERVER"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="
                    savedData.Tr_ticket_data_pelanggan.Tr_ticket_data_pelanggan_nama
                  "
                />
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
              <div class="">
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
