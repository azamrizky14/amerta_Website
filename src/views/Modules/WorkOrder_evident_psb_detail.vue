<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import multiselectReadOnly from "@/components/Forms/SelectGroup/multiselectReadOnly.vue";
import imageWithPreview from "@/components/Forms/SelectGroup/imageWithPreview.vue";

import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { adminTeknis_GetDataEvidentById } from "@/stores/functionAPI";

const route = useRoute();

const imageUrl = "images/admin_logistik";
const pageTitle = "Evident - Detail PSB";
const pageList = ["Work Order", "Evident", "PSB", "Detail"];

const savedData = ref({
  Tr_teknis_pelanggan_id: "",
  Tr_teknis_pelanggan_nama: "",
  Tr_teknis_pelanggan_server: "",
  Tr_teknis_user_updated: "",
  Tr_teknis_keterangan: "",
  Tr_teknis_logistik_id: "",
  Tr_teknis_jenis: "",
  Tr_teknis_trouble: "",
  Tr_teknis_action: "",
  Tr_teknis_team: [],

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

onMounted(async () => {
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
  console.log(savedData);
  Object.assign(savedData.value, data);
});
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
                <multiselectReadOnly
                  disabled
                  :options="savedData.Tr_teknis_team"
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
                  disabled
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
                  disabled
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
                disabled
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

        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Detail Material Terpakai">
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
        <DefaultCard cardTitle="Detail Gambar">
          <div class="grid grid-cols-2">
            <div class="flex border flex-col items-center p-2 justify-end relative">
              <imageWithPreview
                :url="imageUrl"
                disabled
                label="Evident Progress"
                v-if="savedData.Tr_teknis_work_order_images"
                v-model="savedData.Tr_teknis_work_order_images.Tr_teknis_evident_progress"
              />
            </div>

            <div class="flex border flex-col items-center p-2 justify-end relative">
              <imageWithPreview
                :url="imageUrl"
                disabled
                label="Evident SpeedTest"
                v-if="savedData.Tr_teknis_work_order_images"
                v-model="
                  savedData.Tr_teknis_work_order_images.Tr_teknis_evident_speed_test
                "
              />
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  label="Review Google"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_review_google
                  "
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  label="Kertas Form PSB"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_kertas_psb
                  "
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Redaman
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  label="ODP"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_redaman_odp
                  "
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  label="ONT"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_redaman_ont
                  "
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident ONT
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  label="ONT (Tampak Depan)"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_ont_depan
                  "
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  label="ONT (Tampak Belakang)"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_ont_belakang
                  "
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident ODP
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  label="ODP (Tampak Depan)"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_odp_depan
                  "
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  label="PORT (Tampak Dalam)"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images.Tr_teknis_evident_odp_dalam
                  "
                />
              </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">
                Evident Customer
              </p>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  label="Dengan Pelanggan"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images
                      .Tr_teknis_evident_pelanggan_dengan_pelanggan
                  "
                />
              </div>

              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  label="Depan Rumah Pelanggan"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images
                      .Tr_teknis_evident_pelanggan_depan_rumah
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
                  disabled
                  label="Start"
                  v-if="savedData.Tr_teknis_work_order_images"
                  v-model="
                    savedData.Tr_teknis_work_order_images
                      .Tr_teknis_evident_marking_dc_start
                  "
                />
              </div>
              <div class="flex border flex-col items-center p-2 justify-end relative">
                <imageWithPreview
                  :url="imageUrl"
                  disabled
                  v-if="savedData.Tr_teknis_work_order_images"
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
          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <router-link
              to="/modules/work-order/evident/psb"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90 col-span-2"
            >
              Kembali
            </router-link>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
    </div>
    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
