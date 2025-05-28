<script setup lang="ts">
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultCardTable from "@/components/Forms/DefaultCardAccessPage.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import imageWithPreviewUser from "@/components/Forms/SelectGroup/imageWithPreviewUser.vue";
import TableRolesEdit from "@/components/Tables/TableRolesEdit.vue";
import Swal from "sweetalert2";

import { useIndexStore } from "@/stores";
import {
  showLoading,
  successEdit,
  failedEdit,
  cancelEdit,
  resetFunction,
} from "@/stores/swal";
import {
  updateUserExternal,
  getUserExternalById,
  getAllRoleExternal,
} from "@/stores/functionAPI";

import { ref, onMounted } from "vue";
import router from "@/router";
import { useRoute } from "vue-router";

const route = useRoute();

const indexStore = useIndexStore();
const pageTitle = ref("Master - Edit User External");
const pageList = ref(["Master", "User External", "Edit"]);
const imageUrl = "images/user_external";
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
let logistikData = ref([]);
const dataTable = ref([]);

const handleUpdate = (updateData) => {
  dataTable.value = updateData;
};

// Fetch roles and populate dropdown
onMounted(async () => {
  await getData();
});

const getData = async () => {
  const data = await getUserExternalById(route.params.id);
  savedData.value = { ...data };
  const pageData = await indexStore.getUtilPage();
  if (pageData && pageData.utilData) {
    // Masukkan data page ke dalam tabel
    const allowedPrefixes = data.userAccess.map((rule) => rule.pageCode);
    const pages = pageData.utilData;
    // Filter data berdasarkan pageCode yang diawali dengan salah satu prefix
    const filteredPages = pages.filter((page) =>
      allowedPrefixes.some((prefix) => page.pageCode.startsWith(prefix))
    );
    dataTable.value = filteredPages;
  }

  const options = await getAllRoleExternal(indexStore.user.hierarchyCode);
  optionsType.value = options;

  if (savedData.value && savedData.value.userRole) {
    logistikData = options.find((x) => x.roleName === savedData.value.userRole);
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
      fixData.accessEdited = fixData.userAccess === dataTable.value ? "N" : "Y";
      fixData.userAccess = dataTable.value ? JSON.stringify(dataTable.value) : "[]";
      const formData = new FormData();

      Object.keys(fixData).forEach((key) => {
        formData.append(key, fixData[key]);
      });

      if (fixData.userImage) {
        formData.append("userImage", fixData.userImage);
      }

      await updateUserExternal(formData, fixData._id);

      await successEdit().then(() => {
        router.push("/master/user-external");
      });
    } catch (error) {
      await failedEdit(error);
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
                :clearable="false"
              >
                <template #selected-option>
                  <span v-if="logistikData" class="dark:text-white">{{
                    logistikData.roleName
                  }}</span>
                  <span v-else class="dark:text-gray-400">Pilih Tujuan PO</span>
                </template>
              </v-select>
            </div>

            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Akses Diubah
                </label>
                <div>
                  <input
                    id="accessEdited"
                    type="text"
                    placeholder="Hak Akses Dirubah"
                    class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                    :value="savedData.accessEdited === 'Y' ? 'Iya' : 'Tidak'"
                    disabled
                  />
                </div>
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Hirarki
                </label>
                <div>
                  <input
                    id="hierarchyCode"
                    type="text"
                    placeholder="Kode Hirarki"
                    class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                    :value="savedData.hierarchyCode"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div class="">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Cabang Perusahaan
              </label>
              <div>
                <input
                  id="companyName"
                  type="text"
                  placeholder="Kode Hirarki"
                  class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                  v-model="savedData.companyName"
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
        <DefaultCard cardTitle="Edit Data Pribadi">
          <div class="flex flex-col gap-2 p-6.5">
            <!-- Flex Container untuk Gambar dan Form -->
            <div class="flex flex-col lg:flex-row gap-6">
              <!-- Bagian Input Gambar -->
              <div class="lg:w-2/5 flex items-center justify-center">
                <div
                  class="relative flex border flex-col items-center p-2 justify-end w-full"
                >
                  <!-- Label untuk Input Gambar -->
                  <imageWithPreviewUser
                    :url="imageUrl"
                    v-model="savedData.imageName"
                    @update:file="(file) => (savedData.imageName = file)"
                    disabledLink
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
                    placeholder="Tanggal Lahir"
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
                rows="4"
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
        <TableRolesEdit
          :hierarchy="indexStore.user.hierarchyCode <= 1.4"
          @update:modelValue="handleUpdate"
          :dataPage="savedData.userAccess"
        />
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
              @click="cancelEdit(router, '/master/user-external')"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batal
            </button>
            <button
              @click="resetFunction(getData)"
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
  padding: 0.3rem 0.5rem 0.45rem 0.5rem;
  @apply border border-gray-400 dark:border-white;
}
</style>
