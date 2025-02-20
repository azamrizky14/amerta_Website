<script setup lang="ts">
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

onMounted(async () => {
  const data = await adminTeknis_GetDataById(route.params.id);
  console.log("ini data", data);

  dataKembali.value = {
    Tr_teknis_work_order_terpakai: data.Tr_teknis_work_order_terpakai,
    Tr_teknis_work_order_tersedia: data.Tr_teknis_work_order_tersedia,
    Tr_teknis_work_order_kembali: data.Tr_teknis_work_order_kembali,
  };

  // Update the `Tr_teknis_work_order_kembali` array with `qtyKembali`
  dataKembali.value.Tr_teknis_work_order_kembali.forEach((item) => {
    // Find the matching material in `Tr_teknis_work_order_tersedia`
    const matchingItem = dataKembali.value.Tr_teknis_work_order_tersedia.find(
      (available) => available.label === item.label
    );

    // If a match is found, add `qtyKembali` with `qtySisa` value
    if (matchingItem) {
      item.qtySisa = matchingItem.qty;
    }
  });

  // Merge Tr_teknis_work_order_terpakai with Tr_teknis_work_order_kembali
  const mergedData = {
    ...data, // Spread the original data into the merged object
    Tr_teknis_work_order_terpakai: data.Tr_teknis_work_order_terpakai.map((item) => ({
      ...item, // Copy the properties of each item in Tr_teknis_work_order_terpakai
    })),
  };

  // If Tr_teknis_work_order_kembali exists, merge it with Tr_teknis_work_order_terpakai
  if (data.Tr_teknis_work_order_kembali && data.Tr_teknis_work_order_kembali.length > 0) {
    mergedData.Tr_teknis_work_order_terpakai.push({
      ...mergedData, // Add the full data object (as is) to Tr_teknis_work_order_terpakai
      Tr_teknis_work_order_kembali: data.Tr_teknis_work_order_kembali,
    });
  }

  // Set steps.value to the merged array
  steps.value = mergedData.Tr_teknis_work_order_terpakai;

  dataKembali.value.Tr_teknis_work_order_tersedia = dataKembali.value.Tr_teknis_work_order_tersedia.map(
    (x) => ({
      ...x,
      qtySisa: x.qty,
    })
  );

  // Step 2: Merge all Tr_teknis_work_order_terpakai_material and reduce qtySisa accordingly
  if (
    dataKembali.value.Tr_teknis_work_order_tersedia &&
    dataKembali.value.Tr_teknis_work_order_terpakai &&
    dataKembali.value.Tr_teknis_work_order_terpakai.length > 0
  ) {
    const mergedMaterials = dataKembali.value.Tr_teknis_work_order_terpakai.flatMap(
      (item) => item.Tr_teknis_work_order_terpakai_material || []
    );

    if (dataKembali.value.Tr_teknis_work_order_kembali) {
      dataKembali.value.Tr_teknis_work_order_kembali.forEach((element) => {
        mergedMaterials.push(element);
      });
    }

    // Deduct the qty from qtySisa in materialData if labels match
    mergedMaterials.forEach((material) => {
      const existingItem = dataKembali.value.Tr_teknis_work_order_kembali.find(
        (item) => item.label === material.label
      );
      if (existingItem) {
        existingItem.qtySisa -= material.qty; // Reduce qtySisa based on the merged qty
        if (existingItem.qtySisa < 0) existingItem.qtySisa = 0; // Ensure qtySisa doesn't go below 0
      }
    });
  }

  // Reduce `qtySisa` by `qty` for each object in `Tr_teknis_work_order_kembali`
  dataKembali.value.Tr_teknis_work_order_kembali.forEach((item) => {
    if (item.qtySisa !== undefined && item.qty !== undefined) {
      item.qtySisa -= item.qty;
      if (item.qtySisa < 0) item.qtySisa = 0; // Ensure `qtySisa` doesn't go below 0
    }
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
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
              class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
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
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
          <div class="w-6/12">
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="data.label.toLowerCase().includes('ont') && index > 0"
            >
              ONT
            </label>
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-else-if="index === 0"
            >
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
          <div class="w-3/12" v-if="!data.label.toLowerCase().includes('ont')">
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0"
            >
              Qty. Dipakai
            </label>
            <input
              disabled
              type="number"
              placeholder="Qty"
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              v-model="data.qty"
              @change="validateQtyKeluar(index)"
            />
          </div>
          <div class="w-3/12" v-if="!data.label.toLowerCase().includes('ont')">
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0"
            >
              Qty. Tersisa
            </label>
            <input
              disabled
              type="number"
              placeholder="Qty"
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              v-model="data.qtySisa"
              @change="validateQtyKeluar(index)"
            />
          </div>
          <div class="w-6/12" v-else>
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0"
            >
              SN
            </label>
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-else="data.label.toLowerCase().includes('ont')"
            >
              SN
            </label>
            <input
              disabled
              type="text"
              placeholder="Qty"
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              v-model="data.snNumber"
              @change="validateQtyKeluar(index)"
            />
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
          <div class="w-6/12">
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0"
            >
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
          <div class="w-3/12">
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0"
            >
              Qty. Kembali
            </label>
            <input
              disabled
              type="number"
              placeholder="Qty"
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              v-model="data.qty"
              @change="validateQtyKeluar(index)"
            />
          </div>
          <div class="w-3/12">
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0"
            >
              Qty. Hilang
            </label>
            <input
              disabled
              type="number"
              placeholder="Qty"
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              v-model="data.qtySisa"
              @change="validateQtyKeluar(index)"
            />
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
