<script setup lang="ts">
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import {
  item_getAllItemWithStatus,
  stock_GetPrefixByDate,
  lokasi_getAllLocationWithStatus,
  stock_getDataForSO,
  stock_CreateSo,
  stock_CreateSh,
  removeMultiTempImage,
} from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import router from "@/router";
import { mdiPlusCircle, mdiTrashCan } from "@mdi/js";

const indexStore = useIndexStore();

const pageTitle = ref("Tambah Stock Opname");
const pageList = ref(["Warehouse", "Stock Opname", "Tambah"]);

// Saved Data
const savedData = ref({
  Tr_po_id: "",
  Tr_po_status: "open",
  Tr_po_keterangan: "",
  Tr_po_lokasi: "",
  Tr_po_item: [],

  Tr_po_created: "",
  Tr_po_tanggal: "",
  Tr_po_deleted: "N",
  Tr_qa_inspection_date: "",
  Tr_qa_user_created: indexStore.user.userName,
  companyName: indexStore.user.companyName,
  companyCode: indexStore.company.companyCode,
});

const itemList = ref([]);

const items = ref<Row[]>([]);
const itemsKabel = ref<Row[]>([]);
const itemsModem = ref<Row[]>([]);
const itemsTiang = ref<Row[]>([]);

const itemsQty = ref("");
const itemsKabelQty = ref({
  item_total: "",
  properties_qty: [],
});
const itemsModemQty = ref({
  item_total: "",
  properties_qty: [],
});
const itemsTiangQty = ref({
  item_total: "",
  properties_qty: [],
});

const lokasiList = ref([]);
const soList = ref([]);

const changeRowItem = (type, index, value, cat) => {
  // console.log("tes", type, index, value);
  let data;
  if (type === "id") {
    data = itemList.value.find((x) => x.item_id === value);
  } else if (type === "nama") {
    data = itemList.value.find((x) => x.item_nama === value);
  }
  if (data && cat === "Modem") {
    const updatedData = {
      Sh_item_id: data.item_id,
      Sh_item_nama: data.item_nama,
      Sh_item_satuan: data.item_satuan,
      Sh_item_tipe: data.item_tipe,
      Sh_item_properties: [
        {
          item_properties_id: "",
          item_properties_image: "",
          item_properties_note: "",
          is_deleted: false,
        },
      ],
      item_jenis: "",
      item_keterangan: "",
      Sh_item_qty: 0,
      item_jumlah: 0,
      item_jumlah_akhir: 0,
      item_status: "intangible",
      is_deleted: false,
    };
    itemsModem.value[index] = updatedData;
  } else if (data && cat === "Tiang") {
    const updatedData = {
      Sh_item_id: data.item_id,
      Sh_item_nama: data.item_nama,
      Sh_item_satuan: data.item_satuan,
      Sh_item_tipe: data.item_tipe,
      Sh_item_properties: [
        {
          item_properties_id: "",
          item_properties_image: "",
          item_properties_note: "",
          is_deleted: false,
        },
      ],
      item_jenis: "",
      item_keterangan: "",
      Sh_item_qty: 0,
      item_jumlah: 0,
      item_jumlah_akhir: 0,
      item_status: "intangible",
      is_deleted: false,
    };
    itemsTiang.value[index] = updatedData;
  } else if (data && cat === "Kabel") {
    const updatedData = {
      Sh_item_id: data.item_id,
      Sh_item_nama: data.item_nama,
      Sh_item_satuan: data.item_satuan,
      Sh_item_tipe: data.item_tipe,
      Sh_item_properties: [
        {
          item_properties_id: "",
          item_properties_image: "",
          item_properties_note: "",
          item_properties_qty: "",
          item_properties_qty_akhir: "",
          is_deleted: false,
        },
      ],
      item_jenis: "",
      item_keterangan: "",
      Sh_item_qty: 0,
      item_jumlah: 0,
      item_jumlah_akhir: 0,
      item_status: "intangible",
      is_deleted: false,
    };
    itemsKabel.value[index] = updatedData;
  } else if (data) {
    const updatedData = {
      Sh_item_id: data.item_id,
      Sh_item_nama: data.item_nama,
      Sh_item_satuan: data.item_satuan,
      Sh_item_tipe: data.item_tipe,
      Sh_item_properties: [],
      item_jenis: "",
      item_keterangan: "",
      Sh_item_qty: 0,
      item_jumlah: 0,
      item_jumlah_akhir: 0,
      item_status: "intangible",
      is_deleted: false,
    };
    items.value[index] = updatedData;
  }
};
const convertSoItemsToStockLog = (data, baseFields) => {
  const history = [];

  data.forEach((item) => {
    const {
      Sh_item_properties = [],
      item_jumlah = 0,
      item_jumlah_akhir = 0,
      is_deleted = false,
      Sh_item_tipe,
    } = item;

    // Poin 4: Jika tipe adalah Kabel, update qty
    if (Sh_item_tipe === "Kabel" && Array.isArray(Sh_item_properties)) {
      Sh_item_properties.forEach((prop) => {
        if (
          prop.item_properties_qty_akhir !== undefined &&
          prop.item_properties_qty_akhir !== "" &&
          !prop.is_deleted
        ) {
          prop.item_properties_qty = prop.item_properties_qty_akhir;
        }
      });
    }

    // Poin 1: Jika tidak ada properties
    if (Sh_item_properties.length === 0) {
      if (item_jumlah_akhir > item_jumlah) {
        const qty = item_jumlah_akhir - item_jumlah;
        history.push({
          ...baseFields,
          ...item,
          Sh_type: "in",
          Sh_item_qty: qty,
          Sh_item_properties: [],
          Sh_location_from: "stock-opname",
          Sh_location_to: baseFields.Sh_location,
        });
      } else if (item_jumlah_akhir < item_jumlah) {
        const qty = item_jumlah - item_jumlah_akhir;
        history.push({
          ...baseFields,
          ...item,
          Sh_type: "out",
          Sh_item_qty: qty,
          Sh_item_properties: [],
          Sh_location_from: baseFields.Sh_location,
          Sh_location_to: "stock-opname",
        });
      }

      if (is_deleted) {
        history.push({
          ...baseFields,
          ...item,
          Sh_type: "out",
          Sh_item_qty: item_jumlah,
          Sh_item_properties: [],
          Sh_location_from: baseFields.Sh_location,
          Sh_location_to: "stock-opname",
        });
      }

      return;
    }

    // Poin 2: Tambah properti yang in dari bawah
    if (Sh_item_properties.length > item_jumlah) {
      const selisih = Sh_item_properties.length - item_jumlah;
      const propsIn = [...Sh_item_properties]
        .reverse()
        .filter((prop) => !prop.is_deleted)
        .slice(0, selisih);

      if (propsIn.length > 0) {
        history.push({
          ...baseFields,
          ...item,
          Sh_type: "in",
          Sh_item_qty: propsIn.length,
          Sh_item_properties: propsIn,
          Sh_location_from: "stock-opname",
          Sh_location_to: baseFields.Sh_location,
        });
      }
    }

    // Poin 3: Hapus yang is_deleted = true
    const deletedProps = Sh_item_properties.filter((p) => p.is_deleted);
    if (deletedProps.length > 0) {
      deletedProps.forEach((prop) => {
        // Update qty jika tipe Kabel
        if (
          Sh_item_tipe === "Kabel" &&
          prop.item_properties_qty_akhir !== undefined &&
          prop.item_properties_qty_akhir !== ""
        ) {
          prop.item_properties_qty = prop.item_properties_qty_akhir;
        }

        history.push({
          ...baseFields,
          ...item,
          Sh_type: "out",
          Sh_item_qty: 1,
          Sh_item_properties: [prop],
          Sh_location_from: baseFields.Sh_location,
          Sh_location_to: "stock-opname",
        });
      });
    }
  });

  // 🔥 Hapus field item_properties_qty_akhir sebelum return
  history.forEach((entry) => {
    if (Array.isArray(entry.Sh_item_properties)) {
      entry.Sh_item_properties.forEach((prop) => {
        delete prop.item_properties_qty_akhir;
        delete prop.item_jumlah_akhir;
      });
    }
  });

  return history;
};

const addRow = (type, index) => {
  if (type === "items") {
    items.value.push({
      Sh_item_id: "",
      Sh_item_nama: "",
      Sh_item_satuan: "",
      Sh_item_tipe: "",
      Sh_item_properties: [],
      item_jenis: "",
      item_keterangan: "",
      Sh_item_qty: 0,
      item_jumlah: 0,
      item_jumlah_akhir: 0,
      item_status: "intangible",
      is_deleted: false,
    });
  } else if (type === "itemsModem") {
    if (index !== undefined) {
      itemsModem.value[index].Sh_item_properties.push({
        item_properties_id: "",
        item_properties_image: "",
        item_properties_note: "",
        is_deleted: false,
      });
    } else {
      itemsModem.value.push({
        Sh_item_id: "",
        Sh_item_nama: "",
        Sh_item_satuan: "",
        Sh_item_tipe: "",
        Sh_item_properties: [
          {
            item_properties_id: "",
            item_properties_image: "",
            item_properties_note: "",
            is_deleted: false,
          },
        ],
        item_jenis: "",
        item_keterangan: "",
        Sh_item_qty: 0,
        item_jumlah: 0,
        item_jumlah_akhir: 0,
        item_status: "intangible",
        is_deleted: false,
      });
    }
  } else if (type === "itemsTiang") {
    if (index !== undefined) {
      itemsTiang.value[index].Sh_item_properties.push({
        item_properties_id: "",
        item_properties_image: "",
        item_properties_note: "",
        is_deleted: false,
      });
    } else {
      itemsTiang.value.push({
        Sh_item_id: "",
        Sh_item_nama: "",
        Sh_item_satuan: "",
        Sh_item_tipe: "",
        Sh_item_properties: [
          {
            item_properties_id: "",
            item_properties_image: "",
            item_properties_note: "",
            is_deleted: false,
          },
        ],
        item_jenis: "",
        item_keterangan: "",
        Sh_item_qty: 0,
        item_jumlah: 0,
        item_jumlah_akhir: 0,
        item_status: "intangible",
        is_deleted: false,
      });
    }
  } else if (type === "itemsKabel") {
    if (index !== undefined) {
      itemsKabel.value[index].Sh_item_properties.push({
        item_properties_id: "",
        item_properties_image: "",
        item_properties_note: "",
        item_properties_qty: "",
        item_properties_qty_akhir: "",
        is_deleted: false,
      });
    } else {
      itemsKabel.value.push({
        Sh_item_id: "",
        Sh_item_nama: "",
        Sh_item_satuan: "",
        Sh_item_tipe: "",
        Sh_item_properties: [
          {
            item_properties_id: "",
            item_properties_image: "",
            item_properties_note: "",
            item_properties_qty: "",
            tiem_properties_qty_akhir: "",
            is_deleted: false,
          },
        ],
        item_jenis: "",
        item_keterangan: "",
        Sh_item_qty: 0,
        item_jumlah: 0,
        item_jumlah_akhir: 0,
        item_status: "intangible",
        is_deleted: false,
      });
    }
  }
};

const removeRow = (type, index, i) => {
  if (type === "items") {
    items.value.splice(index, 1);
  } else if (type === "itemsModem") {
    if (
      Array.isArray(itemsModem.value[index].Sh_item_properties) &&
      itemsModem.value[index].Sh_item_properties.length === 1
    ) {
      itemsModem.value.splice(index, 1);
    } else {
      itemsModem.value[index].Sh_item_properties.splice(i, 1);
    }
  } else if (type === "itemsTiang") {
    if (
      Array.isArray(itemsTiang.value[index].Sh_item_properties) &&
      itemsTiang.value[index].Sh_item_properties.length === 1
    ) {
      itemsTiang.value.splice(index, 1);
    } else {
      itemsTiang.value[index].Sh_item_properties.splice(i, 1);
    }
  } else if (type === "itemsKabel") {
    if (
      Array.isArray(itemsKabel.value[index].Sh_item_properties) &&
      itemsKabel.value[index].Sh_item_properties.length === 1
    ) {
      itemsKabel.value.splice(index, 1);
    } else {
      itemsKabel.value[index].Sh_item_properties.splice(i, 1);
    }
  }
};

onMounted(async () => {
  const data = await item_getAllItemWithStatus(
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode,
    "N"
  );
  itemList.value = data;
  const dataSo = await stock_getDataForSO(
    indexStore.user.companyCode,
    indexStore.user.hierarchyCode
  );
  soList.value = dataSo;

  const dataLokasi = await lokasi_getAllLocationWithStatus(
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode,
    "N"
  );
  lokasiList.value = dataLokasi;

  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_po_created = date;

  savedData.value.Tr_po_created = date;
});

const filterSelectedSo = (value) => {
  console.log(value);
  if (value === null || value === undefined) {
    savedData.value = {
      Tr_qa_user_created: indexStore.user.userName,
      companyName: indexStore.user.companyName,
      companyCode: indexStore.company.companyCode,
      Tr_qa_lokasi: "",
      Tr_qa_inspection_date: "",
    };
  } else if (value && value.lokasi_item) {
    // Buat map item_id => item_jumlah_qa dari Tr_pp_item
    const ppItemMap = {};

    // Buat itemList
    const itemList = value.lokasi_item.map((x) => {
      const item = {
        ...x,
        item_jumlah: ppItemMap[x.Sh_item_id] ?? x.Sh_item_qty,
        item_jumlah_akhir: ppItemMap[x.Sh_item_id] ?? x.Sh_item_qty,
        item_status: "intangible",
      };

      // Tambahkan is_deleted: false jika tipe Material atau Aset
      if (x.Sh_item_tipe === "Material" || x.Sh_item_tipe === "Aset") {
        item.is_deleted = false;
      }

      // Jika bukan Material/Aset dan ada properties, tambahkan is_deleted di setiap item_properties
      if (
        x.Sh_item_tipe !== "Material" &&
        x.Sh_item_tipe !== "Aset" &&
        Array.isArray(x.Sh_item_properties) &&
        x.Sh_item_properties.length > 0
      ) {
        item.Sh_item_properties = x.Sh_item_properties.map((prop) => ({
          ...prop,
          is_deleted: false,
        }));
        item.Sh_item_qty = item.Sh_item_properties.length
          ? item.Sh_item_properties.length
          : 0;
      }

      return item;
    });

    items.value = itemList.filter(
      (x) => x.Sh_item_tipe === "Material" || x.Sh_item_tipe === "Aset"
    );

    itemsModem.value = itemList.filter((x) => x.Sh_item_tipe === "Modem");

    itemsKabel.value = itemList.filter((x) => x.Sh_item_tipe === "Kabel");

    itemsTiang.value = itemList.filter((x) => x.Sh_item_tipe === "Tiang");

    itemsQty.value = Array.isArray(items.value) ? items.value.length : 10;

    itemsKabelQty.value.item_total = Array.isArray(itemsKabel.value)
      ? itemsKabel.value.length
      : 0;
    if (Array.isArray(itemsKabel.value)) {
      itemsKabel.value.forEach((x) => {
        itemsKabelQty.value.properties_qty.push(x.Sh_item_properties.length);
      });
    }
    console.log("item kabel", itemsKabelQty);
    itemsModemQty.value.item_total = Array.isArray(itemsModem.value)
      ? itemsModem.value.length
      : 0;
    if (Array.isArray(itemsModem.value)) {
      itemsModem.value.forEach((x) => {
        itemsModemQty.value.properties_qty.push(x.Sh_item_properties.length);
      });
    }
    console.log("item modem", itemsModemQty);
    itemsTiangQty.value.item_total = Array.isArray(itemsTiang.value)
      ? itemsTiang.value.length
      : 0;
    if (Array.isArray(itemsTiang.value)) {
      itemsTiang.value.forEach((x) => {
        itemsTiangQty.value.properties_qty.push(x.Sh_item_properties.length);
      });
    }
  }
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
    await router.push("/modules/work-order/warehouse/stock-opname");
  }
};

// Array validator untuk field wajib
const dataValidator = ref([
  { key: "lokasi_id", label: "Lokasi Opname" },
  { key: "So_tanggal", label: "Tgl. Inspeksi" },
]);

const dataError = ref([]); // Array untuk menyimpan error

const submitData = async () => {
  // Clear previous errors
  dataError.value.splice(0, dataError.value.length);

  // Validasi field wajib dari data utama
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key] || savedData.value[validator.key].length === 0) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  // Jika ada error, tampilkan di halaman dan hentikan submit
  if (dataError.value.length > 0) {
    return; // Jangan lanjutkan jika ada error
  }

  // Jika tidak ada error, lanjutkan dengan SweetAlert konfirmasi
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
    let uploadedTempFiles;
    try {
      showLoading();

      const fixData = { ...savedData.value };
      const dateToday = await getDateToday("yyyy-MM-dd");
      const QAprefix = await stock_GetPrefixByDate(dateToday);
      const SoData = {
        So_id: QAprefix.nextId,
        So_tanggal: dateToday,
        So_lokasi: fixData.lokasi_id,
        So_user: indexStore.user.userName,
        So_keterangan: fixData.Tr_qa_keterangan ? fixData.Tr_qa_keterangan : "",
        So_item: [...items.value],
        companyName: indexStore.user.companyName,
        companyCode: indexStore.user.companyCode,
        So_deleted: "N",
      };

      itemsModem.value.forEach((data) => {
        SoData.So_item.push(data);
      });
      itemsKabel.value.forEach((data) => {
        SoData.So_item.push(data);
      });
      itemsTiang.value.forEach((data) => {
        SoData.So_item.push(data);
      });

      const result = convertSoItemsToStockLog(SoData.So_item, {
        Sh_source: "stock_opname",
        Sh_location: SoData.So_lokasi,
        Sh_user_created: SoData.So_user,
        Sh_created_date: SoData.So_tanggal,
        Sh_deleted: "N",
      });
      await stock_CreateSo(SoData);
      await stock_CreateSh(result);
      await successCreate().then(() => {
        router.push("/modules/work-order/purchase/qa");
      });
    } catch (error) {
      if (uploadedTempFiles) {
        await removeMultiTempImage(uploadedTempFiles);
      }
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

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col gap-2 p-6.5 mb-1">
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="lg:w-2/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Lokasi Stock Opname
                </label>
                <v-select
                  v-model="savedData"
                  :options="soList"
                  :clearable="false"
                  label="lokasi_nama"
                  placeholder="Masukan Tujuan PO"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                  @update:modelValue="(value) => filterSelectedSo(value)"
                >
                  <template #selected-option>
                    <span class="dark:text-white">{{ savedData.lokasi_nama }}</span>
                  </template>
                </v-select>
              </div>
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Inspeksi
                </label>

                <input
                  type="date"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-2 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.So_tanggal"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Data Tambahan">
          <div class="flex flex-col gap-2 p-6.5">
            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Catatan
              </label>
              <textarea
                rows="1"
                placeholder="Masukan Catatan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.So_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <!-- Item Material & Aset -->
      <div class="col-span-2" v-if="items.length > 0">
        <DefaultCard cardTitle="List Material & Aset">
          <div>
            <!-- Tabel -->
            <div
              class="grid gap-0 grid-cols-[35px_130px_130px_70px_auto_107px_163px_163px_30px]"
            >
              <!-- Header -->
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="col-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Kuantitas (Jumlah)
              </div>
              <div
                class="p-1 row-span-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:text-primary"
                @click="addRow('items')"
              >
                <svg
                  class="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path :d="mdiPlusCircle" />
                </svg>
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Qty. Awal
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Qty. Akhir
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in items" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                  :class="row.is_deleted ? 'bg-danger text-white' : ''"
                >
                  {{ index + 1 }}
                </div>
                <!-- ID Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    v-if="index + 1 <= itemsQty"
                    disabled
                    type="text"
                    v-model="row.Sh_item_id"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                  <v-select
                    v-else
                    :disabled="index + 1 <= itemsQty"
                    v-model="row.Sh_item_id"
                    :options="
                      itemList.filter(
                        (x) => x.item_tipe === 'Material' || x.item_tipe === 'Aset'
                      )
                    "
                    :reduce="(item) => item.item_id"
                    :clearable="false"
                    label="item_id"
                    placeholder="Id Item"
                    class="relative custom-select w-full text-xs border-gray-300 rounded-md shadow-sm"
                    @update:modelValue="(value) => changeRowItem('id', index, value, '')"
                  >
                    <template #selected-option>
                      <span :class="row.is_deleted ? 'text-white' : 'dark:text-white'">{{
                        row.Sh_item_id
                      }}</span>
                    </template>
                  </v-select>
                </div>

                <!-- Nama Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    v-if="index + 1 <= itemsQty"
                    disabled
                    type="text"
                    v-model="row.Sh_item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                  <v-select
                    v-else
                    v-model="row.Sh_item_nama"
                    :options="
                      itemList.filter(
                        (x) => x.item_tipe === 'Material' || x.item_tipe === 'Aset'
                      )
                    "
                    :reduce="(item) => item.item_nama"
                    :clearable="false"
                    label="item_nama"
                    placeholder="Nama Item"
                    class="relative custom-select w-full text-xs border-gray-300 rounded-md shadow-sm"
                    @update:modelValue="
                      (value) => changeRowItem('nama', index, value, '')
                    "
                  >
                    <template #selected-option>
                      <span :class="row.is_deleted ? 'text-white' : 'dark:text-white'">{{
                        row.Sh_item_nama
                      }}</span>
                    </template>
                  </v-select>
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_satuan"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    :disabled="index + 1 <= itemsQty"
                    type="text"
                    v-model="row.Sh_item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <select
                    :disabled="index + 1 <= itemsQty"
                    v-model="row.item_status"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- Qty Datang -->
                <div
                  class="px-1 py-0 pr-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    :disabled="index + 1 <= itemsQty"
                    disabled
                    type="number"
                    v-model="row.item_jumlah"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>
                <!-- Qty Retur -->
                <div
                  class="px-1 py-0 pr-0 border border-gray-300"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <input
                    :disabled="row.is_deleted"
                    type="number"
                    v-model="row.item_jumlah_akhir"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.is_deleted
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                </div>

                <div
                  class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                  :class="row.is_deleted ? 'bg-danger' : ''"
                >
                  <button
                    v-if="index + 1 <= itemsQty"
                    @click="
                      (row.is_deleted = !row.is_deleted),
                        (row.item_jumlah_akhir = row.item_jumlah)
                    "
                    :class="row.is_deleted ? 'text-white' : ''"
                  >
                    <svg
                      class="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 23 23"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path :d="mdiTrashCan" />
                    </svg>
                  </button>
                  <button
                    v-else
                    @click="removeRow('items', index)"
                    :class="row.is_deleted ? 'text-white' : ''"
                  >
                    <svg
                      class="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 23 23"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path :d="mdiTrashCan" />
                    </svg>
                  </button>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Item Modem -->
      <div class="col-span-2" v-if="itemsModem.length > 0">
        <DefaultCard cardTitle="List Modem">
          <div>
            <!-- Tabel -->
            <div
              class="grid gap-0 grid-cols-[35px_130px_130px_70px_auto_107px_326px_30px]"
            >
              <!-- Header -->
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Detail Modem
              </div>
              <div
                class="p-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:text-primary"
                @click="addRow('itemsModem')"
              >
                <svg
                  class="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path :d="mdiPlusCircle" />
                </svg>
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsModem" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted)
                      ? 'bg-danger text-white'
                      : ''
                  "
                >
                  {{ index + 1 }}
                </div>
                <!-- ID Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    v-if="index + 1 <= itemsQty"
                    disabled
                    type="text"
                    v-model="row.Sh_item_id"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                  <v-select
                    v-else
                    :disabled="index + 1 <= itemsQty"
                    v-model="row.Sh_item_id"
                    :options="itemList.filter((x) => x.item_tipe === 'Modem')"
                    :reduce="(item) => item.item_id"
                    :clearable="false"
                    label="item_id"
                    placeholder="Id Item"
                    class="relative custom-select w-full text-xs border-gray-300 rounded-md shadow-sm"
                    @update:modelValue="
                      (value) => changeRowItem('id', index, value, 'Modem')
                    "
                  >
                    <template #selected-option>
                      <span
                        :class="
                          row.Sh_item_properties.every((x) => x.is_deleted)
                            ? 'text-white'
                            : 'dark:text-white'
                        "
                        >{{ row.Sh_item_id }}</span
                      >
                    </template>
                  </v-select>
                </div>

                <!-- Nama Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    v-if="index + 1 <= itemsQty"
                    disabled
                    type="text"
                    v-model="row.Sh_item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                  <v-select
                    v-else
                    v-model="row.Sh_item_nama"
                    :options="itemList.filter((x) => x.item_tipe === 'Modem')"
                    :reduce="(item) => item.item_nama"
                    :clearable="false"
                    label="item_nama"
                    placeholder="Nama Item"
                    class="relative custom-select w-full text-xs border-gray-300 rounded-md shadow-sm"
                    @update:modelValue="
                      (value) => changeRowItem('nama', index, value, 'Modem')
                    "
                  >
                    <template #selected-option>
                      <span
                        :class="
                          row.Sh_item_properties.every((x) => x.is_deleted)
                            ? 'text-white'
                            : 'dark:text-white'
                        "
                        >{{ row.Sh_item_nama }}</span
                      >
                    </template>
                  </v-select>
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_satuan"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    :disabled="index + 1 <= itemsQty"
                    type="text"
                    v-model="row.Sh_item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <select
                    :disabled="index + 1 <= itemsQty"
                    v-model="row.item_status"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- SN -->
                <div class="col-span-2 py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_135px_auto_30px]">
                    <!-- Header -->
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      No.
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Serial Number
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Catatan
                    </div>
                    <div
                      class="p-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:text-primary"
                      @click="addRow('itemsModem', index)"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 23 23"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path :d="mdiPlusCircle" />
                      </svg>
                    </div>
                    <template v-for="(props, i) in row.Sh_item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                        :class="props.is_deleted ? 'text-white bg-danger' : ''"
                      >
                        {{ i + 1 }}
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          :disabled="i + 1 <= itemsModemQty.properties_qty[index]"
                          type="text"
                          placeholder="Serial Number"
                          v-model="props.item_properties_id"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          :disabled="i + 1 <= itemsModemQty.properties_qty[index]"
                          type="text"
                          placeholder="Catatan"
                          v-model="props.item_properties_note"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <button
                          v-if="i + 1 <= itemsModemQty.properties_qty[index]"
                          @click="
                            (props.is_deleted = !props.is_deleted),
                              (props.item_jumlah_akhir = props.item_jumlah)
                          "
                          :class="props.is_deleted ? 'text-white' : ''"
                        >
                          <svg
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 23 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path :d="mdiTrashCan" />
                          </svg>
                        </button>
                        <button
                          v-else
                          @click="removeRow('itemsModem', index, i)"
                          :class="row.is_deleted ? 'text-white' : ''"
                        >
                          <svg
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 23 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path :d="mdiTrashCan" />
                          </svg>
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Item Tiang -->
      <div class="col-span-2" v-if="itemsTiang.length > 0">
        <DefaultCard cardTitle="List Tiang">
          <div>
            <!-- Tabel -->
            <div
              class="grid gap-0 grid-cols-[35px_130px_130px_70px_auto_107px_326px_30px]"
            >
              <!-- Header -->
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Detail Tiang
              </div>
              <div
                class="p-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:text-primary"
                @click="addRow('itemsTiang')"
              >
                <svg
                  class="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path :d="mdiPlusCircle" />
                </svg>
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsTiang" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted)
                      ? 'bg-danger text-white'
                      : ''
                  "
                >
                  {{ index + 1 }}
                </div>
                <!-- ID Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    v-if="index + 1 <= itemsQty"
                    disabled
                    type="text"
                    v-model="row.Sh_item_id"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                  <v-select
                    v-else
                    :disabled="index + 1 <= itemsQty"
                    v-model="row.Sh_item_id"
                    :options="itemList.filter((x) => x.item_tipe === 'Tiang')"
                    :reduce="(item) => item.item_id"
                    :clearable="false"
                    label="item_id"
                    placeholder="Id Item"
                    class="relative custom-select w-full text-xs border-gray-300 rounded-md shadow-sm"
                    @update:modelValue="
                      (value) => changeRowItem('id', index, value, 'Tiang')
                    "
                  >
                    <template #selected-option>
                      <span
                        :class="
                          row.Sh_item_properties.every((x) => x.is_deleted)
                            ? 'text-white'
                            : 'dark:text-white'
                        "
                        >{{ row.Sh_item_id }}</span
                      >
                    </template>
                  </v-select>
                </div>

                <!-- Nama Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    v-if="index + 1 <= itemsQty"
                    disabled
                    type="text"
                    v-model="row.Sh_item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                  <v-select
                    v-else
                    v-model="row.Sh_item_nama"
                    :options="itemList.filter((x) => x.item_tipe === 'Tiang')"
                    :reduce="(item) => item.item_nama"
                    :clearable="false"
                    label="item_nama"
                    placeholder="Nama Item"
                    class="relative custom-select w-full text-xs border-gray-300 rounded-md shadow-sm"
                    @update:modelValue="
                      (value) => changeRowItem('nama', index, value, 'Tiang')
                    "
                  >
                    <template #selected-option>
                      <span
                        :class="
                          row.Sh_item_properties.every((x) => x.is_deleted)
                            ? 'text-white'
                            : 'dark:text-white'
                        "
                        >{{ row.Sh_item_nama }}</span
                      >
                    </template>
                  </v-select>
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_satuan"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    :disabled="index + 1 <= itemsQty"
                    type="text"
                    v-model="row.Sh_item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <select
                    :disabled="index + 1 <= itemsQty"
                    v-model="row.item_status"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- SN -->
                <div class="col-span-2 py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_135px_auto_30px]">
                    <!-- Header -->
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      No.
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Kode Tiang
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Catatan
                    </div>
                    <div
                      class="p-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:text-primary"
                      @click="addRow('itemsTiang', index)"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 23 23"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path :d="mdiPlusCircle" />
                      </svg>
                    </div>
                    <template v-for="(props, i) in row.Sh_item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                        :class="props.is_deleted ? 'text-white bg-danger' : ''"
                      >
                        {{ i + 1 }}
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          :disabled="i + 1 <= itemsTiangQty.properties_qty[index]"
                          type="text"
                          placeholder="Kode Tiang"
                          v-model="props.item_properties_id"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          :disabled="i + 1 <= itemsTiangQty.properties_qty[index]"
                          type="text"
                          placeholder="Catatan"
                          v-model="props.item_properties_note"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <button
                          v-if="i + 1 <= itemsTiangQty.properties_qty[index]"
                          @click="
                            (props.is_deleted = !props.is_deleted),
                              (props.item_jumlah_akhir = props.item_jumlah)
                          "
                          :class="props.is_deleted ? 'text-white' : ''"
                        >
                          <svg
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 23 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path :d="mdiTrashCan" />
                          </svg>
                        </button>
                        <button
                          v-else
                          @click="removeRow('itemsTiang', index, i)"
                          :class="row.is_deleted ? 'text-white' : ''"
                        >
                          <svg
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 23 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path :d="mdiTrashCan" />
                          </svg>
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Item Kabel -->

      <!-- Item Kabel -->
      <div class="col-span-2" v-if="itemsKabel.length > 0">
        <DefaultCard cardTitle="List Kabel">
          <div>
            <!-- Tabel -->
            <div
              class="grid gap-0 grid-cols-[35px_130px_130px_70px_auto_107px_326px_30px]"
            >
              <!-- Header -->
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Serial Number (SN)
              </div>
              <div
                class="p-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:text-primary"
                @click="addRow('itemsKabel')"
              >
                <svg
                  class="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path :d="mdiPlusCircle" />
                </svg>
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsKabel" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted)
                      ? 'bg-danger text-white'
                      : ''
                  "
                >
                  {{ index + 1 }}
                </div>
                <!-- ID Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    v-if="index + 1 <= itemsQty"
                    disabled
                    type="text"
                    v-model="row.Sh_item_id"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                  <v-select
                    v-else
                    :disabled="index + 1 <= itemsQty"
                    v-model="row.Sh_item_id"
                    :options="itemList.filter((x) => x.item_tipe === 'Kabel')"
                    :reduce="(item) => item.item_id"
                    :clearable="false"
                    label="item_id"
                    placeholder="Id Item"
                    class="relative custom-select w-full text-xs border-gray-300 rounded-md shadow-sm"
                    @update:modelValue="
                      (value) => changeRowItem('id', index, value, 'Kabel')
                    "
                  >
                    <template #selected-option>
                      <span
                        :class="
                          row.Sh_item_properties.every((x) => x.is_deleted)
                            ? 'text-white'
                            : 'dark:text-white'
                        "
                        >{{ row.Sh_item_id }}</span
                      >
                    </template>
                  </v-select>
                </div>

                <!-- Nama Item -->
                <div
                  class="p-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    v-if="index + 1 <= itemsQty"
                    disabled
                    type="text"
                    v-model="row.Sh_item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ' bg-white dark:bg-boxdark'
                    "
                  />
                  <v-select
                    v-else
                    v-model="row.Sh_item_nama"
                    :options="itemList.filter((x) => x.item_tipe === 'Kabel')"
                    :reduce="(item) => item.item_nama"
                    :clearable="false"
                    label="item_nama"
                    placeholder="Nama Item"
                    class="relative custom-select w-full text-xs border-gray-300 rounded-md shadow-sm"
                    @update:modelValue="
                      (value) => changeRowItem('nama', index, value, 'Kabel')
                    "
                  >
                    <template #selected-option>
                      <span
                        :class="
                          row.Sh_item_properties.every((x) => x.is_deleted)
                            ? 'text-white'
                            : 'dark:text-white'
                        "
                        >{{ row.Sh_item_nama }}</span
                      >
                    </template>
                  </v-select>
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.Sh_item_satuan"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <input
                    :disabled="index + 1 <= itemsQty"
                    type="text"
                    v-model="row.Sh_item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300"
                  :class="
                    row.Sh_item_properties.every((x) => x.is_deleted) ? 'bg-danger' : ''
                  "
                >
                  <select
                    :disabled="index + 1 <= itemsQty"
                    v-model="row.item_status"
                    class="w-full px-2 py-0 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    :class="
                      row.Sh_item_properties.every((x) => x.is_deleted)
                        ? 'bg-danger text-white'
                        : ''
                    "
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- SN -->
                <div class="col-span-2 py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_auto_75px_75px_30px]">
                    <!-- Header -->
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      No.
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Kode Kabel
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Awal
                    </div>
                    <div
                      class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
                    >
                      Akhir
                    </div>
                    <div
                      class="p-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:text-primary"
                      @click="addRow('itemsKabel', index)"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 23 23"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path :d="mdiPlusCircle" />
                      </svg>
                    </div>
                    <template v-for="(props, i) in row.Sh_item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                        :class="props.is_deleted ? 'text-white bg-danger' : ''"
                      >
                        {{ i + 1 }}
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          :disabled="i + 1 <= itemsKabelQty.properties_qty[index]"
                          type="text"
                          placeholder="Kode Kabel"
                          v-model="props.item_properties_id"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          disabled
                          type="number"
                          placeholder="0"
                          v-model="props.item_properties_qty"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="px-1 py-0 border border-gray-300 text-sm"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <input
                          :disabled="props.is_deleted ? true : false"
                          type="number"
                          placeholder="0"
                          v-model="props.item_properties_qty_akhir"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                          :class="
                            props.is_deleted
                              ? 'bg-danger text-white'
                              : ' bg-white dark:bg-boxdark dark:text-white'
                          "
                        />
                      </div>
                      <div
                        class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                        :class="props.is_deleted ? 'bg-danger' : ''"
                      >
                        <button
                          v-if="i + 1 <= itemsKabelQty.properties_qty[index]"
                          @click="
                            (props.is_deleted = !props.is_deleted),
                              (props.item_jumlah_akhir = props.item_jumlah)
                          "
                          :class="props.is_deleted ? 'text-white' : ''"
                        >
                          <svg
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 23 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path :d="mdiTrashCan" />
                          </svg>
                        </button>
                        <button
                          v-else
                          @click="removeRow('itemsKabel', index, i)"
                          :class="row.is_deleted ? 'text-white' : ''"
                        >
                          <svg
                            class="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 23 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path :d="mdiTrashCan" />
                          </svg>
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
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
.v-select .vs__dropdown-menu {
  z-index: 50 !important; /* Atur sesuai kebutuhan */
  position: absolute !important;
}
</style>
