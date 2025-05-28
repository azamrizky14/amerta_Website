<script setup lang="ts">
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { mdiEyeOutline, mdiEyeOffOutline } from "@mdi/js";
import inputImageWithPreview from "@/components/Forms/SelectGroup/inputImageWithPreview.vue";
import InputGroup from "@/components/Auths/InputGroup.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import multiselectReadOnly from "@/components/Forms/SelectGroup/multiselectReadOnly.vue";
import Swal from "sweetalert2";

import { useIndexStore } from "@/stores";
import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import { createUserInternal, getAllRoleInternal } from "@/stores/functionAPI";

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore();
const pageTitle = ref("Master - Tambah User Internal");
const pageList = ref(["Master", "User Internal", "Tambah"]);

// Saved Data
const savedData = ref({
  companyCode: indexStore.company.companyCode,
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
const logistikData = ref([]);
const showPass = ref(false);

// Fetch roles and populate dropdown
onMounted(async () => {
  const options = await getAllRoleInternal(indexStore.user.hierarchyCode);
  optionsType.value = options;
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.user_created = date;
  const page = await indexStore.getUtilPage();
});

// Function to handle role selection
const handleOptionChange = (selected: {
  label: string;
  value: string;
  hierarchyCode: string;
  roleAccess: string;
}) => {
  if (selected) {
    savedData.value.userRole = selected.value; // Set userRole from roleName
    savedData.value.hierarchyCode = selected.hierarchyCode; // Set hierarchyCode from selected role
    savedData.value.userAccess = selected.roleAccess; // Set userAccess from roleAccess
  }
};

// Fungsi untuk toggle visibilitas password
const showPassword = ref(false);

// Fungsi untuk toggle visibilitas password
const togglePassword = () => {
  showPassword.value = !showPassword.value;
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
    await router.push("/master/user-internal");
  }
};

const changeRowItem = (value) => {
  if (value && value !== null) {
    savedData.value.hierarchyCode = value.hierarchyCode;
    savedData.value.userAccess = value.roleAccess;
    savedData.value.userRole = value.roleName;
  } else if (value === null) {
  }
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

      const fixData = { ...savedData.value };
      fixData.userAccess = JSON.stringify(fixData.userAccess);
      fixData.companyCode = JSON.stringify(fixData.companyCode);

      const formData = new FormData();

      // Append all fields to FormData
      Object.keys(fixData).forEach((key) => {
        formData.append(key, fixData[key]);
      });

      await createUserInternal(formData);

      await successCreate().then(() => {
        router.push("/master/user-internal");
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Menangkap error status 401 dan menampilkan SweetAlert untuk email duplikat
        await Swal.fire({
          title: "Email Sudah Digunakan!",
          text: "Silakan gunakan email yang lain.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } else {
        await failedCreate(error); // Error lainnya
      }
    }
  }
};

// Remove image function
const removeImage = (field: string) => {
  savedData.value[field] = null;
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
                  type="text"
                  placeholder="Nama User"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.userName"
                />
              </div>
            </div>

            <div class="w-full">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Role User </label
              ><v-select
                v-model="logistikData"
                :options="optionsType"
                label="roleName"
                placeholder="Masukan Role User"
                class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                @update:modelValue="(value) => changeRowItem(value)"
                clearable
              >
                <template #selected-option>
                  <span v-if="logistikData" class="dark:text-white">{{
                    logistikData.roleName
                  }}</span>
                  <span v-else class="dark:text-gray-400">Pilih Tujuan PO</span>
                </template>
              </v-select>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Email
              </label>
              <input
                type="text"
                placeholder="Email User"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.email"
              />
            </div>

            <div class="pb-2.5">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Password
              </label>
              <input
                placeholder="Password User"
                :type="showPass ? 'text' : 'password'"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.password"
              />
              <div class="flex items-center mt-2">
                <input
                  v-model="showPass"
                  type="checkbox"
                  id="show-password"
                  class="mr-2"
                />
                <label for="show-password" class="text-sm text-black dark:text-white"
                  >Tampilkan Password</label
                >
              </div>
            </div>

            <InputGroup
              class="hidden"
              label="Password"
              type="password"
              placeholder="6+ Characters, 1 Capital letter"
              v-model="savedData.password"
            >
              <svg
                class="fill-current"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.5">
                  <path
                    d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                    fill=""
                  />
                  <path
                    d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                    fill=""
                  />
                </g>
              </svg>
            </InputGroup>

            <div class="hidden">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Hierarchy Code
              </label>
              <div>
                <input
                  id="hierarchyCode"
                  type="text"
                  placeholder="Kode Hirarki"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.hierarchyCode"
                  readonly
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
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.userAccess"
                  readonly
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
                <div
                  class="relative flex border flex-col items-center p-2 justify-end w-full"
                >
                  <inputImageWithPreview
                    disabled-link
                    v-model="savedData.userImage"
                    @update:file="(file) => (savedData.userImage = file)"
                  />
                </div>
              </div>

              <!-- Bagian Form Gender dan Tanggal Lahir -->
              <div class="lg:w-3/5 flex flex-col gap-2">
                <!-- Gender -->
                <div>
                  <label
                    class="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Gender
                  </label>
                  <div class="flex items-center space-x-6">
                    <label
                      for="radioPria"
                      class="flex cursor-pointer select-none items-center"
                    >
                      <div class="relative">
                        <input
                          type="radio"
                          id="radioPria"
                          name="gender"
                          value="pria"
                          v-model="savedData.userGender"
                          class="sr-only"
                        />
                        <div
                          :class="
                            savedData.userGender === 'pria'
                              ? 'border-primary bg-primary'
                              : 'border'
                          "
                          class="mr-2 flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-300"
                        >
                          <span
                            :class="
                              savedData.userGender === 'pria'
                                ? 'bg-white'
                                : 'bg-transparent'
                            "
                            class="h-2.5 w-2.5 rounded-full"
                          ></span>
                        </div>
                      </div>
                      Pria
                    </label>

                    <label
                      for="radioWanita"
                      class="flex cursor-pointer select-none items-center"
                    >
                      <div class="relative">
                        <input
                          type="radio"
                          id="radioWanita"
                          name="gender"
                          value="wanita"
                          v-model="savedData.userGender"
                          class="sr-only"
                        />
                        <div
                          :class="
                            savedData.userGender === 'wanita'
                              ? 'border-primary bg-primary'
                              : 'border'
                          "
                          class="mr-2 flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-300"
                        >
                          <span
                            :class="
                              savedData.userGender === 'wanita'
                                ? 'bg-white'
                                : 'bg-transparent'
                            "
                            class="h-2.5 w-2.5 rounded-full"
                          ></span>
                        </div>
                      </div>
                      Wanita
                    </label>
                  </div>
                </div>

                <!-- Tanggal Lahir -->
                <div>
                  <label
                    class="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    placeholder="Server"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    v-model="savedData.userBirth"
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
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.userPhone"
              />
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Alamat
              </label>
              <textarea
                rows="3"
                placeholder="Masukan alamat disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.userAddress"
              ></textarea>
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
        <!-- Input Fields End -->
      </div>
    </div>
    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>

<style>
.vs__search {
  padding: 0 !important;
}
.vs__open-indicator path {
  @apply fill-current dark:text-white;
}
.vs__clear path {
  @apply fill-current dark:text-white;
}
.custom-v-select .vs__dropdown-toggle {
  padding: 0.3rem 1rem 0.45rem 1rem;
  @apply border border-gray-400 dark:border-white;
}
</style>
