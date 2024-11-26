<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { adminTeknis_GetDataByDomainAndDeleted } from '@/stores/functionAPI'
import {  mdiEyeOutline, mdiSquareEditOutline, mdiMagnify, mdiRefresh, mdiPlusCircleOutline } from '@mdi/js';

const pageTitle = ref('Bon & Material')
const pageList = ref (['Work Order', 'Bon & Material'])
const dataHeader = ref([
  {name: 'No.', class: 'py-2 pl-3'},
  {name: 'Tgl. Dibuat', class: 'min-w-[100px] py-2 px-4'},
  {name: 'No. Logistik', class: 'min-w-[150px] py-2 px-4'},
  {name: 'Jenis', class: 'min-w-[50px] py-2 px-4'},
  {name: 'PIC', class: 'min-w-[200px] py-2 px-4 xl:pl-11'},
  {name: 'Teknisi', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Tas', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Status', class: 'min-w-[100px] py-2 px-4'},
])
let dataTable = ref([])


onMounted( async () => {
  const data = await adminTeknis_GetDataByDomainAndDeleted('N')
  dataTable.value = data
})
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <div class="flex flex-col gap-10">
    
  <div
    class="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5"
  >
          <div class="helper border-2 flex justify-between bg-gray-2 text-left dark:bg-meta-4  text-black dark:text-white py-2 px-4">
            <div class="left-data">
              <div class="relative">
            <button class="absolute top-1/2 left-0 -translate-y-1/2">
              <svg
                class="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  :d="mdiMagnify"
                  fill=""
                />
              </svg>
            </button>

            <input
              type="text"
              placeholder="Type to search..."
              class="w-full xl:w-125 bg-transparent pr-4 pl-9 focus:outline-none"
            />
          </div>
            </div>
            <div class="right-data flex items-center flex-row-reverse">
              <!-- Add Button -->
              <router-link to="/modules/work-order/bon-dan-material/add" class="px-1">
                <svg 
                class="fill-current hover:text-primary"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path :d="mdiPlusCircleOutline" fill=""/>
              </svg>
              
              <!-- Refresh Button -->
              </router-link>
              <button class="px-1">
                <svg 
                class="fill-current hover:text-primary"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                  <path :d="mdiRefresh" fill=""/>
                  </svg>
              </button>
            </div>
          </div>
    <div class="max-w-full overflow-x-auto">
      <table class="w-full table-auto">
        <thead>
          <tr class="bg-gray-2 text-left dark:bg-meta-4">
          <th v-for="data in dataHeader" :class="data.class" class="font-medium text-black dark:text-white text-center text-sm">
          {{ data.name }}
          </th>
          <th class="py-2 px-4 font-medium text-black dark:text-white text-center">
            Action
          </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in dataTable" :key="index" class="border">
            <td class="pl-3 text-xs border">
              {{ index+1 }}
            </td>
            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs text-center">{{ item.Tr_teknis_created }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs text-center">{{ item.Tr_teknis_logistik_id }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs text-center">{{ item.Tr_teknis_jenis }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white">{{ item.Tr_teknis_user_created }}</p>
            </td>
            <td class="py-1 px-4 border">
              <h5 class="font-medium text-black text-xs dark:text-white text-center">{{ item.Tr_teknis_team.length }}</h5>
              <!-- <p class="text-xs">{{ item.picId }}</p> -->
            </td>
            <td class="py-1 px-4 border">
              <h5 class="font-medium text-black text-xs dark:text-white">{{ item.Tr_teknis_item }}</h5>
              <!-- <p class="text-xs">{{ item.picId }}</p> -->
            </td>
            <td class="py-1 px-4 text-center border">
              <p
                class="inline-flex rounded-full bg-opacity-10 py-1 px-3 text-xs font-medium"
                :class="{
                  'bg-warning text-warning': item.Tr_teknis_status === 'pending',
                  'bg-danger text-danger': item.Tr_teknis_status === 'closed',
                  'bg-success text-success': item.Tr_teknis_status === 'open'
                }"
              >
                {{ item.Tr_teknis_status }}
              </p>
            </td>
            <td class="py-1 px-4">
              <div class="flex items-center space-x-3.5 d-flex justify-center">              
                <router-link class="hover:text-primary" :to="'/modules/work-order/bon-dan-material/detail/'+item._id">
                  <svg
                    class="fill-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      :d="mdiEyeOutline"  
                      fill=""
                    />
                  </svg>
                </router-link>

                <router-link :class="item.Tr_teknis_status === 'closed' ? 'cursor-default opacity-50' : 'hover:text-primary'" class="" :to="item.Tr_teknis_status !== 'closed' ? '/modules/work-order/bon-dan-material/closing/'+item._id : ''">
                  <svg
                    class="fill-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                  <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiSquareEditOutline" fill=""/>
                  </svg>
                </router-link>

              </div>
            </td>
          </tr> 
        </tbody>
      </table>
    </div>
  </div>
    </div>
  </DefaultLayout>
</template>
