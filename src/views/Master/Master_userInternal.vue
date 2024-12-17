<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { getAllUsers } from '@/stores/functionAPI'
import { mdiTrashCanOutline, mdiEyeOutline, mdiSquareEditOutline, mdiMagnify, mdiRefresh, mdiPlusCircleOutline } from '@mdi/js';

const pageTitle = ref('Master - User Internal')
const pageList = ref (['Master', 'User Internal'])
const dataHeader = ref([
  {name: 'No.', class: 'py-2 pl-3'},
  {name: 'Nama User', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Role', class: 'min-w-[150px] py-2 px-4'},
  {name: 'Gender', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Email', class: 'min-w-[100px] py-2 px-4'},
  {name: 'No Telp', class: 'min-w-[100px] py-2 px-4'},
])
let dataTable = ref([])


onMounted( async () => {
  const data = await getAllUsers()
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
              <router-link to="/modules/master/user-internal/add" class="px-1">
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
          <th v-for="data in dataHeader" :class="data.class" class="font-medium text-black dark:text-white text-center">
          {{ data.name }}
          </th>
          <th class="py-2 px-4 font-medium text-black dark:text-white text-center">
            Opsi
          </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in dataTable" :key="index" class="border">
            <td class="pl-3 text-xs border">
              {{ index+1 }}
            </td>
            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs ">{{ item.userName }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs ">{{ item.userRole }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white text-center">{{ item.userGender }}</p>
            </td>
            <td class="py-1 px-4 border">
              <h5 class="font-medium text-black text-xs dark:text-white">{{ item.email }}</h5>
              <!-- <p class="text-xs">{{ item.picId }}</p> -->
            </td>
            <td class="py-1 px-4 text-center border">
              <h5 class="font-medium text-black text-xs dark:text-white text-left">{{ item.userPhone }}</h5>
              <!-- <p class="text-xs">{{ item.picId }}</p> -->
            </td>
            <td class="py-1 px-4">
              <div class="flex items-center space-x-3.5 d-flex justify-center">              
                
                <router-link :class="item.Tr_teknis_status === 'closed' ? 'cursor-default opacity-50' : 'hover:text-primary'" class="" :to="'/modules/master/user-internal/detail/'+item._id">
                <svg
                  class="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiEyeOutline" fill="#"/>
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
                <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiSquareEditOutline" fill="#"/>
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
                <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiTrashCanOutline" fill="#"/>
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
