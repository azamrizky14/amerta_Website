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

// Navigate to a specific step
const goToStep = (stepIndex: number) => {
  console.log("step", stepIndex, steps.value.length);
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
  steps.value = data.Tr_teknis_work_order_terpakai;
  console.log("tes", steps.value);
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
                {{ index + 1 }}
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

          <div class="flex flex-col gap-6 xl:flex-row">
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

          <div class="flex flex-col gap-6 xl:flex-row">
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

          <div>
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

          <div>
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
          <!-- Form Inputs based on step -->
        </div>
      </div>
    </div>

    <DefaultCard cardTitle="Material Terpakai">
      <div class="p-6.5">
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
          <div class="w-7/12">
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
          <div class="w-5/12">
            <label
              class="mb-3 block text-sm font-medium text-black dark:text-white"
              v-if="index === 0"
            >
              Qty. Dipakai
            </label>
            <input
              v-if="data.label === 'ONT' && data.qty === 1"
              disabled
              type="text"
              placeholder="SN Number"
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              v-model="data.snNumber"
              @change="validateQtyKeluar(index)"
            />
            <input
              v-else
              disabled
              type="number"
              placeholder="Qty"
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              v-model="data.qty"
              @change="validateQtyKeluar(index)"
            />
          </div>
        </div>
        <div v-else>
          Material Masih belum Digunakan!
        </div>
      </div>
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
