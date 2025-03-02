<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultCardTable from "@/components/Forms/DefaultCardAccessPage.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import imageWithPreviewUser from "@/components/Forms/SelectGroup/imageWithPreviewUser.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import multiselectReadOnly from "@/components/Forms/SelectGroup/multiselectReadOnly.vue";
import Swal from "sweetalert2";

import { useIndexStore } from "@/stores";
import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import { createUser, getUserById } from "@/stores/functionAPI";

import { ref, onMounted } from "vue";
import router from "@/router";
import { useRoute } from "vue-router";

const route = useRoute();

const indexStore = useIndexStore();
const pageTitle = ref("Master - Detail User Internal");
const pageList = ref(["Master", "User Internal", "Detail"]);
const dataHeader = ref([
  {name: '', class: 'min-w-[30px] py-2 px-4'}, // Kolom checkbox
  {name: 'Nama Halaman', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Kode', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Kategori', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Tipe', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Grup', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Halaman Tujuan', class: 'min-w-[150px] py-2 px-4'},
])
let dataTable = ref([])

// Saved Data
const savedData = ref({
  companyCode: "",
  companyName: indexStore.user.companyName,
  userName: "",
  email: "",
  password: "",
  userBirth: "",
  userPhone: "",
  userAddress: "",
  userAccess: [],
  accessEdited: "N",
  userAccStatus: "enable",
  hierarchyCode: "",
  userGender: "",
  userImage: null,
  imageName: null,
  userRole: "",
  isDeleted: "N",
  userProperties: [],
  user_created: "",
  user_updated: "",
});

const optionsType = ref([]);

// Fetch roles and populate dropdown
onMounted(async () => {
  const data = await getUserById(route.params.id);
  savedData.value = data;
  const pageData = await indexStore.getUtilPage();
  console.log(pageData)
  if (pageData && pageData.utilData) {
    // Masukkan data page ke dalam tabel
    dataTable.value = pageData.utilData;
  }
  
  // options.forEach((option) => {
  //   option.label = option.roleName; // Map roleName to label
  //   option.value = option.roleName; // Use roleName as the value
  // });
  // optionsType.value = options;
  // const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.user_created = date;
  // const page = await indexStore.getUtilPage();
  // console.log(page)
});


// Function to handle role selection
const handleOptionChange = (selected: { label: string; value: string; hierarchyCode: string; roleAccess: string }) => {
  if (selected) {
    savedData.value.userRole = selected.value; // Set userRole from roleName
    savedData.value.hierarchyCode = selected.hierarchyCode; // Set hierarchyCode from selected role
    savedData.value.userAccess = selected.roleAccess; // Set userAccess from roleAccess
  }
};


// Validators for required fields
const dataValidator = ref([
  { key: "userName", label: "Nama User" },
  { key: "userRole", label: "Role User" },
  { key: "hierarchyCode", label: "Kode Hirarki User" },
  { key: "email", label: "Email User" },
  { key: "userGender", label: "Gender User" },
  { key: "userBirth", label: "Tanggal Lahir User" },
  { key: "userPhone", label: "No Telp User" },
  { key: "userAddress", label: "Alamat User" },
]);

const switcherToggle = ref<boolean>(false)


const dataError = ref([]);

// Helper function for validation
const validateForm = () => {
  dataError.value = [];
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key]) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });
  return dataError.value.length === 0;
};

const submitData = async () => {
  const isValid = validateForm();
  if (!isValid) return;

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

      const fixData = {...savedData.value}
      fixData.userAccess = JSON.stringify(fixData.userAccess)
      const formData = new FormData();

      Object.keys(fixData).forEach((key) => {
        formData.append(key, fixData[key]);
      });

      if (fixData.userImage) {
        formData.append("userImage", fixData.userImage);
      }

      await createUser(formData);

      await successCreate().then(() => {
        router.push("/master/user-internal");
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
        <DefaultCard cardTitle="Masukan Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="w-full">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Nama User
              </label>
              <input
                disabled
                type="text"
                placeholder="Nama User"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.userName"
              />
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Email
              </label>
              <input
                disabled
                type="text"
                placeholder="Email User"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.email"
              />
              </div>
              <div class="w-full">
  <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    Role User
  </label>
  <input
                disabled
                type="text"
                placeholder="Email User"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.userRole"
              />
</div>

<div class="">
  <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    Hierarchy Code
  </label>
  <div>
    <input
      id="hierarchyCode"
      type="text"
      placeholder="Kode Hirarki"
      class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
      v-model="savedData.hierarchyCode"
      disabled
    />
  </div>
</div>

<div class="hidden">
  <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    User Access
  </label>
  <div>
    <input
    
      id="userAccess"
      type="text"
      placeholder="Hak Akses User"
      class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
      v-model="savedData.userAccess"
      disabled
    />
  </div>
</div>

          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
  <!-- Textarea Fields Start -->
  <DefaultCard cardTitle="Masukan Data Pribadi">
    <div class="flex flex-col gap-2 p-6.5">
      <!-- Flex Container untuk Gambar dan Form -->
      <div class="flex flex-col lg:flex-row gap-6">
        
        <!-- Bagian Input Gambar -->
        <div class="lg:w-2/5 flex items-center justify-center">
          <div class="relative flex border flex-col items-center p-2 justify-end w-full">
            <!-- Label untuk Input Gambar -->
            <label class="mb-3 block text-sm font-medium text-black dark:text-white">
              Photo User
            </label>
            <imageWithPreviewUser
              v-model="savedData.imageName"
              @update:file="(file) => (savedData.imageName = file)"
              disabled
            />
          </div>
        </div>
        
        <!-- Bagian Form Gender dan Tanggal Lahir -->
        <div class="lg:w-3/5 flex flex-col gap-6">
          <!-- Gender -->
          <div>
            <label class="mb-3 block text-sm font-medium text-black dark:text-white">
              Gender
            </label>
            <div class="flex items-center space-x-6">
              <input
    
      id="userAccess"
      type="text"
      placeholder="Hak Akses User"
      class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
      v-model="savedData.userGender"
      disabled
    /></div>
          </div>

          <!-- Tanggal Lahir -->
          <div>
            <label class="mb-3 block text-sm font-medium text-black dark:text-white">
              Tanggal Lahir
            </label>
            <input
              type="input"
              placeholder="Tanggal Lahir"
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              v-model="savedData.userBirth"
              disabled
            />
          </div>
        </div>
      </div>
      <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                No Telp
              </label>
              <input
                type="text"
                placeholder="No Telp User"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.userPhone"
                disabled
              />
              </div>

              <div>
        <label class="mb-3 block text-sm font-medium text-black dark:text-white">
          Alamat
        </label>
        <textarea
          rows="3"
          placeholder="Masukan alamat disini!"
          class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          v-model="savedData.userAddress"
          disabled
        ></textarea>
      </div>
    </div>
  </DefaultCard>
  <!-- Textarea Fields End -->
</div>

<div class="flex flex-col gap-9 col-span-2">
  <DefaultCardTable cardTitle="Pilih Page">
    <template #card-tools>
      <label for="toggle4" class="flex cursor-pointer select-none items-center">
        <div class="relative">
          <input
            type="checkbox"
            id="toggle4"
            class="sr-only"
            @change="switcherToggle = !switcherToggle; toggleAllCheckboxes()"
          />
          <div
            :class="switcherToggle && '!bg-primary'"
            class="block h-8 w-14 rounded-full bg-black"
          ></div>
          <div
            :class="switcherToggle && '!right-1 !translate-x-full'"
            class="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition"
          ></div>
        </div>
      </label>
    </template>
    
    <div class="max-w-full overflow-x-auto">
      <table class="w-full table-auto">
        <thead>
          <tr class="bg-gray-2 text-left dark:bg-meta-4">
          <th v-for="data in dataHeader" :class="data.class" class="font-medium text-black dark:text-white text-center">
          {{ data.name }}
          </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in dataTable" :key="index" class="border">
            <td class="py-2 px-4 align-middle justify-center">
          <input type="checkbox" v-model="item.selected">
        </td>
            <td class="py-1 px-4 border">
              <p class="font-medium text-black dark:text-white text-xs ">{{ item.pageName }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class="font-medium text-black dark:text-white text-xs text-center">{{ item.pageCode }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class="font-medium text-xs text-black dark:text-white text-center">{{ item.pageCategory }}</p>
            </td>
            <td class="py-1 px-4 border">
              <h5 class="font-medium text-black text-xs dark:text-white text-center">{{ item.pageType }}</h5>
              <!-- <p class="text-xs">{{ item.picId }}</p> -->
            </td>
            <td class="py-1 px-4 text-center border">
              <h5 class="font-medium text-black text-xs dark:text-white text-left">{{ item.pageGroup }}</h5>
              <!-- <p class="text-xs">{{ item }}</p> -->
            </td>
            <td class="py-1 px-4 border">
              <h5 class="font-medium text-black text-xs dark:text-white">{{ item.pageRoutes }}</h5>
              <!-- <p class="text-xs">{{ item.picId }}</p> -->
            </td>
          </tr> 
        </tbody>
      </table>
    </div>
    </DefaultCardTable>
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
          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <router-link
              to="/modules/master/user-internal"
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
