<script setup lang="ts">
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultCard from '@/components/Forms/DefaultCard.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import imageWithPreview from '@/components/Forms/SelectGroup/imageWithPreview.vue'
import { domain } from "@/API/";
import { useRoute } from 'vue-router';
import { adminTeknis_GetDataById } from '@/stores/functionAPI'

import { ref, onMounted } from 'vue'
import router from '@/router';

const route = useRoute();
const pageTitle = ref('Evident - Detail PSB')
const pageList = ref (['Work Order', 'Evident', 'PSB', 'Detail'])
const oldData = ref([])



// Saved Data
const savedData = ref({
  Tr_teknis_pelanggan_id: "",
  Tr_teknis_pelanggan_nama: "",
  Tr_teknis_pelanggan_server: "",
  Tr_teknis_user_updated: "",
  Tr_teknis_keterangan: "",

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

  Tr_teknis_status: "Y",
  Tr_teknis_domain: domain,
  Tr_teknis_tanggal: "",
  Tr_teknis_created: "",
  Tr_teknis_jenis: "PSB",
  Tr_teknis_material_terpakai: [
    { label: "PS Besar", qtyKeluar: "", qtyKembali: "" },
    { label: "DC", qtyKeluar: "", qtyKembali: "" },
    { label: "ONT", snNumber: "" },
    { label: "Pigtail", qtyKeluar: "", qtyKembali: "" },
    { label: "Adaptor (12V)", qtyKeluar: "", qtyKembali: "" },
    { label: "Konektor PAZ", qtyKeluar: "", qtyKembali: "" },
    { label: "SPL 1:8", qtyKeluar: "", qtyKembali: "" },
    { label: "SPL 1:4", qtyKeluar: "", qtyKembali: "" },
  ],
});

onMounted ( async () => {
  const data = await adminTeknis_GetDataById(route.params.id)
  oldData.value = data
  savedData.value = data

})

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
        <DefaultCard cardTitle="List Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="lg:w-2/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Pelanggan
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
                PIC
              </label>
              <input
                disabled
                type="text"
                placeholder="Person in charge"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.Tr_teknis_user_updated"
              />
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Keterangan
              </label>
              <textarea
                disabled
                rows="6"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->

        <!-- Input Fields Start -->
        <DefaultCard cardTitle="List Material Terpakai" class="hidden">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in savedData.Tr_teknis_material_terpakai"
              v-if="savedData && savedData.Tr_teknis_material_terpakai"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <div class="w-6/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Nama Barang
                </label>
                <!-- <input
                  disabled
                  type="text"
                  placeholder="Nama Barang"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.label"
                /> -->
                <div class="w-full text-black py-3 px-5 font-normal dark:text-white flex justify-between">
                <span>{{ data.label }}</span>
                <span>:</span>
                </div>
              </div>
              <div class="w-3/12" v-if="data.qtyKeluar || data.qtyKeluar === '' || data.qtyKeluar === 0">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Qty. Keluar
                </label>
                <input
                  disabled
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qtyKeluar"
                />
              </div>
              <div class="w-3/12" v-if="data.qtyKembali || data.qtyKembali === '' || data.qtyKembali === 0">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0"
                >
                  Qty. Kembali
                </label>
                <input
                  disabled
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qtyKembali"
                />
              </div>
              <div class="w-6/12" v-else>
                <!-- <label class="mb-3 block text-sm font-medium text-black dark:text-white" v-if="index === 0">
                  SN
                </label> -->
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
        <DefaultCard cardTitle="List Images">
          <div class="grid grid-cols-2" v-if="savedData && savedData.Tr_teknis_images">
            <div class="flex border flex-col items-center p-2 justify-end">
              <imageWithPreview disabled label="Evident Progress" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_progress" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_progress = file" />
            </div>
            <div class="flex border flex-col items-center p-2 justify-end">              
              <imageWithPreview disabled label="Evident SpeedTest" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_speed_test" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_speed_test = file" />
            </div>
            
            <div class="col-span-3 grid grid-cols-2">
            <div class="flex border flex-col items-center p-2 justify-end"> 
              <imageWithPreview disabled label="Review Google" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_review_google" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_review_google = file" />
            </div>
            <div class="flex border flex-col items-center p-2 justify-end"> 
              <imageWithPreview disabled label="Kertas Form PSB" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_kertas_psb" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_kertas_psb = file" />
            </div>
            </div>

            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">Evident Redaman</p>
            <div class="flex border flex-col items-center p-2 justify-end"> 
              <imageWithPreview disabled label="ODP" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_redaman_odp" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_redaman_odp = file" />
            </div>
            <div class="flex border flex-col items-center p-2 justify-end"> 
              <imageWithPreview disabled label="ONT" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_redaman_ont" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_redaman_ont = file" />
            </div>
            </div>
            
            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">Evident ODP</p>
            <div class="flex border flex-col items-center p-2 justify-end"> 
              <imageWithPreview disabled label="ODP (Tampak Depan)" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_odp_depan" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_odp_depan = file" />
            </div>
            <div class="flex border flex-col items-center p-2 justify-end"> 
              <imageWithPreview disabled label="PORT (Tampak Dalam)" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_odp_dalam" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_odp_dalam = file" />
            </div>
            </div>
            
            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">Evident Customer</p>
            <div class="flex border flex-col items-center p-2 justify-end"> 
              <imageWithPreview disabled label="Dengan Pelanggan" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_pelanggan_dengan_pelanggan" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_pelanggan_dengan_pelanggan = file" />
            </div>
            <div class="flex border flex-col items-center p-2 justify-end"> 
              <imageWithPreview disabled label="Depan Rumah Pelanggan" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_pelanggan_depan_rumah" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_pelanggan_depan_rumah = file" />
            </div>
            </div>
            
            <div class="col-span-3 grid grid-cols-2">
              <p class="text-black dark:text-white text-center p-2 col-span-2">Evident Marking Kabel</p>
            <div class="flex border flex-col items-center p-2 justify-end"> 
              <imageWithPreview disabled label="Start" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_marking_dc_start" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_marking_dc_start = file" />
            </div>
            <div class="flex border flex-col items-center p-2 justify-end"> 
              <imageWithPreview disabled label="End" v-model="savedData.Tr_teknis_images.Tr_teknis_evident_marking_dc_end" 
                @update:file="file => savedData.Tr_teknis_images.Tr_teknis_evident_marking_dc_end = file" />
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
            
            <router-link to="/modules/work-order/evident/psb"
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
