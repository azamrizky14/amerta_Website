<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import vSelect from "vue-select";
import { ref, onMounted } from "vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import { adminTeknis_GetDataById } from "@/stores/functionAPI";
import { useRoute } from "vue-router";

const route = useRoute();

// Reactive variable to track the current step
const currentStep = ref(0);

// Step content definition
// const steps = [
//   { content: "Enter your name and personal details" },
//   { content: "Enter your email address and phone number" },
//   { content: "Review your information and confirm" },
// ];
const steps = ref([]);
const dataKembali = ref([]);

// Navigate to a specific step
const goToStep = (stepIndex: number) => {
  if (stepIndex >= 0 && stepIndex < steps.value.length) {
    currentStep.value = stepIndex;
  }
};

// Move to the next step
const nextStep = () => {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++;
  }
};

// Move to the previous step
const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const ShowTypeLabelStart = (index) => {
  const data = steps.value[currentStep.value].Tr_teknis_work_order_terpakai_material;
  const tipe = data[index].Sh_item_tipe?.toLowerCase();
  if (tipe === "aset" || tipe === "material") return false;

  if (index === 0) return true;
  const currentType = data[index].Sh_item_tipe;
  const previousType = data[index - 1].Sh_item_tipe;
  return currentType !== previousType;
};

const ShowTypeLabelEnd = (index) => {
  const data = steps.value[currentStep.value].Tr_teknis_work_order_kembali;
  const tipe = data[index].Sh_item_tipe?.toLowerCase();
  if (tipe === "aset" || tipe === "material") return false;

  if (index === 0) return true;
  const currentType = data[index].Sh_item_tipe;
  const previousType = data[index - 1].Sh_item_tipe;
  return currentType !== previousType;
};

onMounted(async () => {
  const data = await adminTeknis_GetDataById(route.params.id);

  // Step 1: Salin data awal
  dataKembali.value = {
    Tr_teknis_work_order_terpakai: data.Tr_teknis_work_order_terpakai,
    Tr_teknis_work_order_tersedia: data.Tr_teknis_work_order_tersedia,
    Tr_teknis_work_order_kembali: data.Tr_teknis_work_order_kembali,
  };

  // Step 2: Isi Sh_item_qty_hilang dari data tersedia (jika bukan Kabel)
  dataKembali.value.Tr_teknis_work_order_kembali.forEach((item) => {
    const match = dataKembali.value.Tr_teknis_work_order_tersedia.find(
      (available) =>
        available.Sh_item_id === item.Sh_item_id &&
        available.Sh_item_jenis === item.Sh_item_jenis
    );
    if (match && match.Sh_item_tipe !== "Kabel") {
      item.Sh_item_qty_hilang = match.Sh_item_qty;
    }
  });

  // Step 3: Siapkan mergedData
  const mergedData = {
    ...data,
    Tr_teknis_work_order_terpakai: data.Tr_teknis_work_order_terpakai.map((item) => ({
      ...item,
    })),
  };

  // Step 4: Jika ada data kembali, tambahkan sebagai langkah tambahan
  if (data.Tr_teknis_work_order_kembali && data.Tr_teknis_work_order_kembali.length > 0) {
    mergedData.Tr_teknis_work_order_terpakai.push({
      Tr_teknis_work_order_kembali: data.Tr_teknis_work_order_kembali,
    });
  }

  // Step 5: Simpan hasil ke steps
  steps.value = mergedData.Tr_teknis_work_order_terpakai;

  // Step 6: Inisialisasi Sh_item_qty_hilang di tersedia (jika bukan Kabel)
  dataKembali.value.Tr_teknis_work_order_tersedia = dataKembali.value.Tr_teknis_work_order_tersedia.map(
    (x) => {
      if (x.Sh_item_tipe === "Kabel") return x;
      return {
        ...x,
        Sh_item_qty_hilang: x.Sh_item_qty,
      };
    }
  );

  // Step 7: Gabungkan semua material
  const mergedMaterials = [
    ...(dataKembali.value.Tr_teknis_work_order_terpakai?.flatMap(
      (item) => item.Tr_teknis_work_order_terpakai_material || []
    ) || []),
    ...(dataKembali.value.Tr_teknis_work_order_kembali || []),
  ];

  // Step 8: Kurangi Sh_item_qty_hilang berdasarkan material (jika bukan Kabel)
  mergedMaterials.forEach((material) => {
    const target = dataKembali.value.Tr_teknis_work_order_kembali.find(
      (item) =>
        item.Sh_item_id === material.Sh_item_id &&
        item.Sh_item_jenis === material.Sh_item_jenis &&
        item.Sh_item_tipe !== "Kabel"
    );
    if (target && target.Sh_item_qty_hilang !== undefined) {
      target.Sh_item_qty_hilang -= material.Sh_item_qty;
      if (target.Sh_item_qty_hilang < 0) target.Sh_item_qty_hilang = 0;
    }
  });

  // Step 9: Kurangi juga dengan qty dikembalikan (jika bukan Kabel)
  dataKembali.value.Tr_teknis_work_order_kembali.forEach((item) => {
    if (
      item.Sh_item_tipe !== "Kabel" &&
      item.Sh_item_qty_hilang !== undefined &&
      item.Sh_item_qty !== undefined
    ) {
      item.Sh_item_qty_hilang -= item.Sh_item_qty;
      if (item.Sh_item_qty_hilang < 0) item.Sh_item_qty_hilang = 0;
    }
  });

  // Step 10: Hitung item_properties_qty_hilang untuk tipe Kabel
  dataKembali.value.Tr_teknis_work_order_kembali.forEach((kembaliItem) => {
    if (kembaliItem.Sh_item_tipe !== "Kabel") return;

    kembaliItem.Sh_item_properties?.forEach((kembaliProp) => {
      const itemId = kembaliItem.Sh_item_id;
      const itemJenis = kembaliItem.Sh_item_jenis;
      const propId = kembaliProp.item_properties_id;

      // 1. Ambil qty tersedia dari data Tr_teknis_work_order_tersedia
      const tersediaItem = dataKembali.value.Tr_teknis_work_order_tersedia.find(
        (item) =>
          item.Sh_item_id === itemId &&
          item.Sh_item_jenis === itemJenis &&
          item.Sh_item_tipe === "Kabel"
      );
      const tersediaProp = tersediaItem?.Sh_item_properties?.find(
        (prop) => prop.item_properties_id === propId
      );
      const qtyTersedia = tersediaProp?.item_properties_qty || 0;

      // 2. Hitung total qty terpakai dari semua step
      const qtyTerpakai = dataKembali.value.Tr_teknis_work_order_terpakai.flatMap(
        (step) => step.Tr_teknis_work_order_terpakai_material || []
      )
        .filter(
          (material) =>
            material.Sh_item_tipe === "Kabel" &&
            material.Sh_item_id === itemId &&
            material.Sh_item_jenis === itemJenis
        )
        .flatMap((material) => material.Sh_item_properties || [])
        .filter((prop) => prop.item_properties_id === propId)
        .reduce((sum, prop) => sum + (prop.item_properties_qty || 0), 0);

      // 3. Hitung total qty kembali dari semua item kembali
      const qtyKembali = dataKembali.value.Tr_teknis_work_order_kembali.filter(
        (item) =>
          item.Sh_item_tipe === "Kabel" &&
          item.Sh_item_id === itemId &&
          item.Sh_item_jenis === itemJenis
      )
        .flatMap((item) => item.Sh_item_properties || [])
        .filter((prop) => prop.item_properties_id === propId)
        .reduce((sum, prop) => sum + (prop.item_properties_qty || 0), 0);

      // 4. Hitung dan simpan ke dalam item KEMBALI
      kembaliProp.item_properties_qty_hilang = qtyTersedia - qtyTerpakai - qtyKembali;
      if (kembaliProp.item_properties_qty_hilang < 0)
        kembaliProp.item_properties_qty_hilang = 0;
    });
  });

  console.log("data akhir", dataKembali.value);
});
</script>

<template>
  <div class="flex flex-col gap-9">
    <div
      class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
    >
      <div class="border-b border-stroke py-3 px-6.5 dark:border-strokedark">
        <!-- Progress bar -->
        <div class="flex items-center justify-between">
          <template v-for="(step, index) in steps" :key="index">
            <div class="flex items-center space-x-2">
              <!-- Clickable step indicators -->
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full focus:outline-none"
                :class="
                  currentStep === index
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                "
                @click="goToStep(index)"
              >
                {{ step.Tr_teknis_work_order_kembali ? "C" : index + 1 }}
              </button>
            </div>
            <div
              v-if="index < steps.length - 1"
              class="w-full h-[2px]"
              :class="currentStep > index ? 'bg-primary' : 'bg-gray-300'"
            ></div>
          </template>
        </div>
      </div>
      <div>
        <!-- Step Content -->
        <div
          class="border-b border-stroke dark:border-strokedark flex flex-col gap-2 p-6.5"
          v-if="steps && steps.length > 0"
        >
          <!-- Dynamically display the content of the active step -->
          <!-- Data Steps -->
          <div
            class="flex flex-col gap-6 xl:flex-row"
            v-if="!steps[currentStep].Tr_teknis_work_order_kembali"
          >
            <div class="lg:w-1/2">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Tgl. Dibuat
              </label>
              <input
                disabled
                type="date"
                placeholder="Tgl. Dibuat"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="steps[currentStep].Tr_teknis_tanggal"
              />
            </div>
            <div class="lg:w-1/2">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Dibuat Oleh
              </label>
              <input
                disabled
                type="text"
                placeholder="Dibuat Oleh"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="steps[currentStep].Tr_teknis_user_updated"
              />
            </div>
          </div>

          <div
            class="flex flex-col gap-6 xl:flex-row"
            v-if="!steps[currentStep].Tr_teknis_work_order_kembali"
          >
            <div class="lg:w-1/2">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Id Pelanggan
              </label>
              <input
                disabled
                type="text"
                placeholder="Id Pelanggan"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="steps[currentStep].Tr_teknis_pelanggan_id"
              />
            </div>
            <div class="lg:w-1/2">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Server
              </label>
              <input
                disabled
                type="text"
                placeholder="Server"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="steps[currentStep].Tr_teknis_pelanggan_server"
              />
            </div>
          </div>

          <div v-if="!steps[currentStep].Tr_teknis_work_order_kembali">
            <label class="mb-3 block text-sm font-medium text-black dark:text-white">
              Nama Pelanggan
            </label>
            <input
              disabled
              type="text"
              placeholder="Nama Pelanggan"
              class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
              v-model="steps[currentStep].Tr_teknis_pelanggan_nama"
            />
          </div>

          <div v-if="!steps[currentStep].Tr_teknis_work_order_kembali">
            <label class="mb-3 block text-sm font-medium text-black dark:text-white">
              Keterangan
            </label>
            <textarea
              disabled
              rows="3"
              placeholder="Masukan keterangan disini!"
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              v-model="steps[currentStep].Tr_teknis_keterangan"
            ></textarea>
          </div>
          <!-- End Data Steps -->

          <!-- Data Closing -->
          <template v-else>
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Closing
                </label>
                <input
                  disabled
                  type="date"
                  placeholder="Tgl. Dibuat"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="steps[currentStep].Tr_teknis_closed"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Di Closing Oleh
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Dibuat Oleh"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="steps[currentStep].Tr_teknis_user_closed"
                />
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Catatan Closing
              </label>
              <textarea
                disabled
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="steps[currentStep].Tr_teknis_keterangan_closing"
              ></textarea>
            </div>
          </template>
          <!-- End Data Closing -->
          <!-- Form Inputs based on step -->
        </div>
      </div>
    </div>

    <DefaultCard
      :cardTitle="
        steps[currentStep] && steps[currentStep].Tr_teknis_work_order_kembali
          ? 'Material Kembali'
          : 'Material Terpakai'
      "
    >
      <div
        class="p-6.5"
        v-if="steps[currentStep] && !steps[currentStep].Tr_teknis_work_order_kembali"
      >
        <div
          class="flex flex-col gap-2 xl:flex-row"
          v-for="(data, index) in steps[currentStep]
            .Tr_teknis_work_order_terpakai_material"
          v-if="
            steps.length > 0 &&
            steps[currentStep].Tr_teknis_work_order_terpakai_material.length > 0
          "
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
            class="w-3/12"
            v-if="data.Sh_item_tipe !== 'Modem' && data.Sh_item_tipe !== 'Tiang'"
          >
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0 || ShowTypeLabelStart(index)"
            >
              Tersedia
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
                :value="prop?.item_properties_qty_sisa + prop?.item_properties_qty"
              />
            </template>
            <template v-else>
              <input
                disabled
                type="number"
                placeholder="Qty"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                :value="data.Sh_item_qty + data.Sh_item_qty_sisa"
              />
            </template>
          </div>

          <!-- Dipakai -->
          <div
            class="w-3/12"
            v-if="data.Sh_item_tipe !== 'Modem' && data.Sh_item_tipe !== 'Tiang'"
          >
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0 || ShowTypeLabelStart(index)"
            >
              Terpakai
            </label>
            <template
              v-if="data.Sh_item_tipe === 'Kabel'"
              v-for="(prop, i) in data.Sh_item_properties"
            >
              <input
                disabled
                type="number"
                placeholder="Qty"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                :class="i > 0 ? 'mt-2' : ''"
                v-model="prop.item_properties_qty"
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
            class="w-6/12"
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
                :clearable="false"
                :options="[]"
                label="item_properties_id"
                placeholder="Detail Modem"
                class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
              >
              </v-select>
            </template>
            <template v-if="data.Sh_item_tipe === 'Tiang'">
              <v-select
                disabled
                v-model="data.Sh_item_properties"
                :options="[]"
                multiple
                label="item_properties_id"
                placeholder="List Tiang"
                class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
              >
              </v-select>
            </template>
          </div>
        </div>
        <div v-else>Material Masih belum Digunakan!</div>
      </div>
      <div
        class="p-6.5"
        v-else-if="steps[currentStep] && steps[currentStep].Tr_teknis_work_order_kembali"
      >
        <div
          class="flex flex-col gap-2 xl:flex-row"
          v-for="(data, index) in dataKembali.Tr_teknis_work_order_kembali"
          v-if="dataKembali && dataKembali.Tr_teknis_work_order_kembali"
          :class="index === 0 ? '' : 'pt-2'"
        >
          <!-- Nama Barang -->
          <div class="w-7/12">
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0 || ShowTypeLabelEnd(index)"
            >
              {{ ShowTypeLabelEnd(index) ? data.Sh_item_tipe : "Nama Barang" }}
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

          <!-- Dipakai -->
          <div
            class="w-3/12"
            v-if="data.Sh_item_tipe !== 'Modem' && data.Sh_item_tipe !== 'Tiang'"
          >
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0 || ShowTypeLabelEnd(index)"
            >
              Kembali
            </label>
            <template
              v-if="data.Sh_item_tipe === 'Kabel'"
              v-for="(prop, i) in data.Sh_item_properties"
            >
              <input
                disabled
                type="number"
                placeholder="Qty"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                :class="i > 0 ? 'mt-2' : ''"
                v-model="prop.item_properties_qty"
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

          <!-- Tersisa -->
          <div
            class="w-3/12"
            v-if="data.Sh_item_tipe !== 'Modem' && data.Sh_item_tipe !== 'Tiang'"
          >
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0 || ShowTypeLabelEnd(index)"
            >
              Hilang
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
                :value="prop?.item_properties_qty_hilang"
              />
            </template>
            <template v-else>
              <input
                disabled
                type="number"
                placeholder="Qty"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                :value="data.Sh_item_qty_hilang"
              />
            </template>
          </div>
          <!-- SN -->
          <div
            class="w-6/12"
            v-if="data.Sh_item_tipe === 'Modem' || data.Sh_item_tipe === 'Tiang'"
          >
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0 || ShowTypeLabelEnd(index)"
            >
              Kode Barang
            </label>
            <template v-if="data.Sh_item_tipe === 'Modem'">
              <v-select
                disabled
                v-model="data.Sh_item_properties"
                :clearable="false"
                :options="[]"
                label="item_properties_id"
                placeholder="Detail Modem"
                class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
              >
              </v-select>
            </template>
            <template v-if="data.Sh_item_tipe === 'Tiang'">
              <v-select
                disabled
                v-model="data.Sh_item_properties"
                :options="[]"
                multiple
                label="item_properties_id"
                placeholder="List Tiang"
                class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
              >
              </v-select>
            </template>
          </div>
        </div>
      </div>
      <div class="p-6.5" v-else>Material Masih belum Digunakan!</div>
    </DefaultCard>
  </div>
</template>

<style>
/* Custom styles for primary colors */
.bg-primary {
  background-color: #4f46e5; /* Tailwind Indigo-600 */
}

.bg-primary-dark {
  background-color: #4338ca; /* Tailwind Indigo-700 */
}
</style>
