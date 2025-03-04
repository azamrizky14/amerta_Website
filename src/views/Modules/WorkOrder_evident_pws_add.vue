<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import inputImageWithPreview from "@/components/Forms/SelectGroup/inputImageWithPreview.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import multiselectOption from "@/components/Forms/SelectGroup/multiselectOption.vue";

import { useIndexStore } from "@/stores";
import {
  adminTeknis_CreateDataEvidentWithImages,
  adminTeknis_GetDataByDomainAndDeletedAndTypeAndStatus,
  getUserInternalByRole,
} from "@/stores/functionAPI";
import { ref, onMounted } from "vue";
import router from "@/router";
import Swal from "sweetalert2";
import { getDateToday } from "@/stores/date";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";

const indexStore = useIndexStore();
const pageTitle = ref("Evident - Tambah PWS");
const pageList = ref(["Work Order", "Evident", "PWS", "Tambah"]);

const savedData = ref({
  Tr_teknis_pelanggan_id: "",
  Tr_teknis_pelanggan_nama: "",
  Tr_teknis_pelanggan_server: "",
  Tr_teknis_user_updated: "",
  Tr_teknis_keterangan: "",
  Tr_teknis_logistik_id: "",
  Tr_teknis_jenis: "PWS",
  Tr_teknis_kategori: "",
  Tr_teknis_trouble: "",
  Tr_teknis_action: "",
  Tr_teknis_team: [],

  Tr_teknis_evident_progress: null,
  Tr_teknis_evident_speed_test: null,
  Tr_teknis_evident_review_google: null,
  Tr_teknis_evident_kertas_psb: null,
  Tr_teknis_evident_redaman_odp: null,
  Tr_teknis_evident_redaman_ont: null,
  Tr_teknis_evident_odp_depan: null,
  Tr_teknis_evident_odp_dalam: null,
  Tr_teknis_evident_ont_depan: null,
  Tr_teknis_evident_ont_belakang: null,
  Tr_teknis_evident_pelanggan_dengan_pelanggan: null,
  Tr_teknis_evident_pelanggan_depan_rumah: null,

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
const optionsTeknisi = ref([]);

const options = [
  { label: "PSB", value: "PSB" },
  { label: "MT", value: "MT" },
];

onMounted(async () => {
  const data = await getUserInternalByRole(
    indexStore.user.companyName
    // "Teknisi " + savedData.value.Tr_teknis_jenis
  );
  optionsTeknisi.value = data.map((x, i) => ({
    id: i,
    name: x.userName,
    role: x.userRole,
  }));

  const options = await adminTeknis_GetDataByDomainAndDeletedAndTypeAndStatus(
    "N",
    "PWS",
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

const handleOptionChange = async (selected) => {
  console.log("material data", materialData);
  console.log("logistik data", logistikData);
  materialData.value.splice(0, materialData.value.length);
  if (selected.Tr_teknis_work_order_tersedia) {
    savedData.value.Tr_teknis_logistik_id = selected.Tr_teknis_logistik_id;
    selected.Tr_teknis_work_order_tersedia.forEach((data) => {
      materialData.value.push({ label: data.label, qtySisa: data.qty, qty: "" });
    });

    if (
      selected.Tr_teknis_work_order_terpakai &&
      selected.Tr_teknis_work_order_terpakai.length > 0
    ) {
      const mergedMaterials = selected.Tr_teknis_work_order_terpakai.flatMap(
        (item) => item.Tr_teknis_work_order_terpakai_material || []
      );

      mergedMaterials.forEach((material) => {
        const existingItem = materialData.value.find(
          (item) => item.label === material.label
        );
        if (existingItem) {
          existingItem.qtySisa -= material.qty;
          if (existingItem.qtySisa < 0) existingItem.qtySisa = 0;
        }
      });
    }
  }
};

const dataValidator = ref([
  { key: "logistikData", label: "Kode Bon Material" },
  { key: "Tr_teknis_kategori", label: "Kategori Evident" },
  { key: "Tr_teknis_pelanggan_id", label: "Id Pelanggan" },
  { key: "Tr_teknis_pelanggan_server", label: "Server" },
  { key: "Tr_teknis_pelanggan_nama", label: "Nama Pelanggan" },
]);

const dataError = ref([]);

const validateForm = () => {
  dataError.value = [];

  dataValidator.value.forEach((validator) => {
    if (
      (validator.key === "logistikData" && !logistikData.value) ||
      (!savedData.value[validator.key] && validator.key !== "logistikData")
    ) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  if (savedData.value.Tr_teknis_kategori.label === "MT") {
    validatorMT.forEach((validator) => {
      if (
        (validator.key === "logistikData" && !logistikData.value) ||
        (!savedData.value[validator.key] && validator.key !== "logistikData")
      ) {
        dataError.value.push(`${validator.label} tidak boleh kosong!`);
      }
    });
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

      if (materialData.value && materialData.value.length > 0) {
        const cleanedArray = materialData.value.filter((item) =>
          Object.values(item).some((value) => value !== "")
        );
        fixData.Tr_teknis_work_order_terpakai_material = cleanedArray.sort((a, b) => {
          const aHasONT = a.label.toLowerCase().includes("ont");
          const bHasONT = b.label.toLowerCase().includes("ont");

          if (aHasONT && !bHasONT) return 1;
          if (!aHasONT && bHasONT) return -1;
          return 0;
        });
        fixData.Tr_teknis_work_order_terpakai_material = fixData.Tr_teknis_work_order_terpakai_material.map(
          (x) => {
            if (x.label.toLowerCase().includes("ont") && x.snNumber) {
              return {
                qtySisa: x.qtySisa - 1,
                label: x.label,
                qty: 1,
                snNumber: x.snNumber,
              };
            } else if (x.label.toLowerCase().includes("ont") && !x.snNumber) {
              return { qtySisa: x.qtySisa, label: x.label, qty: 0 };
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

      fixData.Tr_teknis_kategori = fixData.Tr_teknis_kategori.label;
      fixData.Tr_teknis_team = JSON.stringify(fixData.Tr_teknis_team.map((x) => x.name));

      const sendData = new FormData();

      Object.keys(fixData).forEach((key) => {
        if (Array.isArray(fixData[key])) {
          sendData.append(key, JSON.stringify(fixData[key]));
        } else {
          sendData.append(key, fixData[key]);
        }
      });

      await adminTeknis_CreateDataEvidentWithImages(sendData);

      await successCreate().then(() => {
        router.push("/modules/work-order/evident/pws");
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
    await router.push("/modules/work-order/evident/pws");
  }
};
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />

    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Masukan Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="w-2/3">
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
              <div class="w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kategori
                </label>
                <SelectGroup
                  placeholder="Pilih Kategori"
                  :options="options"
                  v-model="savedData.Tr_teknis_kategori"
                />
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Teknisi
              </label>
              <multiselectOption
                :options="optionsTeknisi"
                v-model="savedData.Tr_teknis_team"
                placeholder="Pilih Teknisi..."
              />
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

            <div v-if="savedData.Tr_teknis_kategori.label === 'MT'">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Masalah (Trouble)
              </label>
              <textarea
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_trouble"
              ></textarea>
            </div>
            <div v-if="savedData.Tr_teknis_kategori.label === 'MT'">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Solusi (Action)
              </label>
              <textarea
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_action"
              ></textarea>
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
              <textarea
                v-if="logistikData && logistikData.Tr_teknis_keterangan"
                disabled
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="logistikData.Tr_teknis_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>

        <DefaultCard cardTitle="Input Material Terpakai" v-if="logistikData">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in materialData"
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
      </div>

      <div class="flex flex-col gap-9">
        <DefaultCard cardTitle="Masukan Gambar">
          <div
            class="grid grid-cols-2"
            v-if="
              savedData.Tr_teknis_kategori && savedData.Tr_teknis_kategori.value === 'PSB'
            "
          >
            <div class="flex border flex-col items-center p-2 justify-end relative">
              <inputImageWithPreview
                label="Evident Progress"
                v-model="savedData.Tr_teknis_evident_progress"
              />
            </div>

            <div class="flex border flex-col items-center p-2 justify-end relative">
              <inputImageWithPreview
                label="Evident SpeedTest"
                v-model="savedData.Tr_teknis_evident_speed_test"
              />
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Review Google"
                  v-model="savedData.Tr_teknis_evident_review_google"
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Kertas Form PSB"
                  v-model="savedData.Tr_teknis_evident_kertas_psb"
                />
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
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="ONT"
                  v-model="savedData.Tr_teknis_evident_redaman_ont"
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident ONT
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="ONT (Tampak Depan)"
                  v-model="savedData.Tr_teknis_evident_ont_depan"
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="ONT (Tampak Belakang)"
                  v-model="savedData.Tr_teknis_evident_ont_belakang"
                />
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
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="PORT (Tampak Dalam)"
                  v-model="savedData.Tr_teknis_evident_odp_dalam"
                />
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
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <inputImageWithPreview
                  label="Depan Rumah Pelanggan"
                  v-model="savedData.Tr_teknis_evident_pelanggan_depan_rumah"
                />
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
          <div
            class="grid grid-cols-2"
            v-else-if="
              savedData.Tr_teknis_kategori && savedData.Tr_teknis_kategori.value === 'MT'
            "
          >
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
