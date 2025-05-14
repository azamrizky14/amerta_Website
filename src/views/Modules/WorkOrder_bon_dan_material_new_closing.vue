<script setup lang="ts">
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import vSelect from "vue-select";
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Swal from "sweetalert2";

import { useRoute } from "vue-router";
import { getDateToday } from "@/stores/date";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";
import {
  adminTeknis_UpdateData,
  lokasi_getAllLocationWithStatus,
  adminTeknis_GetDataById,
  stock_CreateSh,
} from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import router from "@/router";

const route = useRoute();
const indexStore = useIndexStore();

const pageTitle = ref("Closing Bon & Material");
const pageList = ref(["Work Order", "Bon & Material", "Closing"]);

const soList = ref([]);
const itemList = ref([]);

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

  Tr_teknis_status: "closed", // otomatis
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

const shouldShowTypeLabel = (index) => {
  const tipe = savedData.value.Tr_teknis_work_order_kembali[
    index
  ].Sh_item_tipe?.toLowerCase();
  if (tipe === "aset" || tipe === "material") return false;

  if (index === 0) return true;
  const currentType = savedData.value.Tr_teknis_work_order_kembali[index].Sh_item_tipe;
  const previousType =
    savedData.value.Tr_teknis_work_order_kembali[index - 1].Sh_item_tipe;
  return currentType !== previousType;
};

onMounted(async () => {
  await getData();

  // Step 1: Inisialisasi ulang Tr_teknis_work_order_kembali berdasarkan Tr_teknis_work_order_tersedia
  savedData.value.Tr_teknis_work_order_kembali = savedData.value.Tr_teknis_work_order_tersedia.map(
    (x) => ({
      ...x,
      Sh_item_qty: x.Sh_item_qty ?? 0, // sisa awal = qty tersedia
      Sh_item_qty_sisa: 0, // default jumlah yang dipakai = 0
      Sh_item_properties:
        x.Sh_item_properties?.map((p) => ({
          ...p,
          item_properties_qty_sisa: p.item_properties_qty ?? 0,
        })) || [],
    })
  );

  // Step 2: Jika ada material yang sudah terpakai, kurangi qty_sisa dan isi qty (dipakai)
  if (
    savedData.value.Tr_teknis_work_order_tersedia &&
    savedData.value.Tr_teknis_work_order_terpakai &&
    savedData.value.Tr_teknis_work_order_terpakai.length > 0
  ) {
    const mergedMaterials = savedData.value.Tr_teknis_work_order_terpakai.flatMap(
      (item) => item.Tr_teknis_work_order_terpakai_material || []
    );

    mergedMaterials.forEach((material) => {
      const existingItem = savedData.value.Tr_teknis_work_order_kembali.find(
        (item) => item.Sh_item_jenis === material.Sh_item_jenis
      );
      if (existingItem) {
        existingItem.Sh_item_qty_sisa += material.Sh_item_qty; // jumlah yang sudah dipakai
        existingItem.Sh_item_qty -= material.Sh_item_qty_sisa; // kurangi sisa

        if (existingItem.Sh_item_qty < 0) {
          existingItem.Sh_item_qty = 0;
        }
      }
      const tipe = material.Sh_item_tipe || ""; // tipe item seperti 'Kabel'

      // ===> Untuk Modem/Tiang: Hapus properti yang sudah dipakai
      if (["Modem", "Tiang"].includes(tipe)) {
        if (
          !existingItem.Sh_item_properties ||
          existingItem.Sh_item_properties.length === 0
        )
          return;

        const usedProps = Array.isArray(material.Sh_item_properties)
          ? material.Sh_item_properties
          : [material.Sh_item_properties];

        const usedPropIds = usedProps.map((prop) => prop.item_properties_id);

        existingItem.Sh_item_properties = existingItem.Sh_item_properties.filter(
          (prop) => !usedPropIds.includes(prop.item_properties_id)
        );

        return;
      }

      // ===> Penanganan khusus untuk tipe Kabel
      if (tipe === "Kabel" && material.Sh_item_properties) {
        const usedProps = Array.isArray(material.Sh_item_properties)
          ? material.Sh_item_properties
          : [material.Sh_item_properties];

        if (!existingItem.Sh_item_properties) return;

        usedProps.forEach((usedProp) => {
          const match = existingItem.Sh_item_properties.find(
            (prop) => prop.item_properties_id === usedProp.item_properties_id
          );
          if (match) {
            const usedQty = usedProp.item_properties_qty || 0;
            match.item_properties_qty_sisa =
              (match.item_properties_qty_sisa ?? match.item_properties_qty ?? 0) -
              usedQty;

            if (match.item_properties_qty_sisa < 0) match.item_properties_qty_sisa = 0;
          }
        });
      }
    });
  }
  // Kosongkan item_properties_qty dan Sh_item_qty_sisa untuk keperluan input user
  savedData.value.Tr_teknis_work_order_kembali.forEach((item) => {
    item.Sh_item_qty = ""; // kosongkan sisa qty di UI

    if (Array.isArray(item.Sh_item_properties)) {
      item.Sh_item_properties = item.Sh_item_properties.map((prop) => ({
        ...prop,
        item_properties_qty: "", // kosongkan qty yang akan diisi ulang
        item_properties_qty_sisa: prop.item_properties_qty_sisa, // pertahankan sisa untuk referensi
      }));
    }
  });

  // Step 3: Set user dan tanggal close
  savedData.value.Tr_teknis_user_closed = indexStore.user.userName;
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.Tr_teknis_closed = date;

  savedData.value.Tr_teknis_work_order_retur = [];

  (savedData.value.Tr_teknis_work_order_terpakai || []).forEach((item) => {
    const returItems = item.Tr_teknis_work_order_retur || [];

    returItems.forEach((retur) => {
      const existingItem = savedData.value.Tr_teknis_work_order_retur.find(
        (x) => x.Sh_item_id === retur.Sh_item_id && x.Sh_item_tipe === retur.Sh_item_tipe
      );

      if (existingItem) {
        // Gabungkan qty
        existingItem.Sh_item_qty =
          (existingItem.Sh_item_qty || 0) + (retur.Sh_item_qty || 0);

        // Gabungkan properties
        const newProps = Array.isArray(retur.Sh_item_properties)
          ? retur.Sh_item_properties
          : [];
        const existingProps = Array.isArray(existingItem.Sh_item_properties)
          ? existingItem.Sh_item_properties
          : [];

        existingItem.Sh_item_properties = [...existingProps, ...newProps];
      } else {
        savedData.value.Tr_teknis_work_order_retur.push({
          ...retur,
          Sh_item_properties: Array.isArray(retur.Sh_item_properties)
            ? [...retur.Sh_item_properties]
            : [],
          Sh_item_qty: retur.Sh_item_qty || 0,
        });
      }
    });
  });

  console.log(savedData.value);
});

// Array validator untuk field wajib
const dataValidator = ref([
  { key: "Tr_teknis_item", label: "Nama Tas" },
  { key: "Tr_teknis_jenis", label: "Jenis Permintaan" },
]);

const formatSendData = (data) => {
  return data.map((x) => {
    if (x.Sh_item_tipe === "Tiang" || x.Sh_item_tipe === "Modem") {
      const data = { ...x };
      const qtyDipakai = x.snNumber ? x.snNumber.length : 0;

      data.Sh_item_qty = qtyDipakai;
      data.Sh_item_properties = x.snNumber ? x.snNumber : [];

      delete data.qtySisa;
      delete data.Sh_item_qty_dipakai;
      delete data.Sh_item_qty_sisa;
      delete data.snNumber;
      delete data.qty;
      return data;
    } else if (x.Sh_item_tipe === "Kabel") {
      const data = { ...x };
      data.Sh_item_properties = data.Sh_item_properties.map((kabel) => {
        const dataKabel = {
          item_properties_id: kabel.item_properties_id,
          item_properties_image: kabel.item_properties_image || "",
          item_properties_note: kabel.item_properties_note || "",
          item_properties_qty: kabel.item_properties_qty ? kabel.item_properties_qty : 0,
        };
        return dataKabel;
      });
      const qtyDipakai =
        data.Sh_item_properties.filter((kabel) => kabel.item_properties_qty > 0)
          .length || 0;

      // const qtyDipakai = x.Sh_item_properties ? x.Sh_item_properties.length : 0;

      data.Sh_item_qty = qtyDipakai;

      delete data.qtySisa;
      delete data.Sh_item_qty_dipakai;
      delete data.Sh_item_qty_sisa;
      delete data.qty;
      return data;
    } else {
      const qtyDipakai = x.Sh_item_qty ? x.Sh_item_qty : 0;
      const data = { ...x };
      data.Sh_item_qty = qtyDipakai;
      delete data.Sh_item_qty_sisa;
      delete data.qtySisa;
      delete data.qty;

      return data;
    }
  });
};

const getData = async () => {
  let data = await adminTeknis_GetDataById(route.params.id);
  if (data.Tr_teknis_images) {
    data = { ...data, ...data.Tr_teknis_images };
    delete data.Tr_teknis_images;
  }

  savedData.value = data;

  const dataSo = await lokasi_getAllLocationWithStatus(
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode,
    "N"
  );

  soList.value = dataSo;
};

const dataError = ref([]); // Array untuk menyimpan error

// Validasi qtyKeluar tidak boleh kurang dari 1
const validateQtyKeluar = (index, qtySisa) => {
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  if (
    savedData.value.Tr_teknis_work_order_kembali[index].qty !== "" &&
    (savedData.value.Tr_teknis_work_order_kembali[index].qty < 0 ||
      savedData.value.Tr_teknis_work_order_kembali[index].qty > qtySisa)
  ) {
    Swal.fire({
      title: "Error!",
      text: "Jumlah input harus antara 0 - " + qtySisa,
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      savedData.value.Tr_teknis_work_order_kembali[index].qty = 0;
    });
  }
};

const cancelClose = async () => {
  const result = await Swal.fire({
    title: "Batalkan Closing?",
    text: "anda yakin membatalkan closing data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await router.push("/modules/work-order/bon-dan-material");
  }
};

const formatForSh = (data) => {
  const {
    Tr_teknis_work_order_kembali,
    Tr_teknis_work_order_retur,
    Tr_teknis_logistik_id,
    Tr_teknis_tanggal,
    Tr_teknis_user_created,
  } = data;

  const result1 = Tr_teknis_work_order_kembali.filter((x) => x.Sh_item_qty > 0).map(
    (item) => {
      return {
        Sh_item_id: item.Sh_item_id,
        Sh_item_nama: item.Sh_item_nama,
        Sh_item_jenis: item.Sh_item_jenis,
        Sh_item_qty: item.Sh_item_qty,
        Sh_item_satuan: item.Sh_item_satuan,
        Sh_item_tipe: item.Sh_item_tipe,
        Sh_item_properties: item.Sh_item_properties || [],
        Sh_item_status: "intangible", // asumsi default
        Sh_type: "out", // asumsi default
        Sh_location_from: "floating-" + Tr_teknis_logistik_id, // contoh: "Gudang Pasuruan"
        Sh_location_to: itemList.value.lokasi_nama, // asumsi default
        Sh_source: "bon-material-closing",
        Sh_source_id: Tr_teknis_logistik_id,
        companyName: indexStore.user.companyName,
        companyCode: indexStore.user.companyCode,
        Sh_keterangan: "",
        Sh_created_date: Tr_teknis_tanggal,
        Sh_user_created: Tr_teknis_user_created,
        Sh_deleted: "N",
      };
    }
  );
  const result2 = Tr_teknis_work_order_retur.filter((x) => x.Sh_item_qty > 0).map(
    (item) => {
      return {
        Sh_item_id: item.Sh_item_id,
        Sh_item_nama: item.Sh_item_nama,
        Sh_item_jenis: item.Sh_item_jenis,
        Sh_item_qty: item.Sh_item_qty,
        Sh_item_satuan: item.Sh_item_satuan,
        Sh_item_tipe: item.Sh_item_tipe,
        Sh_item_properties: item.Sh_item_properties || [],
        Sh_item_status: "intangible", // asumsi default
        Sh_type: "out", // asumsi default
        Sh_location_from: "floating-" + Tr_teknis_logistik_id, // contoh: "Gudang Pasuruan"
        Sh_location_to: itemList.value.lokasi_nama, // asumsi default
        Sh_source: "bon-material-closing",
        Sh_source_id: Tr_teknis_logistik_id,
        companyName: indexStore.user.companyName,
        companyCode: indexStore.user.companyCode,
        Sh_keterangan: "retur dari pelangggan",
        Sh_created_date: Tr_teknis_tanggal,
        Sh_user_created: Tr_teknis_user_created,
        Sh_deleted: "N",
      };
    }
  );

  return result1.concat(result2);
};

const submitData = async () => {
  console.log(savedData.value);
  // Clear previous errors
  dataError.value.splice(0, dataError.value.length);

  // Validasi field wajib dari data utama
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key] || savedData.value[validator.key].length === 0) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  if (itemList.value && itemList.value.length <= 0) {
    dataError.value.push(`Pilih Lokasi Tujuan Barang!`);
  }
  // Jika ada error, tampilkan di halaman dan hentikan submit
  if (dataError.value.length > 0) {
    return; // Jangan lanjutkan jika ada error
  }

  // Jika tidak ada error, lanjutkan dengan SweetAlert konfirmasi
  const result = await Swal.fire({
    title: "Closing Data?",
    text: "Apakah Anda yakin ingin menutup data ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Closing!",
    cancelButtonText: "Batalkan",
  });

  if (result.isConfirmed) {
    try {
      showLoading();

      const fixData = { ...savedData.value };
      fixData.Tr_teknis_status = "closed";

      fixData.Tr_teknis_work_order_kembali = formatSendData(
        fixData.Tr_teknis_work_order_kembali
      );
      fixData.Tr_teknis_work_order_retur = formatSendData(
        fixData.Tr_teknis_work_order_retur
      );
      console.log("data yang dikirim", fixData);
      const dataForSh = formatForSh(fixData);
      console.log(dataForSh);

      await adminTeknis_UpdateData(fixData, route.params.id);
      await stock_CreateSh(dataForSh);
      await successCreate().then(() => {
        router.push("/modules/work-order/bon-dan-material");
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
        <DefaultCard cardTitle="Detail Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="">
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
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="List Material Kembali">
          <div class="p-6.5">
            <div class="flex flex-col gap-3">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Lokasi Tujuan Barang
                </label>
                <v-select
                  v-model="itemList"
                  :options="soList"
                  :clearable="false"
                  label="lokasi_nama"
                  placeholder="Pilih Lokasi Barang"
                  class="w-full mb-3 rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <template #selected-option>
                    <span class="dark:text-white">{{ itemList.lokasi_nama }}</span>
                  </template>
                </v-select>
              </div>
            </div>
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in savedData.Tr_teknis_work_order_kembali"
              :key="index"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <!-- Nama Barang -->
              <div class="w-6/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  {{ shouldShowTypeLabel(index) ? data.Sh_item_tipe : "Nama Barang" }}
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
                  v-if="index === 0 || shouldShowTypeLabel(index)"
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
                    :value="prop?.item_properties_qty_sisa"
                  />
                </template>
                <template v-else>
                  <input
                    disabled
                    type="number"
                    placeholder="Qty"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :value="data.Sh_item_qty_sisa"
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
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  Terpakai
                </label>
                <template
                  v-if="data.Sh_item_tipe === 'Kabel'"
                  v-for="(prop, i) in data.Sh_item_properties"
                >
                  <input
                    :disabled="prop.item_properties_qty_sisa <= 0"
                    type="number"
                    placeholder="Qty"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :class="i > 0 ? 'mt-2' : ''"
                    v-model="prop.item_properties_qty"
                  />
                </template>
                <template v-else>
                  <input
                    :disabled="data.Sh_item_qty_sisa <= 0"
                    type="number"
                    placeholder="Qty"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    v-model="data.Sh_item_qty"
                    @input="handleInput(index, data.Sh_item_qty_dipakai)"
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
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  Kode Barang
                </label>
                <v-select
                  :disabled="data.Sh_item_qty <= 0"
                  v-model="data.snNumber"
                  :clearable="false"
                  multiple
                  :options="data.Sh_item_properties ? data.Sh_item_properties : []"
                  label="item_properties_id"
                  placeholder="Pilih Data"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                </v-select>
              </div>
            </div>

            <div>
              <label
                class="mb-3 pt-6.5 block text-sm font-medium text-black dark:text-white"
              >
                Catatan Closing
              </label>
              <textarea
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_keterangan_closing"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <DefaultCard cardTitle="List Pengembalian Barang">
          <div class="p-6.5">
            <div
              class="flex flex-col gap-2 xl:flex-row"
              v-for="(data, index) in savedData.Tr_teknis_work_order_retur"
              :key="index"
              :class="index === 0 ? '' : 'pt-2'"
            >
              <!-- Nama Barang -->
              <div class="w-6/12">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  {{ shouldShowTypeLabel(index) ? data.Sh_item_tipe : "Nama Barang" }}
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
                  v-if="index === 0 || shouldShowTypeLabel(index)"
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
                    :value="prop?.item_properties_qty_sisa"
                  />
                </template>
                <template v-else>
                  <input
                    disabled
                    type="number"
                    placeholder="Qty"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :value="data.Sh_item_qty_sisa"
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
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  Terpakai
                </label>
                <template
                  v-if="data.Sh_item_tipe === 'Kabel'"
                  v-for="(prop, i) in data.Sh_item_properties"
                >
                  <input
                    :disabled="prop.item_properties_qty_sisa <= 0"
                    type="number"
                    placeholder="Qty"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    :class="i > 0 ? 'mt-2' : ''"
                    v-model="prop.item_properties_qty"
                  />
                </template>
                <template v-else>
                  <input
                    :disabled="data.Sh_item_qty_sisa <= 0"
                    type="number"
                    placeholder="Qty"
                    class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1 px-3 pr-1 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    v-model="data.Sh_item_qty"
                    @input="handleInput(index, data.Sh_item_qty_dipakai)"
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
                  v-if="index === 0 || shouldShowTypeLabel(index)"
                >
                  Kode Barang
                </label>
                <v-select
                  :disabled="data.Sh_item_qty <= 0"
                  v-model="data.snNumber"
                  multiple
                  :clearable="false"
                  :options="data.Sh_item_properties ? data.Sh_item_properties : []"
                  label="item_properties_id"
                  placeholder="Pilih Data"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                </v-select>
              </div>
            </div>

            <div class="hidden">
              <label
                class="mb-3 pt-6.5 block text-sm font-medium text-black dark:text-white"
              >
                Catatan Pengembalian
              </label>
              <textarea
                rows="3"
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_teknis_keterangan_retur"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
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
            <button
              @click="cancelClose"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batalkan
            </button>
            <button
              @click="submitData"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Closing Data
            </button>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
    </div>

    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
