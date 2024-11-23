<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { adminTeknis_GetDataEvidentByType } from '@/stores/functionAPI'

const pageTitle = ref('Evident - PSB')
const pageList = ref (['Work Order', 'Evident', 'PSB'])
const dataHeader = ref([
  {name: 'No.', class: 'py-2 pl-3'},
  {name: 'Tgl. Dibuat', class: 'min-w-[100px] py-2 px-4'},
  {name: 'No. Logistik', class: 'min-w-[150px] py-2 px-4'},
  {name: 'Id. User', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Nama. User', class: 'min-w-[150px] py-2 px-4'},
  {name: 'Server', class: 'min-w-[75px] py-2 px-4'},
  {name: 'Admin Teknis', class: 'min-w-[150px] py-2 px-4'},
])
let dataTable = ref([])


onMounted( async () => {
  const data = await adminTeknis_GetDataEvidentByType('N', 'PSB')
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
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                  fill=""
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
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
              <router-link to="/modules/work-order/evident/psb/add" class="px-1">
              <svg 
                class="fill-current hover:text-primary"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                  <g id="Page-1" stroke="none" stroke-width="1" fill="" fill-rule="evenodd" sketch:type="MSPage">
                      <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-464.000000, -1087.000000)" fill="">
                          <path d="M480,1117 C472.268,1117 466,1110.73 466,1103 C466,1095.27 472.268,1089 480,1089 C487.732,1089 494,1095.27 494,1103 C494,1110.73 487.732,1117 480,1117 L480,1117 Z M480,1087 C471.163,1087 464,1094.16 464,1103 C464,1111.84 471.163,1119 480,1119 C488.837,1119 496,1111.84 496,1103 C496,1094.16 488.837,1087 480,1087 L480,1087 Z M486,1102 L481,1102 L481,1097 C481,1096.45 480.553,1096 480,1096 C479.447,1096 479,1096.45 479,1097 L479,1102 L474,1102 C473.447,1102 473,1102.45 473,1103 C473,1103.55 473.447,1104 474,1104 L479,1104 L479,1109 C479,1109.55 479.447,1110 480,1110 C480.553,1110 481,1109.55 481,1109 L481,1104 L486,1104 C486.553,1104 487,1103.55 487,1103 C487,1102.45 486.553,1102 486,1102 L486,1102 Z" id="plus-circle" sketch:type="MSShapeGroup">
                          </path>
                      </g>
                  </g>
              </svg>
              
              <!-- Refresh Button -->
              </router-link>
              <button class="px-1">
              <svg 
                class="fill-current hover:text-primary"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.52186 7H7C7.55229 7 8 7.44771 8 8C8 8.55228 7.55228 9 7 9H3C1.89543 9 1 8.10457 1 7V3C1 2.44771 1.44772 2 2 2C2.55228 2 3 2.44771 3 3V5.67541C4.1421 4.05017 5.70859 2.75709 7.53982 1.94481C9.78743 0.947842 12.3043 0.732653 14.6885 1.3336C17.0727 1.93454 19.1868 3.31697 20.6934 5.26017C21.9949 6.939 22.7781 8.95275 22.9594 11.0552C23.0068 11.6054 22.5477 12.0518 21.9954 12.0491C21.4432 12.0464 20.999 11.5951 20.9404 11.0459C20.764 9.39335 20.132 7.81481 19.1057 6.49104C17.8743 4.90272 16.1463 3.77276 14.1975 3.28156C12.2487 2.79036 10.1915 2.96625 8.35437 3.78115C6.82323 4.46031 5.51853 5.55071 4.57994 6.92229C4.56157 6.94914 4.54218 6.97505 4.52186 7Z" fill=""/>
                  <path d="M21 18.3246C19.8579 19.9498 18.2914 21.2429 16.4602 22.0552C14.2126 23.0522 11.6957 23.2673 9.31152 22.6664C6.9273 22.0654 4.81316 20.683 3.30663 18.7398C2.00506 17.061 1.22186 15.0472 1.04064 12.9448C0.993209 12.3946 1.45229 11.9482 2.00456 11.9509C2.55684 11.9536 3.00103 12.4049 3.05963 12.954C3.23597 14.6066 3.86797 16.1852 4.89426 17.509C6.12566 19.0973 7.85371 20.2272 9.80251 20.7184C11.7513 21.2096 13.8085 21.0337 15.6456 20.2188C17.1768 19.5397 18.4815 18.4493 19.4201 17.0777C19.4384 17.0509 19.4578 17.0249 19.4781 17H17C16.4477 17 16 16.5523 16 16C16 15.4477 16.4477 15 17 15H21C22.1046 15 23 15.8954 23 17V21C23 21.5523 22.5523 22 22 22C21.4477 22 21 21.5523 21 21V18.3246Z" fill=""/>
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
              <p class=" text-xs text-black dark:text-white">{{ item.Tr_teknis_pelanggan_id }}</p>
            </td>
            <td class="py-1 px-4 border">
              <h5 class="font-medium text-black text-xs dark:text-white">{{ item.Tr_teknis_pelanggan_nama }}</h5>
              <!-- <p class="text-xs">{{ item.picId }}</p> -->
            </td>
            <td class="py-1 px-4 text-center border">
              <h5 class="font-medium text-black text-xs dark:text-white">{{ item.Tr_teknis_pelanggan_server }}</h5>
              <!-- <p class="text-xs">{{ item.picId }}</p> -->
            </td>
            <td class="py-1 px-4 border">
              <h5 class="font-medium text-black text-xs dark:text-white">{{ item.Tr_teknis_user_updated }}</h5>
            </td>
            <td class="py-1 px-4">
              <div class="flex items-center space-x-3.5 d-flex justify-center">              
                <router-link class="hover:text-primary" :to="'/modules/work-order/evident/psb/detail/'+item._id">
                  <svg
                    class="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                      fill=""
                    />
                    <path
                      d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                      fill=""
                    />
                  </svg>
                </router-link>

                <router-link class="hover:text-primary" :to="'/modules/work-order/evident/psb/edit/'+item._id">
                
                  <svg
                    class="fill-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M21.1213 2.70705C19.9497 1.53548 18.0503 1.53547 16.8787 2.70705L15.1989 4.38685L7.29289 12.2928C7.16473 12.421 7.07382 12.5816 7.02986 12.7574L6.02986 16.7574C5.94466 17.0982 6.04451 17.4587 6.29289 17.707C6.54127 17.9554 6.90176 18.0553 7.24254 17.9701L11.2425 16.9701C11.4184 16.9261 11.5789 16.8352 11.7071 16.707L19.5556 8.85857L21.2929 7.12126C22.4645 5.94969 22.4645 4.05019 21.2929 2.87862L21.1213 2.70705ZM18.2929 4.12126C18.6834 3.73074 19.3166 3.73074 19.7071 4.12126L19.8787 4.29283C20.2692 4.68336 20.2692 5.31653 19.8787 5.70705L18.8622 6.72357L17.3068 5.10738L18.2929 4.12126ZM15.8923 6.52185L17.4477 8.13804L10.4888 15.097L8.37437 15.6256L8.90296 13.5112L15.8923 6.52185ZM4 7.99994C4 7.44766 4.44772 6.99994 5 6.99994H10C10.5523 6.99994 11 6.55223 11 5.99994C11 5.44766 10.5523 4.99994 10 4.99994H5C3.34315 4.99994 2 6.34309 2 7.99994V18.9999C2 20.6568 3.34315 21.9999 5 21.9999H16C17.6569 21.9999 19 20.6568 19 18.9999V13.9999C19 13.4477 18.5523 12.9999 18 12.9999C17.4477 12.9999 17 13.4477 17 13.9999V18.9999C17 19.5522 16.5523 19.9999 16 19.9999H5C4.44772 19.9999 4 19.5522 4 18.9999V7.99994Z" fill="#"/>
                  </svg>
                </router-link>

                <button class="hover:text-primary hidden">
                  <svg
                    class="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                      fill=""
                    />
                    <path
                      d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                      fill=""
                    />
                    <path
                      d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                      fill=""
                    />
                    <path
                      d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                      fill=""
                    />
                  </svg>
                </button>

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
