<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import imageWithPreview from "@/components/Forms/SelectGroup/imageWithPreview.vue";
import Swal from "sweetalert2";
import multiselectOptionEdit from "@/components/Forms/SelectGroup/multiselectOptionEdit.vue";

import { useIndexStore } from "@/stores";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";
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
const optionsTeknisi = ref([]);
const imageUrl = "images/admin_logistik";
const pageTitle = ref("Evident - Edit MT");
const pageList = ref(["Work Order", "Evident", "MT", "Edit"]);

const savedData = ref({
  Tr_teknis_pelanggan_id: "",
  Tr_teknis_pelanggan_nama: "",
  Tr_teknis_pelanggan_server: "",
  Tr_teknis_user_updated: "",
  Tr_teknis_keterangan: "",
  Tr_teknis_logistik_id: "",
  Tr_teknis_jenis: "MT",
  Tr_teknis_trouble: "",
  Tr_teknis_action: "",
  Tr_teknis_team: [],
  Tr_teknis_work_order_images: {},
  Tr_teknis_work_order_terpakai_material: [],
});

const loading = ref(true);
const dataError = ref([]);

onMounted(async () => {
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
      console.log(optionsTeknisi.value);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
});

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
  savedData.value = data;
};

const validateForm = () => {
  dataError.value = [];
  const validators = [
    { key: "Tr_teknis_logistik_id", label: "Kode Bon Material" },
    { key: "Tr_teknis_pelanggan_id", label: "Id Pelanggan" },
    { key: "Tr_teknis_pelanggan_server", label: "Server" },
    { key: "Tr_teknis_pelanggan_nama", label: "Nama Pelanggan" },
  ];

  validators.forEach((validator) => {
    if (!savedData.value[validator.key]) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

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
    await router.push("/modules/work-order/evident/mt");
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
  if (!validateForm()) return;

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
      fixData.Tr_teknis_work_order_terpakai_material = JSON.stringify(
        fixData.Tr_teknis_work_order_terpakai_material
      );

      Object.keys(fixData.Tr_teknis_work_order_images).forEach((key) => {
        if (fixData.Tr_teknis_work_order_images[key] === null) {
          fixData.Tr_teknis_work_order_images[key] = "";
        }
      });

      const sendData = new FormData();

      Object.keys(fixData).forEach((key) => {
        if (key === "Tr_teknis_work_order_images") {
          Object.keys(fixData.Tr_teknis_work_order_images).forEach((image) => {
            sendData.append(image, fixData.Tr_teknis_work_order_images[image]);
          });
        } else {
          sendData.append(key, fixData[key]);
        }
      });

      await adminTeknis_UpdateDataImage(
        sendData,
        route.params.id,
        fixData.Tr_teknis_logistik_id
      );

      await successCreate().then(() => {
        router.push("/modules/work-order/evident/mt");
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
            <div class="flex flex-col gap-6">
              <div>
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
                Masalah (Trouble)
              </label>
              <textarea
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_trouble"
              ></textarea>
            </div>
            <div>
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
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->

        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Edit Material Terpakai">
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
          <div class="grid grid-cols-2">
            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Sebelum
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="Redaman Sebelum"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_redaman_sebelum
                  "
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="Modem Sebelum"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_modem_sebelum
                  "
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="Kendala 1"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_kendala_1
                  "
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="Kendala 2"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_kendala_2
                  "
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-1">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Progres
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="Splicer - Proses Sambung"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_proses_sambung
                  "
                />
              </div>
            </div>

            <div class="col-span-2 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-3">
                Evident Sesudah
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="Redaman Sesudah"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_redaman_sesudah
                  "
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="Modem Sesudah"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_modem_sesudah
                  "
                />
              </div>
            </div>

            <div class="col-span-2 grid grid-cols-2">
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="Redaman Out ODP"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_redaman_out_odp
                  "
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="Redaman Pelanggan"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_redaman_pelanggan
                  "
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Marking Kabel
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="Start"
                  v-model="
                    savedData.Tr_teknis_work_order_images
                      .Tr_teknis_evident_marking_dc_start
                  "
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  v-if="savedData.Tr_teknis_work_order_images"
                  label="End"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_marking_dc_end
                  "
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
