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
  Tr_teknis_user_updated: "",
  Tr_teknis_keterangan: "",

  Tr_teknis_evident_progress: null,
  Tr_teknis_evident_redaman_odp_depan: null,
  Tr_teknis_evident_redaman_odp_dalam: null,
  Tr_teknis_evident_redaman_ont_depan: null,
  Tr_teknis_evident_redaman_ont_belakang: null,
  Tr_teknis_evident_adaptor: null,
  Tr_teknis_evident_speed_test: null,
  Tr_teknis_evident_pelanggan_dengan_pelanggan: null,
  Tr_teknis_evident_pelanggan_depan_rumah: null,
  Tr_teknis_evident_marking_dc_start: null,
  Tr_teknis_evident_marking_dc_end: null,
  Tr_teknis_evident_review_google: null,
  Tr_teknis_evident_material_terpakai: null,

  Tr_teknis_status: "Y",
  Tr_teknis_domain: domain,
  Tr_teknis_tanggal: "",
  Tr_teknis_created: "",
})

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
          <div class="flex flex-col gap-5.5 p-6.5">
            <div>
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

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Nama Pelanggan
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
        <DefaultCard cardTitle="Input Material Terpakai">
          <div class="p-6.5">
            <div class="flex flex-col gap-2 xl:flex-row" 
             v-for="(data, index) in savedData.Tr_teknis_material_terpakai"
             v-if="savedData && savedData.Tr_teknis_material_terpakai"
             :class="index === 0 ? '' : 'pt-2'"> 
              <div class="w-8/12">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white" v-if="index === 0">
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
              <div class="w-4/12">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white" v-if="index === 0">
                  Qty.
                </label>
                <input
                disabled
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="data.qty"
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
