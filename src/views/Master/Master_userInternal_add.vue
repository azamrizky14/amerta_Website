<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import inputImageWithPreview from "@/components/Forms/SelectGroup/inputImageWithPreview.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import multiselectReadOnly from "@/components/Forms/SelectGroup/multiselectReadOnly.vue";
import Swal from "sweetalert2";

import { useIndexStore } from "@/stores";
import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import { createUser, getAllRole } from "@/stores/functionAPI";

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore();
const pageTitle = ref("Master - Add User Internal");
const pageList = ref(["Master", "User Internal", "Add"]);

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
  const options = await getAllRole();
  options.forEach((option) => {
    option.label = option.roleName; // Map roleName to label
    option.value = option.roleName; // Use roleName as the value
  });
  optionsType.value = options;
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.user_created = date;
  const page = await indexStore.getUtilPage();
  console.log(page);
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
    await router.push("/modules/master/user-internal");
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

      const formData = new FormData();

      // Append all fields to FormData
      Object.keys(fixData).forEach((key) => {
        formData.append(key, fixData[key]);
      });

      await createUser(formData);

      await successCreate().then(() => {
        router.push("/modules/master/user-internal");
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
                type="text"
                placeholder="Email User"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.email"
              />
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Password
              </label>
              <input
                type="text"
                placeholder="Password User"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.password"
              />
            </div>
            <div class="w-full">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Role User
              </label>
              <SelectGroup
                placeholder="Pilih Nama Role"
                id="userRole"
                :options="optionsType"
                v-model="logistikData"
                @option-changed="handleOptionChange"
              />
            </div>

            <div class="hidden">
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
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
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
                  <!-- Label untuk Input Gambar -->
                  <label
                    class="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Photo User
                  </label>
                  <inputImageWithPreview
                    v-model="savedData.userImage"
                    @update:file="(file) => (savedData.userImage = file)"
                  />
                </div>
              </div>

              <!-- Bagian Form Gender dan Tanggal Lahir -->
              <div class="lg:w-3/5 flex flex-col gap-6">
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
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
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
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
