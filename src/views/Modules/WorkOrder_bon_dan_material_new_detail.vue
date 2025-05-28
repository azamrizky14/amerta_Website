<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import vSelect from "vue-select";
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Swal from "sweetalert2";

import { useRoute } from "vue-router";
import { adminTeknis_GetDataById, getUtilByName } from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";
import logistikWizardForm from "@/components/wizard/logistikWizardForm.vue";

import { ref, onMounted } from "vue";
import router from "@/router";

const route = useRoute();
const indexStore = useIndexStore();

const optionsType = ref([]);

const pageTitle = ref("Detail Bon & Material");
const pageList = ref(["Work Order", "Bon & Material", "Detail"]);

// Saved Data
const savedData = ref({
  Tr_teknis_item: "", // wajib
  Tr_teknis_team: [],
  Tr_teknis_keterangan: "",

  Tr_teknis_logistik_id: "",
  Tr_teknis_user_created: "", // otomatis
  Tr_teknis_user_closed: "",
  Tr_teknis_tanggal: "",
  Tr_teknis_created: "",
  Tr_teknis_closed: "",

  Tr_teknis_status: "open", // otomatis
  Tr_teknis_jenis: "", // otomatis
  Tr_teknis_deleted: "N", // otomatis
  Tr_teknis_domain: indexStore.user.companyName, // otomatis

  // Array WO Terpakai
  Tr_teknis_work_order_terpakai: [],

  // Array WO Tersedia
  Tr_teknis_work_order_tersedia: [],

  // Array WO Kembali
  Tr_teknis_work_order_kembali: [],
});

const ShowTypeLabelStart = (index) => {
  const data = savedData.value.Tr_teknis_work_order_tersedia;
  const tipe = data[index].Sh_item_tipe?.toLowerCase();
  if (tipe === "aset" || tipe === "material") return false;

  if (index === 0) return true;
  const currentType = data[index].Sh_item_tipe;
  const previousType = data[index - 1].Sh_item_tipe;
  return currentType !== previousType;
};

const materialData = ref([{ label: "", qty: "" }]);

onMounted(async () => {
  const data = await getUtilByName("bonMaterial");
  if (data && data.utilData.length > 0) {
    let option = await data.utilData.find(
      (x) => x.companyName === indexStore.user.companyName
    );
    option = option.bonMaterialList.map((x) => ({
      label: x,
      value: x,
    }));
    optionsType.value = [...option];
  }
  await getData();

  savedData.value.Tr_teknis_work_order_tersedia = savedData.value.Tr_teknis_work_order_tersedia.map(
    (x) => ({
      ...x,
      qtySisa: x.qty,
    })
  );

  // Step 2: Merge all Tr_teknis_work_order_terpakai_material and reduce qtySisa accordingly
  if (
    savedData.value.Tr_teknis_work_order_tersedia &&
    savedData.value.Tr_teknis_work_order_terpakai &&
    savedData.value.Tr_teknis_work_order_terpakai.length > 0
  ) {
    const mergedMaterials = savedData.value.Tr_teknis_work_order_terpakai.flatMap(
      (item) => item.Tr_teknis_work_order_terpakai_material || []
    );

    if (savedData.value.Tr_teknis_work_order_kembali) {
      savedData.value.Tr_teknis_work_order_kembali.forEach((element) => {
        mergedMaterials.push(element);
      });
    }

    // Deduct the qty from qtySisa in materialData if labels match
    mergedMaterials.forEach((material) => {
      const existingItem = savedData.value.Tr_teknis_work_order_tersedia.find(
        (item) => item.label === material.label
      );
      if (existingItem) {
        existingItem.qtySisa -= material.qty; // Reduce qtySisa based on the merged qty
        if (existingItem.qtySisa < 0) existingItem.qtySisa = 0; // Ensure qtySisa doesn't go below 0
      }
    });
  }
});

const getData = async () => {
  let data = await adminTeknis_GetDataById(route.params.id);
  if (data.Tr_teknis_images) {
    data = { ...data, ...data.Tr_teknis_images };
    delete data.Tr_teknis_images;
  }

  savedData.value = data;
};

const dataError = ref([]); // Array untuk menyimpan error

// Validasi qtyKeluar tidak boleh kurang dari 1
const validateQtyKeluar = (index) => {
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  if (materialData.value[index].qty !== "" && materialData.value[index].qty < 1) {
    Swal.fire({
      title: "Error!",
      text: "Minimal jumlah input adalah 1",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      materialData.value[index].qty = 1;
    });
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
        <DefaultCard cardTitle="Detail Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-6">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Logistik
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_logistik_id"
                />
              </div>
            </div>
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Dibuat
                </label>
                <input
                  disabled
                  type="date"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_tanggal"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Dibuat Oleh
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_user_created"
                />
              </div>
            </div>
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tim Peminta
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_jenis"
                />
                <!-- <SelectGroup
                  disabled
                  placeholder="Pilih Tim Peminta"
                  :options="optionsType"
                  v-model="savedData.Tr_teknis_jenis"
                /> -->
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Nama Tas
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Nama Tas"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_teknis_item"
                />
              </div>
            </div>

            <!-- <div>
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
              </div> -->

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Keterangan
              </label>
              <textarea
                disabled
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>

        <DefaultCard cardTitle="Detail Material">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in savedData.Tr_teknis_work_order_tersedia"
              v-if="savedData.Tr_teknis_work_order_tersedia.length > 0"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <!-- Nama Barang -->
              <div class="w-7/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || ShowTypeLabelStart(index)"
                >
                  {{ ShowTypeLabelStart(index) ? data.Sh_item_tipe : "Nama Barang" }}
                </label>
                <template
                  v-if="data.Sh_item_tipe === 'Kabel'"
                  v-for="(prop, i) in data.Sh_item_properties"
                >
                  <input
                    disabled
                    type="text"
                    placeholder="Nama Barang"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :class="i > 0 ? 'mt-2' : ''"
                    :value="
                      data.Sh_item_nama +
                      ' - ' +
                      data.Sh_item_jenis +
                      ' (' +
                      prop.item_properties_id +
                      ')'
                    "
                  />
                </template>
                <template v-else>
                  <input
                    disabled
                    type="text"
                    placeholder="Nama Barang"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :value="data.Sh_item_nama + ' - ' + data.Sh_item_jenis"
                  />
                </template>
              </div>
              <!-- Tersisa -->
              <div
                class="w-5/12"
                v-if="data.Sh_item_tipe !== 'Modem' && data.Sh_item_tipe !== 'Tiang'"
              >
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || ShowTypeLabelStart(index)"
                >
                  Data Awal
                </label>

                <template
                  v-if="data.Sh_item_tipe === 'Kabel'"
                  v-for="(prop, i) in data.Sh_item_properties"
                >
                  <input
                    disabled
                    type="text"
                    placeholder="Nama Barang"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :class="i > 0 ? 'mt-2' : ''"
                    :value="prop?.item_properties_qty"
                  />
                </template>
                <template v-else>
                  <input
                    disabled
                    type="number"
                    placeholder="Qty"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    v-model="data.Sh_item_qty"
                  />
                </template>
              </div>

              <!-- SN -->
              <div
                class="w-5/12"
                v-if="data.Sh_item_tipe === 'Modem' || data.Sh_item_tipe === 'Tiang'"
              >
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || ShowTypeLabelStart(index)"
                >
                  Kode Barang
                </label>
                <template v-if="data.Sh_item_tipe === 'Modem'">
                  <v-select
                    disabled
                    v-model="data.Sh_item_properties"
                    multiple
                    label="item_properties_id"
                    placeholder="Pilih Modem"
                    class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                  >
                  </v-select>
                </template>
                <template v-if="data.Sh_item_tipe === 'Tiang'">
                  <v-select
                    disabled
                    v-model="data.snNumber"
                    :options="data.Sh_item_properties ? data.Sh_item_properties : []"
                    multiple
                    label="item_properties_id"
                    placeholder="Pilih Tiang"
                    class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                  >
                  </v-select>
                </template>
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <logistikWizardForm />
        <!-- Input Fields End -->
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
              to="/modules/work-order/bon-dan-material"
              class="col-span-2 flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
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
